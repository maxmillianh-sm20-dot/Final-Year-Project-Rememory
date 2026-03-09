import { Router } from 'express';
import Joi from 'joi';

import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createPersona, deletePersonaCascade, getPersonaByOwner, getAllPersonasByOwner, updatePersona, resetPersonaTimer, closePersona } from '../services/personaService';
import admin from 'firebase-admin';

import { setTimerIfNeeded, computeRemainingMs } from '../services/timerService';
import { firestore } from '../lib/firebaseAdmin';

const router = Router();

const editableFieldsCreate = {
  userNickname: Joi.string().max(120).allow('').required(),
  biography: Joi.string().max(50000).allow('').required(),
  speakingStyle: Joi.string().max(50000).allow('').required(),
  traits: Joi.array().items(Joi.string()).max(8).required(),
  keyMemories: Joi.array().items(Joi.string()).max(10).required(),
  commonPhrases: Joi.array().items(Joi.string()).max(10).required(),
  voiceSampleUrl: Joi.string().uri().allow('', null).optional(),
  avoidMedicalAdvice: Joi.boolean().optional(),
  avoidFinancialAdvice: Joi.boolean().optional(),
  avoidLegalAdvice: Joi.boolean().optional(),
  avoidPredictions: Joi.boolean().optional(),
  avoidPhysicalPresence: Joi.boolean().optional(),
  avoidComingBack: Joi.boolean().optional(),
  copingHabits: Joi.boolean().optional(),
  emotionalCheckin: Joi.boolean().optional(),
  groundingTechniques: Joi.boolean().optional()
};

const editableFieldsUpdate = {
  userNickname: Joi.string().max(120).allow(''),
  biography: Joi.string().max(50000).allow(''),
  speakingStyle: Joi.string().max(50000).allow(''),
  traits: Joi.array().items(Joi.string()).max(8),
  keyMemories: Joi.array().items(Joi.string()).max(10),
  commonPhrases: Joi.array().items(Joi.string()).max(10),
  voiceSampleUrl: Joi.string().uri().allow('', null),
  avoidMedicalAdvice: Joi.boolean(),
  avoidFinancialAdvice: Joi.boolean(),
  avoidLegalAdvice: Joi.boolean(),
  avoidPredictions: Joi.boolean(),
  avoidPhysicalPresence: Joi.boolean(),
  avoidComingBack: Joi.boolean(),
  copingHabits: Joi.boolean(),
  emotionalCheckin: Joi.boolean(),
  groundingTechniques: Joi.boolean()
};

const createPersonaSchema = Joi.object({
  name: Joi.string().max(120).required(),
  relationship: Joi.string().max(120).required(),
  ...editableFieldsCreate
});

const updatePersonaSchema = Joi.object({
  name: Joi.forbidden(),
  relationship: Joi.forbidden(),
  ...editableFieldsUpdate
}).min(1);

