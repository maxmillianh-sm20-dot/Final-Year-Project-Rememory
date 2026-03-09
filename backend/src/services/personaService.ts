import admin from 'firebase-admin';
import { firestore } from '../lib/firebaseAdmin';

const PERSONAS_COLLECTION = 'personas';
const CONVERSATIONS_COLLECTION = 'conversations';

export interface Persona {
  id: string;
  ownerId: string;
  name: string; // IDENTITY (LOCKED during edit)
  relationship: string; // IDENTITY (LOCKED during edit)
  userNickname: string; // How they call the user (Editable)
  biography: string; // Life story (Editable)
  speakingStyle: string; // Mannerisms (Editable)
  traits: string[];
  keyMemories: string[];
  commonPhrases: string[];
  voiceSampleUrl?: string;
  status: 'active' | 'expired' | 'deleted' | 'completed';
  createdAt: FirebaseFirestore.Timestamp;
  startedAt?: FirebaseFirestore.Timestamp;
  expiresAt?: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
  closureAnswers?: Record<string, string>;
  guidanceLevel?: number;
  sessionCount?: number;
  lastInteractionAt?: FirebaseFirestore.Timestamp;

  // Safety boundaries
  avoidMedicalAdvice?: boolean;
  avoidFinancialAdvice?: boolean;
  avoidLegalAdvice?: boolean;
  avoidPredictions?: boolean;
  avoidPhysicalPresence?: boolean;
  avoidComingBack?: boolean;

  // Crisis Support (Step 8)
  copingHabits?: boolean;
  emotionalCheckin?: boolean;
  groundingTechniques?: boolean;
}

export const checkAndIncrementSession = async (personaId: string, forceIncrement: boolean = false): Promise<Persona | null> => {
  const db = firestore();
  const personaRef = db.collection(PERSONAS_COLLECTION).doc(personaId);

  let updatedPersona: Persona | null = null;

  await db.runTransaction(async (t) => {
    const doc = await t.get(personaRef);
    if (!doc.exists) return;

    const rawData = doc.data() as Omit<Persona, 'id'>;
    // Ensure arrays and strings are defined to prevent crashes
    const data = {
      ...rawData,
      traits: rawData.traits || [],
      keyMemories: rawData.keyMemories || [],
      commonPhrases: rawData.commonPhrases || [],
      userNickname: rawData.userNickname || '',
      biography: rawData.biography || '',
      speakingStyle: rawData.speakingStyle || ''
    };
    const now = Date.now();

    // DEMO MODE: Increment on every "Login" (forceIncrement=true)
    // But prevent rapid-fire decrements (e.g. page refresh spam) by checking lastInteractionAt
    if (forceIncrement) {
      const lastInteraction = data.lastInteractionAt?.toMillis() ?? 0;
      // 5 minute cooldown between automatic session decrements
      // const COOLDOWN_MS = 5 * 60 * 1000; 
      
      // if (now - lastInteraction < COOLDOWN_MS) {
      //   console.log(`[Session] Skipping auto-decrement (Cooldown active: ${(now - lastInteraction) / 1000}s elapsed)`);
      //   // Just return existing data without update
      //   updatedPersona = { id: personaId, ...data };
      // } else {
        const currentSession = (data.sessionCount ?? 0) + 1;
        // 30 days base, -5 days per session
        // Allow it to go to 0 or negative to test expiration
        const daysRemaining = 30 - (currentSession * 5);
        const newExpiresAt = admin.firestore.Timestamp.fromMillis(now + daysRemaining * 24 * 60 * 60 * 1000);

        t.update(personaRef, {
          sessionCount: currentSession,
          expiresAt: newExpiresAt,
          status: daysRemaining <= 0 ? 'expired' : 'active',
          lastInteractionAt: admin.firestore.FieldValue.serverTimestamp()
        });

        updatedPersona = { id: personaId, ...data, sessionCount: currentSession, expiresAt: newExpiresAt, status: daysRemaining <= 0 ? 'expired' : 'active' };
      // }
    } else {
      // Just update interaction time
      t.update(personaRef, {
        lastInteractionAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updatedPersona = { id: personaId, ...data };
    }
  });

  return updatedPersona;
};

export const getAllPersonasByOwner = async (ownerId: string) => {
  const snapshot = await firestore()
    .collection(PERSONAS_COLLECTION)
    .where('ownerId', '==', ownerId)
    .where('status', '!=', 'deleted')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Persona, 'id'>) }));
};

export const getPersonaByOwner = async (ownerId: string, isLogin: boolean = false) => {
  console.log(`[Debug] getPersonaByOwner called for: ${ownerId} (isLogin: ${isLogin})`);
  
  // Fetch ALL non-deleted personas for this user
  const snapshot = await firestore()
    .collection(PERSONAS_COLLECTION)
    .where('ownerId', '==', ownerId)
    .where('status', '!=', 'deleted')
    .get();

  if (snapshot.empty) {
    return null;
  }

  // Sort logic:
  // 1. Priority: 'active' status
  // 2. Priority: Most recently created
  const personas = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Persona, 'id'>) }));
  
  personas.sort((a, b) => {
    // Active comes first
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    
    // Then sort by creation date (newest first)
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeB - timeA;
  });

  const selectedPersona = personas[0];

  // Run the session check logic ONLY if it's an active persona
  if (selectedPersona.status === 'active') {
    const updated = await checkAndIncrementSession(selectedPersona.id, isLogin);
    if (updated) {
      return updated;
    }
  }

  return selectedPersona;
};

