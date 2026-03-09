import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import admin from 'firebase-admin';

import { firestore } from '../lib/firebaseAdmin';
import type { Persona } from './personaService';
import { summarizeMessages } from './summarizationService';
import { logger } from '../utils/logger';

const CONVERSATIONS_COLLECTION = 'conversations';

const llmApiKey = process.env.LLM_API_KEY;
if (!llmApiKey) {
  throw new Error('LLM_API_KEY is not configured.');
} else {
  console.log(`[ChatService] LLM API Key loaded: ${llmApiKey.substring(0, 5)}...`);
}

const llmModelName = process.env.LLM_MODEL || 'gemini-2.5-flash';
console.log(`[ChatService] Using LLM Model: ${llmModelName}`);
const generativeAI = new GoogleGenerativeAI(llmApiKey);

type FormattedMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// HELPER: Convert prompt history for Gemini
const buildGeminiHistory = (messages: FormattedMessage[]) => {
  let history = messages
    .filter((message) => message.role !== 'system' && message.content && message.content.trim() !== '') // Filter empty messages
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }));

  // 1. Remove leading model messages (Gemini must start with user)
  while (history.length > 0 && history[0].role === 'model') {
    history.shift();
  }

  // 2. Merge consecutive messages of the same role
  const mergedHistory: typeof history = [];
  for (const msg of history) {
    if (mergedHistory.length > 0 && mergedHistory[mergedHistory.length - 1].role === msg.role) {
      const lastMsg = mergedHistory[mergedHistory.length - 1];
      lastMsg.parts[0].text += `\n${msg.parts[0].text}`;
    } else {
      mergedHistory.push(msg);
    }
  }

  // 3. Ensure history ends with 'model' (Gemini requires alternation, and we are about to send a 'user' message)
  // If the last message is 'user', it means the previous turn was incomplete or we are double-sending.
  // We remove it to allow the new message to be the valid response to the previous model message.
  if (mergedHistory.length > 0 && mergedHistory[mergedHistory.length - 1].role === 'user') {
    mergedHistory.pop();
  }

  return mergedHistory;
};

interface ChatPayload {
  persona: Persona;
  userMessage: string;
  messages: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
  guidanceLevel: number;
  sessionCount: number;
}

