import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebaseService';
import { AppRoute, Message, Persona, TOTAL_DAYS, UserState } from '../types';

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, '');
const API_STATIC_BEARER = import.meta.env.VITE_API_STATIC_BEARER ?? '';
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const PERSONA_CACHE_KEY = 'rememory_persona_cache';
const STATE_CACHE_KEY = 'rememory_state_ui';

interface AppContextType {
  state: UserState;
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  login: (email: string, password: string, isSignup?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  createPersona: (data: Omit<Persona, 'id' | 'createdAt' | 'expiryDate'>) => Promise<void>;
  updatePersona: (data: Partial<Persona>) => Promise<void>;
  addMessage: (text: string, role: Message['role']) => void;
  sendMessage: (text: string, options?: { hidden?: boolean }) => Promise<string | null>;
  daysRemaining: number;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  reloadPersona: (skipIncrement?: boolean) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
  isSending: boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const splitList = (input: string, fallback: string, limit = 10) => {
  const entries = input.split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
  return entries.length === 0 ? [fallback] : Array.from(new Set(entries)).slice(0, limit);
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  // Wait for Auth to be ready if we are in a transient state
  if (!auth.currentUser) {
    // Wait for onAuthStateChanged to fire at least once
    await new Promise<void>(resolve => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe();
        resolve();
      });
    });
  }

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : API_STATIC_BEARER;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizePersona = (data: any): Persona => {
  const remainingDays = typeof data.remainingMs === 'number'
    ? Math.max(0, Math.ceil(data.remainingMs / MS_IN_DAY))
    : data.remainingDays;

  const traitsArray = Array.isArray(data.traits) ? data.traits : [];
  const memoriesArray = Array.isArray(data.keyMemories) ? data.keyMemories : [];

  return {
    id: data.id,
    name: data.name,
    relationship: data.relationship,
    age: data.age ?? '',
    traits: traitsArray.join(', '),
    memories: memoriesArray.join(', '),
    voiceStyle: data.voiceStyle || data.speakingStyle || '',
    createdAt: data.expiresAt ? Date.parse(data.expiresAt) : Date.now(),
    expiryDate: data.expiresAt ? Date.parse(data.expiresAt) : Date.now() + TOTAL_DAYS * MS_IN_DAY,
    avatarUrl: data.avatarUrl || data.voiceSampleUrl || undefined,
    remainingDays,
    status: data.status,
    userNickname: data.userNickname || '',
    biography: data.biography || '',
    speakingStyle: data.speakingStyle || '',
    keyMemories: memoriesArray,
    commonPhrases: Array.isArray(data.commonPhrases) ? data.commonPhrases : [],
    voiceSampleUrl: data.voiceSampleUrl ?? null,
    guidanceLevel: data.guidanceLevel,
    avoidMedicalAdvice: data.avoidMedicalAdvice,
    avoidFinancialAdvice: data.avoidFinancialAdvice,
    avoidLegalAdvice: data.avoidLegalAdvice,
    avoidPredictions: data.avoidPredictions,
    avoidPhysicalPresence: data.avoidPhysicalPresence,
    avoidComingBack: data.avoidComingBack,
    copingHabits: data.copingHabits,
    emotionalCheckin: data.emotionalCheckin,
    groundingTechniques: data.groundingTechniques,
  };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UserState>(() => {
    const cached = localStorage.getItem(STATE_CACHE_KEY);
    return cached
      ? JSON.parse(cached)
      : {
        isAuthenticated: false,
        userEmail: '',
        hasOnboarded: false,
        persona: null,
        messages: [],
        guidedReflectionAnswers: {},
      };
  });
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    // Check URL params first for password reset
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'resetPassword' || params.get('oobCode')) {
      return AppRoute.RESET_PASSWORD;
    }

    // Don't auto-redirect on initial load - let user navigate naturally
    // Check localStorage for last route, or default to LANDING
    const cached = localStorage.getItem(STATE_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.hasOnboarded && parsed.persona) {
          return AppRoute.DASHBOARD;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return AppRoute.LANDING;
  });
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    localStorage.setItem(STATE_CACHE_KEY, JSON.stringify(state));
  }, [state]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
      if (user) {
        // Only update auth state if user is actually logged in via Firebase
        // Don't auto-redirect if user is on LOGIN page
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          userEmail: user.email || '',
        }));
      } else {
        // Only update if user explicitly logged out
        // Don't override if they're already logged in via email
        if (!state.isAuthenticated) {
          setState((prev) => ({
            ...prev,
            isAuthenticated: false,
            userEmail: '',
          }));
        }
      }
    });
    return () => unsubscribe();
  }, [state.isAuthenticated]);

  const fetchMessages = useCallback(async (personaId: string): Promise<Message[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/persona/${personaId}/chat?limit=50`, {
        headers: await getAuthHeaders(),
      });

      if (!res.ok) {
        console.warn('Failed to fetch messages, status:', res.status);
        return [];
      }
      const data = await res.json();
      const history = (data.messages || []).filter((m: any) => !m.text?.startsWith('[HIDDEN_INSTRUCTION]'));
      return history.map((m: any) => ({
        id: m.id || crypto.randomUUID(),
        role: m.sender === 'ai' ? 'model' : m.sender,
        text: m.text,
        timestamp: m.timestamp ? Date.parse(m.timestamp) : Date.now(),
      }));
    } catch (e) {
      console.error('Error fetching messages:', e);
      return [];
    }
  }, []);

  const loadPersona = useCallback(async (skipRouteCheck = false, forceAuth = false, skipIncrement = false) => {
    if (!state.isAuthenticated && !forceAuth) return;
    // Don't auto-load persona if we're on LOGIN page (unless explicitly requested)
    if (!skipRouteCheck && currentRoute === AppRoute.LOGIN) return;

    setLoading(true);
    try {
      const url = skipIncrement ? `${API_BASE_URL}/persona?skipIncrement=true` : `${API_BASE_URL}/persona`;
      const res = await fetch(url, { headers: await getAuthHeaders() });
      if (!res.ok) {
        if (res.status === 404) {
          // CRITICAL: If backend says 404, the persona is GONE. Do not use cache.
          console.warn('Persona not found on server. Clearing cache.');
          localStorage.removeItem(PERSONA_CACHE_KEY);
          setState((prev) => ({ ...prev, hasOnboarded: false, persona: null, messages: [] }));
          return;
        }

        // For other errors (500, network), we might fallback to cache if needed, 
        // but for now let's be safe and assume no persona to prevent "Ghost" chats.
        const cached = localStorage.getItem(PERSONA_CACHE_KEY);
        if (cached) {
          try {
            const cachedPersona = JSON.parse(cached);
            setState((prev) => ({
              ...prev,
              hasOnboarded: true,
              persona: cachedPersona,
            }));
          } catch (e) {
            // Invalid cache, clear it
            localStorage.removeItem(PERSONA_CACHE_KEY);
          }
        } else {
          // No cache, no persona exists
          setState((prev) => ({ ...prev, hasOnboarded: false, persona: null, messages: [] }));
        }
        return;
      }

      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        // No persona exists

        // SAFETY CHECK: If we have a local persona that was created < 1 minute ago, 
        // ignore this "Not Found" from the server as it might be replication lag.
        const cached = localStorage.getItem(PERSONA_CACHE_KEY);
        if (cached) {
          try {
            const p = JSON.parse(cached);
            if (p && p.createdAt && (Date.now() - p.createdAt < 60000)) {
              console.log('Ignoring 404 from server due to recent creation (Eventual Consistency protection)');
              return;
            }
          } catch (e) { }
        }

        setState((prev) => ({ ...prev, hasOnboarded: false, persona: null, messages: [] }));
        localStorage.removeItem(PERSONA_CACHE_KEY);
        // Don't redirect if user is on LOGIN or SETUP page
        if (currentRoute !== AppRoute.SETUP && currentRoute !== AppRoute.LOGIN) {
          setCurrentRoute(AppRoute.LANDING);
        }
        return;
      }

      // Persona exists
      const persona = normalizePersona(data);
      localStorage.setItem(PERSONA_CACHE_KEY, JSON.stringify(persona));
      const messages = await fetchMessages(persona.id);

      setState((prev) => ({
        ...prev,
        hasOnboarded: true,
        persona,
        messages,
        guidedReflectionAnswers: {},
      }));

      // FORCE REDIRECT TO CLOSURE IF EXPIRED
      if (persona.status === 'expired' || persona.status === 'completed') {
        if (currentRoute !== AppRoute.CLOSURE) {
          console.log('Persona expired/completed. Redirecting to Closure.');
          setCurrentRoute(AppRoute.CLOSURE);
        }
      } 
      // Only auto-redirect from LANDING to DASHBOARD if persona loads and is active
      else if (currentRoute === AppRoute.LANDING) {
        setCurrentRoute(AppRoute.DASHBOARD);
      }
    } catch (err) {
      console.error('Error loading persona:', err);
      // On network error, DO NOT clear state if we already have it.
      // Only clear if we really think the user is invalid.
      // setState((prev) => ({ ...prev, hasOnboarded: false, persona: null, messages: [] }));
    } finally {
      setLoading(false);
    }
  }, [currentRoute, fetchMessages, state.isAuthenticated]);

  useEffect(() => {
    // Load persona when authenticated, but skip LOGIN page
    // LOGIN page will manually trigger loadPersona after successful login
    // Also skip if we already have a persona loaded to prevent auto-decrement on route changes
    if (state.isAuthenticated && currentRoute !== AppRoute.LOGIN && !state.persona) {
      loadPersona();
    }
  }, [currentRoute, loadPersona, state.isAuthenticated, state.persona]);

  const createPersona = useCallback(
    async (data: Omit<Persona, 'id' | 'createdAt' | 'expiryDate'>) => {
      const payload = {
        name: data.name,
        relationship: data.relationship,
        biography: data.biography || data.memories || '',
        speakingStyle: data.voiceStyle || data.speakingStyle || '',
        userNickname: data.userNickname || '',
        traits: splitList(data.traits, 'Kind', 8),
        keyMemories: splitList(data.memories || '', 'Memory', 10),
        commonPhrases: splitList(
          Array.isArray(data.commonPhrases) ? data.commonPhrases.join(', ') : (data.commonPhrases || ''),
          'Phrase',
          8
        ),
        voiceSampleUrl: data.voiceSampleUrl || data.avatarUrl || undefined,
        avoidMedicalAdvice: data.avoidMedicalAdvice,
        avoidFinancialAdvice: data.avoidFinancialAdvice,
        avoidLegalAdvice: data.avoidLegalAdvice,
        avoidPredictions: data.avoidPredictions,
        avoidPhysicalPresence: data.avoidPhysicalPresence,
        avoidComingBack: data.avoidComingBack,
        copingHabits: data.copingHabits,
        emotionalCheckin: data.emotionalCheckin,
        groundingTechniques: data.groundingTechniques,
      };

      const res = await fetch(`${API_BASE_URL}/persona`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // If persona already exists, just load it and continue to dashboard
        if (res.status === 400) {
          await loadPersona();
          return;
        }
        const text = await res.text();
        throw new Error(`Create failed: ${res.status} ${text || ''}`);
      }

      // OPTIMISTIC UPDATE: Instead of waiting for loadPersona (which might miss the new doc due to latency),
      // we construct the persona locally and set it.
      const responseData = await res.json();
      const newPersonaId = responseData.id;

      const newPersona: Persona = {
        id: newPersonaId,
        ...data,
        createdAt: Date.now(),
        expiryDate: Date.now() + TOTAL_DAYS * MS_IN_DAY,
        remainingDays: TOTAL_DAYS,
        status: 'active',
        keyMemories: splitList(data.memories || '', 'Memory', 10),
        commonPhrases: splitList(
          Array.isArray(data.commonPhrases) ? data.commonPhrases.join(', ') : (data.commonPhrases || ''),
          'Phrase',
          8
        ),
        traits: splitList(data.traits, 'Kind', 8).join(', '),
        biography: data.biography || '',
        speakingStyle: data.speakingStyle || '',
        userNickname: data.userNickname || '',
        voiceSampleUrl: data.voiceSampleUrl || null,
        voiceStyle: data.voiceStyle || '',
        avatarUrl: data.avatarUrl || undefined
      };

      setState((prev) => ({
        ...prev,
        hasOnboarded: true,
        persona: newPersona,
        messages: [],
      }));

      localStorage.setItem(PERSONA_CACHE_KEY, JSON.stringify(newPersona));

      // REMOVED: Do not auto-reload immediately. Firestore queries are eventually consistent.
      // The local state is authoritative for now.
      // setTimeout(() => loadPersona(true), 2000);
    },
    [loadPersona],
  );

  const login = useCallback(async (email: string, password: string, isSignup: boolean = false) => {
    try {
      let user;
      if (isSignup) {
        // Create new user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      }

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        userEmail: user.email || email,
      }));

      // Load persona after login - pass skipRouteCheck=true to load even on LOGIN page
      try {
        await loadPersona(true, true);
      } catch (err) {
        console.error('Failed to load persona after login:', err);
      }
    } catch (error: any) {
      // Re-throw Firebase auth errors so Login page can handle them
      throw error;
    }
  }, [loadPersona]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        userEmail: user.email || '',
      }));
      // Load persona after login - pass skipRouteCheck=true to load even on LOGIN page
      try {
        await loadPersona(true, true);
      } catch (err) {
        console.error('Failed to load persona after Google login:', err);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  }, [loadPersona]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }, []);

  const confirmPasswordResetWrapper = useCallback(async (oobCode: string, newPassword: string) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error) {
      console.error('Confirm password reset error:', error);
      throw error;
    }
  }, []);

  const updatePersona = useCallback(
    async (data: Partial<Persona> & { id?: string }) => {
      const personaIdHint = data.id ?? state.persona?.id;

      const ensurePersona = async () => {
        if (personaIdHint && state.persona?.id === personaIdHint) return state.persona;
        const res = await fetch(`${API_BASE_URL}/persona`, { headers: await getAuthHeaders() });
        if (!res.ok) throw new Error('Unable to load persona.');
        const body = await res.json();
        if (!body) throw new Error('Persona not found. Please create one first.');
        const personaLoaded = normalizePersona(body);
        setState((prev) => ({ ...prev, hasOnboarded: true, persona: personaLoaded }));
        return personaLoaded;
      };

      const persona = await ensurePersona();
      const idToUse = personaIdHint ?? persona?.id;
      if (!idToUse) throw new Error('Persona not found. Please create one first.');

      const { name, relationship, id, createdAt, expiryDate, ...rest } = data;

      const payload: Record<string, any> = {
        biography: rest.biography ?? rest.memories ?? persona.biography ?? persona.memories ?? '',
        speakingStyle: rest.voiceStyle ?? rest.speakingStyle ?? persona.speakingStyle ?? '',
        userNickname: rest.userNickname ?? persona.userNickname ?? '',
        traits: splitList(rest.traits ?? persona.traits ?? '', 'Kind', 8),
        keyMemories: splitList(rest.memories ?? persona.memories ?? '', 'Memory', 10),
        commonPhrases: splitList(
          Array.isArray(rest.commonPhrases)
            ? rest.commonPhrases.join(', ')
            : Array.isArray(persona.commonPhrases)
              ? persona.commonPhrases.join(', ')
              : (rest.commonPhrases ?? persona.commonPhrases ?? ''),
          'Phrase',
          8
        ),
        voiceSampleUrl: rest.voiceSampleUrl ?? persona.voiceSampleUrl ?? undefined,
        // Safety boundaries
        avoidMedicalAdvice: rest.avoidMedicalAdvice ?? persona.avoidMedicalAdvice,
        avoidFinancialAdvice: rest.avoidFinancialAdvice ?? persona.avoidFinancialAdvice,
        avoidLegalAdvice: rest.avoidLegalAdvice ?? persona.avoidLegalAdvice,
        avoidPredictions: rest.avoidPredictions ?? persona.avoidPredictions,
        avoidPhysicalPresence: rest.avoidPhysicalPresence ?? persona.avoidPhysicalPresence,
        avoidComingBack: rest.avoidComingBack ?? persona.avoidComingBack,
        // Crisis Support
        copingHabits: rest.copingHabits ?? persona.copingHabits,
        emotionalCheckin: rest.emotionalCheckin ?? persona.emotionalCheckin,
        groundingTechniques: rest.groundingTechniques ?? persona.groundingTechniques,
      };

      let res = await fetch(`${API_BASE_URL}/persona/${idToUse}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(payload),
      });

      // If 404, the local ID might be stale. Try to fetch the actual persona and retry.
      if (res.status === 404) {
        const currentRes = await fetch(`${API_BASE_URL}/persona`, { headers: await getAuthHeaders() });
        if (currentRes.ok) {
          const currentData = await currentRes.json();
          if (currentData && currentData.id) {
            // Retry update with the correct ID
            res = await fetch(`${API_BASE_URL}/persona/${currentData.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
              body: JSON.stringify(payload),
            });
          }
        }
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update persona.');
      }
      await loadPersona();
    },
    [loadPersona, state.persona],
  );

  const addMessage = useCallback((text: string, role: Message['role']) => {
    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: crypto.randomUUID(),
          role,
          text,
          timestamp: Date.now(),
        },
      ],
    }));
  }, []);

  const sendMessage = useCallback(
    async (text: string, options?: { hidden?: boolean }) => {
      if (!state.persona) return null;
      const personaId = state.persona.id;

      if (!options?.hidden) {
        addMessage(text, 'user');
      }

      setIsSending(true);
      try {
        const res = await fetch(`${API_BASE_URL}/persona/${personaId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
          body: JSON.stringify({ text, clientMessageId: crypto.randomUUID() }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Chat failed (${res.status}): ${body || res.statusText}`);
        }

        const data = await res.json();
        const aiText =
          (data.messages || []).find((m: any) => m.sender === 'ai')?.text ||
          "I'm here with you.";

        addMessage(aiText, 'model');
        return aiText;
      } catch (e) {
        console.error(e);
        if (!options?.hidden) {
          addMessage('Unable to send message. Please try again.', 'model');
        }
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [addMessage, state.persona],
  );

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Firebase logout error:', error);
    }
    localStorage.removeItem(PERSONA_CACHE_KEY);
    localStorage.removeItem(STATE_CACHE_KEY);
    setState({
      isAuthenticated: false,
      userEmail: '',
      hasOnboarded: false,
      persona: null,
      messages: [],
      guidedReflectionAnswers: {},
    });
    setCurrentRoute(AppRoute.LANDING);
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user logged in');
        return;
      }

      // Delete user account from Firebase
      await user.delete();

      // Clear all local storage
      localStorage.removeItem(PERSONA_CACHE_KEY);
      localStorage.removeItem(STATE_CACHE_KEY);

      // Reset state
      setState({
        isAuthenticated: false,
        userEmail: '',
        hasOnboarded: false,
        persona: null,
        messages: [],
        guidedReflectionAnswers: {},
      });

      setCurrentRoute(AppRoute.LANDING);
      alert('Your account has been permanently deleted.');
    } catch (error: any) {
      console.error('Delete account error:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('For security reasons, please log out and log back in before deleting your account.');
      } else {
        alert('Failed to delete account. Please try again or contact support.');
      }
    }
  }, []);

  const daysRemaining = useMemo(() => {
    if (!state.persona) return TOTAL_DAYS;
    if (typeof state.persona.remainingDays === 'number') return state.persona.remainingDays;

    const diff = state.persona.expiryDate - Date.now();
    return Math.max(0, Math.ceil(diff / MS_IN_DAY));
  }, [state.persona]);

  useEffect(() => {
    if (!state.persona) return;

    // If persona is completed or expired, force closure page
    // But allow them to stay on Closure page if they are already there
    // AND allow them to go to SETUP to create a new persona
    if (state.persona.status === 'completed' || state.persona.status === 'expired' || daysRemaining <= 0) {
      if (currentRoute !== AppRoute.CLOSURE && currentRoute !== AppRoute.SETUP) {
        setCurrentRoute(AppRoute.CLOSURE);
      }
    }
  }, [state.persona, daysRemaining, currentRoute]);

  const contextValue = useMemo<AppContextType>(
    () => ({
      state,
      currentRoute,
      navigate: setCurrentRoute,
      login,
      loginWithGoogle,
      createPersona,
      updatePersona,
      addMessage,
      sendMessage,
      daysRemaining,
      logout,
      deleteAccount,
      reloadPersona: (skipIncrement?: boolean) => loadPersona(false, false, skipIncrement),
      resetPassword,
      confirmPasswordReset: confirmPasswordResetWrapper,
      isSending,
      loading,
    }),
    [
      state,
      currentRoute,
      login,
      loginWithGoogle,
      createPersona,
      updatePersona,
      addMessage,
      sendMessage,
      daysRemaining,
      logout,
      loadPersona,
      resetPassword,
      confirmPasswordResetWrapper,
      isSending,
      loading,
    ],
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