export const createPersona = async (ownerId: string, data: Omit<Persona, 'id' | 'ownerId' | 'createdAt' | 'status'>) => {
  const allPersonas = await getAllPersonasByOwner(ownerId);
  
  // 1. Check Account Freeze / Limit (Max 3 Personas)
  if (allPersonas.length >= 3) {
    throw Object.assign(new Error('Account limit reached. You can only create up to 3 personas.'), { status: 403, code: 'account_limit_reached' });
  }

  // 2. Check Duplicate Relationships
  const newRel = data.relationship.trim().toLowerCase();
  const isSibling = newRel.includes('sister') || newRel.includes('brother') || newRel.includes('sibling');
  
  const sameRelCount = allPersonas.filter(p => p.relationship.trim().toLowerCase() === newRel).length;

  if (isSibling) {
    // Allow up to 2 siblings of the same type (e.g. 2 sisters)
    if (sameRelCount >= 2) {
      throw Object.assign(new Error(`You can only create up to 2 personas with the relationship "${data.relationship}".`), { status: 400, code: 'duplicate_relationship' });
    }
  } else {
    // Strict 1-per-type for others (Mom, Dad, etc.)
    if (sameRelCount >= 1) {
      throw Object.assign(new Error(`You already have a persona with the relationship "${data.relationship}".`), { status: 400, code: 'duplicate_relationship' });
    }
  }

  const docRef = await firestore().collection(PERSONAS_COLLECTION).add({
    ...data,
    ownerId,
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    sessionCount: 0
  });

  return docRef.id;
};

export const updatePersona = async (personaId: string, ownerId: string, updates: Partial<Persona>) => {
  const docRef = firestore().collection(PERSONAS_COLLECTION).doc(personaId);
  const doc = await docRef.get();

  if (!doc.exists || doc.data()?.ownerId !== ownerId) {
    throw Object.assign(new Error('Persona not found'), { status: 404, code: 'persona_not_found' });
  }

  // SECURITY: Prevent changing identity fields during an update
  if (updates.name || updates.relationship) {
    throw Object.assign(new Error('Cannot edit identity fields (Name/Relationship) to preserve immersion.'), { status: 400, code: 'identity_locked' });
  }

  await docRef.update(updates);
};

export const markPersonaStarted = async (personaId: string) => {
  const docRef = firestore().collection(PERSONAS_COLLECTION).doc(personaId);
  await firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    if (!doc.exists) {
      throw Object.assign(new Error('Persona not found'), { status: 404, code: 'persona_not_found' });
    }
    const data = doc.data()!;
    if (data.startedAt) return;
    const startedAt = admin.firestore.FieldValue.serverTimestamp();
    // Initial Expiry: 30 days
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000);
    transaction.update(docRef, { startedAt, expiresAt, guidanceLevel: 0, sessionCount: 0 });
  });
};

export const deletePersonaCascade = async (personaId: string, ownerId: string) => {
  const db = firestore();
  const personaRef = db.collection(PERSONAS_COLLECTION).doc(personaId);
  const personaDoc = await personaRef.get();
  if (!personaDoc.exists || personaDoc.data()?.ownerId !== ownerId) {
    throw Object.assign(new Error('Persona not found'), { status: 404, code: 'persona_not_found' });
  }

  await db.runTransaction(async (transaction) => {
    transaction.delete(personaRef);
  });

  const messagesQuery = await db.collection(CONVERSATIONS_COLLECTION).doc(personaId).collection('messages').get();
  const batch = db.batch();
  messagesQuery.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  await db.collection(CONVERSATIONS_COLLECTION).doc(personaId).delete();
};

export const resetPersonaTimer = async (personaId: string) => {
  const db = firestore();
  const personaRef = db.collection(PERSONAS_COLLECTION).doc(personaId);

  await db.runTransaction(async (t) => {
    const doc = await t.get(personaRef);
    if (!doc.exists) return;

    const now = Date.now();
    // Reset to full 30 days
    const expiresAt = admin.firestore.Timestamp.fromMillis(now + 30 * 24 * 60 * 60 * 1000);

    t.update(personaRef, {
      sessionCount: 0,
      guidanceLevel: 0,
      expiresAt: expiresAt,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      lastInteractionAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
};
export const closePersona = async (personaId: string, answers: Record<string, string>) => {
  const db = firestore();
  const personaRef = db.collection(PERSONAS_COLLECTION).doc(personaId);

  await personaRef.update({
    status: 'completed',
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
    closureAnswers: answers
  });
};