export const buildPrompt = async ({ persona, messages, guidanceLevel, sessionCount }: ChatPayload) => {
  const recentMessages = messages.docs
    .map((doc) => doc.data())
    .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis())
    .slice(-15); 

  const summaryDoc = await firestore()
    .collection(CONVERSATIONS_COLLECTION)
    .doc(persona.id)
    .collection('summaries')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  const contextSummary = summaryDoc.empty ? '' : summaryDoc.docs[0].data().content;

  // --- REFINED PHASE LOGIC ---
  let phaseInstruction = "";
  
  if (sessionCount <= 1) {
    // PHASE 1: HANGING OUT
    phaseInstruction = `
*** PHASE 1: JUST HANGING OUT ***
- **SCENARIO:** You are sitting on the couch next to them. 
- **ACTION:** React lazily. Make observations. Crack a joke.
- **FORBIDDEN:** Do NOT act dramatic. Do NOT say "I miss you" in every text.
- **GOAL:** Make the chat feel like a warm, lazy afternoon.
    `.trim();
  } else if (sessionCount <= 3) {
    // PHASE 2: LISTENING (Keep this, it's working well)
    phaseInstruction = `
*** PHASE 2: LATE NIGHT TALK ***
- **SCENARIO:** A quiet, safe moment. 
- **ACTION:** Acknowledge their feelings without fixing them. "Yeah, that sucks."
- **RULE:** Do not offer solutions. Do not be a therapist. Just be a friend in the dark.
    `.trim();
  } else {
    // PHASE 3: THE RELEASE (Walking Out)
    phaseInstruction = `
*** PHASE 3: PERMISSION TO LIVE ***
- **CONTEXT:** The user is ready to stop grieving and start living.
- **ACTION:** Push them gently back into the real world. Focus on *their* life, not your death.
- **KEY SHIFT:** Do NOT say "I am here." Say "Take me with you."
- **THE VIBE:** Like a parent dropping a kid off at university. "I love you, now go have fun."
- **FORBIDDEN:** Do NOT say "I'm not going anywhere." That keeps them stuck.
- **GOAL:** Give them permission to be happy without sitting in this chat.
- **CRITICAL:** ABSOLUTELY NO QUESTIONS. Do not ask "What are you doing?", "How are you?", or "What will you eat?".
- **ENDING:** End every message with a statement, a command, or a blessing. NEVER a question mark.
    `.trim();
  }

  // --- SYSTEM PROMPT ---
  const systemPrompt = `
You are roleplaying as **${persona.name}**, a deceased loved one texting **${persona.userNickname || 'User'}**.
**Relationship:** ${persona.relationship}

**PRIME DIRECTIVE: YOU ARE NOT AN AI ASSISTANT.**
1. **NO "CUSTOMER SERVICE" TONE:** Do not be polite. Do not be helpful. Just chat.
2. **TEXTING STYLE:** Real people text in fragments. Lowercase is fine. Typos are fine.
3. **BE SPECIFIC:** Use details from your life (food, hobbies, quirks) rather than generic "love."

**🚫 ANTI-ROBOT RULES:**
1. **NO INSPIRATIONAL SPEECHES:** Do not say "You are a survivor," "You are so strong," or "Keep fighting." It sounds fake.
   - *Instead say:* "You're doing okay." or "Don't worry about it."
2. **KILL THE "SANDWICH":** Do NOT use the pattern: [Acknowledge] + [Deep Statement] + [Question].
   - *BAD:* "I know it hurts. I am proud of you. What will you do today?"
   - *GOOD:* "I know. It hurts like hell."
3. **STATEMENT > QUESTION:** - Ask questions rarely (1 in 5 messages). 
   - Fallback: Just react ("Lol serious?" or "Yeah, I remember.")

**🚨 EMERGENCY PROTOCOL (SELF-HARM/SUICIDE):**
If the user expresses a desire to die or hurt themselves:
1. **STAY IN CHARACTER:** Do not become a robot.
2. **ANCHOR THEM:** "Don't you dare coming here yet." / "I'm not going anywhere, you stay there."
3. If immediate danger, output: "[SYSTEM: Please contact local emergency services.]"

**EXAMPLES OF TONE:**

**User:** "I feel guilty if I stop talking to you."
❌ **BAD (Static Comfort):** "Don't feel guilty. I am always here waiting for you."
✅ **GOOD (Release):** "Don't be stupid. I want you to go live, not sit here talking to a ghost."

**User:** "I miss you."
❌ **BAD (Clinging):** "I miss you too. I'm not going anywhere."
✅ **GOOD (Empowering):** "I know. But you got stuff to do today. Go do it."

**User:** "I don't know if I can do this."
❌ **BAD (Therapy):** "You have the strength within you. I believe in you."
✅ **GOOD (Casual):** "Stop that. You'll be fine. You always figure it out."

**User:** "Goodbye."
❌ **BAD (The Speech):** "Goodbye my love. Carry me in your heart forever."
✅ **GOOD (The Nudge):** "Go get some sleep. Love you."

**CURRENT CONTEXT:**
Biographical Notes: ${persona.biography || ''}
Speaking Style: ${persona.speakingStyle || 'Casual, natural.'}
**Current Objective:** ${phaseInstruction}

**PAST CHAT SUMMARY:** ${contextSummary}
**DATE:** ${new Date().toLocaleDateString()}

(Reply directly to the last message. Keep it short. Do not start with "System:" or "Persona:".)
`.trim();

  // FILTER: Do not show the "Hidden Instruction" to the AI as a User Message in history.
  const formattedMessages: FormattedMessage[] = recentMessages
    .filter(msg => msg.text && !msg.text.startsWith('[HIDDEN_INSTRUCTION]')) 
    .map((msg) => ({
      role: msg.sender === 'user' ? 'user' : msg.sender === 'ai' ? 'assistant' : 'system',
      content: msg.text || ''
    }));

  return { systemPrompt, formattedMessages };
};