router.get('/list', async (req: AuthenticatedRequest, res) => {
  try {
    const personas = await getAllPersonasByOwner(req.user!.uid);
    return res.json(personas.map(p => ({
      id: p.id,
      name: p.name,
      relationship: p.relationship,
      status: p.status,
      createdAt: p.createdAt
    })));
  } catch (error) {
    console.error('Error fetching persona list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    console.log(`[Persona] GET / for user: ${req.user?.uid}`);
    
    // Check for skipIncrement query param (string 'true')
    const skipIncrement = req.query.skipIncrement === 'true';
    
    // Pass !skipIncrement to enable/disable auto-increment. 
    // Session progression is now automatic on login unless explicitly skipped (e.g. after reset).
    const persona = await getPersonaByOwner(req.user!.uid, !skipIncrement);
    console.log(`[Persona] Found: ${persona ? persona.id : 'null'}`);
    if (!persona) {
      return res.status(200).json(null);
    }
    const remainingMs = computeRemainingMs(persona.expiresAt ?? null);
    return res.json({
      id: persona.id,
      name: persona.name,
      relationship: persona.relationship,
      userNickname: persona.userNickname ?? '',
      biography: persona.biography ?? '',
      speakingStyle: persona.speakingStyle ?? '',
      status: persona.status,
      expiresAt: persona.expiresAt?.toDate().toISOString() ?? null,
      remainingMs,
      traits: persona.traits ?? [],
      keyMemories: persona.keyMemories ?? [],
      commonPhrases: persona.commonPhrases ?? [],
      voiceSampleUrl: persona.voiceSampleUrl ?? null,
      guidanceLevel: persona.guidanceLevel ?? 0,
      // Safety boundaries
      avoidMedicalAdvice: persona.avoidMedicalAdvice ?? false,
      avoidFinancialAdvice: persona.avoidFinancialAdvice ?? false,
      avoidLegalAdvice: persona.avoidLegalAdvice ?? false,
      avoidPredictions: persona.avoidPredictions ?? false,
      avoidPhysicalPresence: persona.avoidPhysicalPresence ?? false,
      avoidComingBack: persona.avoidComingBack ?? false,
      // Crisis Support (Step 8)
      copingHabits: persona.copingHabits ?? false,
      emotionalCheckin: persona.emotionalCheckin ?? false,
      groundingTechniques: persona.groundingTechniques ?? false
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    console.log(`[Persona] POST / create for user: ${req.user?.uid}`);
    const payload = await createPersonaSchema.validateAsync(req.body, { abortEarly: false });
    const personaId = await createPersona(req.user!.uid, payload);
    console.log(`[Persona] Created: ${personaId}`);
    return res.status(201).json({ id: personaId });
  } catch (error) {
    return next(error);
  }
});

router.put('/:personaId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = await updatePersonaSchema.validateAsync(req.body, { abortEarly: false });
    await updatePersona(req.params.personaId, req.user!.uid, payload);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post('/:personaId/start', async (req: AuthenticatedRequest, res, next) => {
  try {
    await setTimerIfNeeded(req.params.personaId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post('/:personaId/reset', async (req: AuthenticatedRequest, res, next) => {
  try {
    await resetPersonaTimer(req.params.personaId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

const deleteSchema = Joi.object({
  confirmation: Joi.string().required()
});

const CONFIRMATION_SENTENCE = 'I understand this will permanently delete my persona and messages.';

router.post('/:personaId/close', async (req: AuthenticatedRequest, res, next) => {
  try {
    const persona = await getPersonaByOwner(req.user!.uid, false);
    if (!persona || persona.id !== req.params.personaId) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    await closePersona(persona.id, req.body.answers || {});
    return res.json({ message: 'Persona closed successfully' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:personaId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { confirmation } = await deleteSchema.validateAsync(req.body);
    if (confirmation !== CONFIRMATION_SENTENCE) {
      return res.status(400).json({
        error: {
          code: 'confirmation_mismatch',
          message: 'Confirmation sentence mismatch.'
        }
      });
    }
    await firestore()
      .collection('audit/deletionRequests')
      .add({
        userId: req.user!.uid,
        personaId: req.params.personaId,
        confirmationText: confirmation,
        type: 'persona',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    await deletePersonaCascade(req.params.personaId, req.user!.uid);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

// DEV TOOLS: Reset Session
router.post('/:personaId/reset-session', async (req: AuthenticatedRequest, res, next) => {
  try {
    const persona = await getPersonaByOwner(req.user!.uid, false);
    if (!persona || persona.id !== req.params.personaId) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    await firestore().collection('personas').doc(persona.id).update({
      sessionCount: 0,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    return res.json({ message: 'Session reset to Day 30' });
  } catch (error) {
    return next(error);
  }
});

// DEV TOOLS: Advance Session
router.post('/:personaId/advance-session', async (req: AuthenticatedRequest, res, next) => {
  try {
    const persona = await getPersonaByOwner(req.user!.uid, false);
    if (!persona || persona.id !== req.params.personaId) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    const currentSession = (persona.sessionCount ?? 0) + 1;
    // Allow it to go to 0 or negative to test expiration
    const daysRemaining = 30 - (currentSession * 5);
    const newExpiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

    await firestore().collection('personas').doc(persona.id).update({
      sessionCount: currentSession,
      expiresAt: newExpiresAt,
      status: daysRemaining <= 0 ? 'expired' : 'active'
    });

    return res.json({ message: `Advanced to Session ${currentSession} (${daysRemaining} days left)` });
  } catch (error) {
    return next(error);
  }
});

export { router as personaRouter };
