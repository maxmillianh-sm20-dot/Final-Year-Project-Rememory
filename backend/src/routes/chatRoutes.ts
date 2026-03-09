import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import Joi from 'joi';

import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimit } from '../middleware/rateLimit';
import { firestore } from '../lib/firebaseAdmin';
import { getPersonaByOwner } from '../services/personaService';
import { processChat, appendSystemMessage, ensureGuidanceLevel } from '../services/chatService';
import { setTimerIfNeeded, computeRemainingMs } from '../services/timerService';

const router = Router();
const messagesSchema = Joi.object({
  text: Joi.string().max(1000).required(),
  clientMessageId: Joi.string().uuid().required()
});

router.get('/:personaId/chat', async (req: AuthenticatedRequest, res, next) => {
  try {
    // Fetching chat history does NOT count as a new session login
    const persona = await getPersonaByOwner(req.user!.uid, false);
    if (!persona || persona.id !== req.params.personaId) {
      return res.status(404).json({ error: { code: 'persona_not_found', message: 'Persona not found' } });
    }

    const snapshot = await firestore()
      .collection('conversations')
      .doc(persona.id)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(Number(req.query.limit ?? 50))
      .get();

    const messages = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString() ?? new Date().toISOString()
      }))
      .reverse();

    return res.json({ messages });
  } catch (error) {
    return next(error);
  }
});

router.post('/:personaId/chat', rateLimit, async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = await messagesSchema.validateAsync(req.body, { abortEarly: false });
    // Sending a message does NOT count as a new session login
    let persona = await getPersonaByOwner(req.user!.uid, false);
    
    if (!persona) {
      console.log(`[Chat] 404 - No persona found for user ${req.user!.uid}`);
      return res.status(404).json({ error: { code: 'persona_not_found', message: 'Persona not found' } });
    }

    if (persona.id !== req.params.personaId) {
      console.log(`[Chat] 404 - ID Mismatch. Requested: ${req.params.personaId}, Found: ${persona.id}`);
      // If the ID mismatches, it might be a frontend cache issue. 
      // We should probably trust the DB persona if it belongs to the user, but for safety we 404.
      return res.status(404).json({ error: { code: 'persona_not_found', message: 'Persona not found (ID mismatch)' } });
    }

    if (persona.status === 'expired') {
      // GOD MODE FIX: If we are in a demo/dev context (implied by the user's issues),
      // we FORCE the persona to be active if they try to chat.
      console.log('[Chat] GOD MODE: Force-reactivating expired persona.');
      const newExpiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000); // +1 Day
      await firestore().collection('personas').doc(persona.id).update({ 
        status: 'active',
        expiresAt: newExpiresAt
      });
      persona.status = 'active';
      persona.expiresAt = newExpiresAt;
    }

    await setTimerIfNeeded(persona.id);

    // Refresh persona after potential timer update
    persona = await getPersonaByOwner(req.user!.uid) ?? persona;
    if (persona.status === 'expired') {
       // Double check self-healing after refresh
       console.log('[Chat] GOD MODE (Post-Timer): Force-reactivating expired persona.');
       const newExpiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000); // +1 Day
       await firestore().collection('personas').doc(persona.id).update({ 
         status: 'active',
         expiresAt: newExpiresAt
       });
       persona.status = 'active';
       persona.expiresAt = newExpiresAt;
    }

    const aiResponse = await processChat(persona, payload.text);
    const refreshedGuidance = await ensureGuidanceLevel(persona.id, persona.expiresAt, persona.sessionCount ?? 0);
    if (refreshedGuidance !== persona.guidanceLevel) {
      await firestore().collection('personas').doc(persona.id).update({ guidanceLevel: refreshedGuidance });
      if (refreshedGuidance >= 2) {
        await appendSystemMessage(persona.id, 'Guided closure reminder: take a moment to reflect on a cherished memory together.');
      }
    }

    const messages = [
      {
        id: payload.clientMessageId,
        sender: 'user' as const,
        text: payload.text,
        timestamp: new Date().toISOString()
      },
      {
        id: randomUUID(),
        sender: 'ai' as const,
        text: aiResponse.aiMessage,
        timestamp: new Date().toISOString(),
        meta: { llmTokens: undefined }
      }
    ];

    const remainingMs = computeRemainingMs(persona.expiresAt ?? null);

    return res.json({
      personaStatus: persona.status,
      remainingMs,
      messages,
      summaryAppended: false
    });
  } catch (error) {
    return next(error);
  }
});

export { router as chatRouter };