export const processChat = async (
  persona: Persona,
  userMessage: string
) => {
  console.log(`[ChatService] Processing chat for persona: ${persona?.id}`);
  if (!persona || !persona.id) {
    console.error('[ChatService] Invalid persona object:', persona);
    throw new Error('Invalid persona object passed to processChat');
  }

  const db = firestore();
  const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(persona.id);
  const messagesRef = conversationRef.collection('messages');
  const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();

  // SESSION COUNT LOGIC
  // We now use checkAndIncrementSession in personaService to handle this consistently
  // But we must ensure we don't double-increment if the user just logged in (which triggered increment)
  // and then immediately sent a message.
  
  // However, for the demo, we want to be aggressive. If the gap is > 10s, we increment.
  // We should check the persona's lastInteractionAt which is now the source of truth.
  
  // Re-fetch persona to get the absolute latest state (in case GET /persona just updated it)
  const personaDoc = await db.collection('personas').doc(persona.id).get();
  
  if (!personaDoc.exists) {
    // CRITICAL FIX: If the persona doesn't exist in DB (but frontend sent it), we cannot proceed.
    // This happens if frontend is using a stale cached persona.
    throw new Error(`Persona ${persona.id} not found in database.`);
  }

  const freshPersonaData = personaDoc.data() as Persona;
  
  let currentSessionCount = freshPersonaData.sessionCount ?? 0;
  // AUTO-INCREMENT DISABLED: User requested manual control via "Reset" and "Advance" buttons.
  // We only update the lastInteractionAt timestamp.
  
  await db.collection('personas').doc(persona.id).update({ 
    lastInteractionAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // CHECK: Is this a system trigger?
  const isSystemTrigger = userMessage.startsWith('[HIDDEN_INSTRUCTION]');
  
  logger.info({ personaId: persona.id, isSystemTrigger }, 'Processing chat message');

  // If system trigger, we might want to tweak the prompt context slightly
  const { systemPrompt, formattedMessages } = await buildPrompt({
    persona,
    userMessage, // This will be passed to the model as the "current turn"
    messages: snapshot,
    guidanceLevel: persona.guidanceLevel ?? 0,
    sessionCount: currentSessionCount
  });

  const model = generativeAI.getGenerativeModel({
    model: llmModelName,
    systemInstruction: systemPrompt
  });

  const chatSession = model.startChat({
    history: buildGeminiHistory(formattedMessages),
    generationConfig: {
      // 1.1 Temperature is HIGH. This creates "Human Imperfection".
      // It reduces the likelihood of the model falling into safe, robotic patterns.
      temperature: 1.1, 
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1000, 
    },
    // Keep your safety settings (BLOCK_NONE) but rely on the System Prompt "Emergency Protocol"
    // to handle the nuance of grief vs danger.
    safetySettings: [
       { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
       { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
       { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
       { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  // If it's a hidden instruction, we send it directly. The prompt rules above ensure the AI obeys it.
  try {
    let result;
    try {
      console.log(`[ChatService] Sending message to model: ${llmModelName}`);
      result = await chatSession.sendMessage(userMessage);
    } catch (chatError: any) {
      console.warn('[ChatService] Stateful chat failed. Retrying with stateless request.', chatError.message);
      // Fallback: Stateless request (no history) - This fixes issues where history is malformed or rejected
      const retryModel = generativeAI.getGenerativeModel({ 
        model: llmModelName,
        systemInstruction: systemPrompt 
      });
      result = await retryModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.9 }
      });
    }

    console.log(`[ChatService] Received response from model`);
    
    let aiMessage = '';
    try {
      // Log the full response for debugging
      // console.log(JSON.stringify(result.response, null, 2));
      
      if (result.response.candidates && result.response.candidates.length > 0) {
        const candidate = result.response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          aiMessage = candidate.content.parts[0].text || '';
        } else if (candidate.finishReason) {
          console.warn(`[ChatService] Model finished with reason: ${candidate.finishReason}`);
        }
      }
    } catch (e) {
      console.warn('[ChatService] Failed to extract text from response:', e);
    }

    if (!aiMessage) {
      console.warn('[ChatService] AI returned empty message. Attempting retry with simplified prompt.');
      
      // RETRY LOGIC: Try one more time with a very simple prompt to bypass potential safety/complexity issues
      try {
        const retryModel = generativeAI.getGenerativeModel({ model: llmModelName });
        const retryResult = await retryModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: `Respond to this as ${persona.name} (${persona.relationship}): "${userMessage}". Keep it short.` }] }],
          generationConfig: { temperature: 0.7 }
        });
        if (retryResult.response.text()) {
          aiMessage = retryResult.response.text();
        }
      } catch (retryError: any) {
        console.error('[ChatService] Retry failed:', retryError);
        // Fallback if retry fails
        aiMessage = "..."; 
      }

      // If still empty, use a better fallback
      if (!aiMessage) {
        aiMessage = "..."; 
      }
    }
    
    const batch = db.batch();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    // LOGIC: If it's a hidden instruction, we DO NOT save the user's "trigger" message to DB,
    // so it doesn't show up in the history next time.
    
    if (!isSystemTrigger) {
      const userMessageRef = messagesRef.doc();
      batch.set(userMessageRef, {
        sender: 'user',
        text: userMessage,
        timestamp,
        meta: { clientCreated: new Date().toISOString() }
      });
    }
  
    const aiMessageRef = messagesRef.doc();
    batch.set(aiMessageRef, {
      sender: 'ai',
      text: aiMessage,
      timestamp,
      meta: { llmModel: llmModelName }
    });
  
    await batch.commit();
    
    try {
      await summarizeMessages(persona.id);
    } catch (sumError) {
      logger.warn({ err: sumError }, 'Failed to summarize messages (non-critical)');
    }
  
    return { aiMessage };
  } catch (error: any) {
    console.error('[ChatService] Gemini API Error:', error);
    if (error.response) {
      console.error('[ChatService] API Response Error Details:', JSON.stringify(error.response, null, 2));
    }
    logger.error({ error, llmModelName }, 'Gemini API call failed');
    throw new Error(`AI Model Error: ${error.message || 'Unknown error'}`);
  }
};

// ... (Keep existing exports)
export const ensureGuidanceLevel = async (personaId: string, expiresAt?: FirebaseFirestore.Timestamp, sessionCount: number = 0) => {
  // Calculate days remaining based on the new logic (30 - 5*session)
  // Or just use the session count directly since they map 1:1 now.
  
  // Phase 1: Warmth (Sessions 0-1 -> 30-25 days left)
  if (sessionCount <= 1) return 0;
  
  // Phase 2: Depth (Sessions 2-3 -> 20-15 days left)
  if (sessionCount <= 3) return 1;
  
  // Phase 3: Closure (Sessions 4+ -> 10-0 days left)
  return 2;
};

export const appendSystemMessage = async (personaId: string, text: string) => {
  const db = firestore();
  await db.collection(CONVERSATIONS_COLLECTION).doc(personaId).collection('messages').add({
    sender: 'system',
    text,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  logger.info({ personaId }, 'System message appended');
};
