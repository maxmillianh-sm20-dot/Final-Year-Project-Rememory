export interface Message {
  id: string;
  role: 'user' | 'model' | 'ai';
  text: string;
  timestamp: number;
}

export interface Persona {
  id: string;
  name: string;
  relationship: string;
  age?: string;
  traits: string;
  memories: string;
  voiceStyle: string;
  createdAt: number;
  expiryDate: number;
  avatarUrl?: string;
  remainingDays?: number;
  status?: 'active' | 'expired' | 'deleted' | 'completed';
  userNickname?: string;
  biography?: string;
  speakingStyle?: string;
  keyMemories?: string[];
  commonPhrases?: string[];
  voiceSampleUrl?: string | null;
  guidanceLevel?: number;

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

export interface UserState {
  hasOnboarded: boolean;
  persona: Persona | null;
  messages: Message[];
  guidedReflectionAnswers: Record<string, string>;
  isAuthenticated?: boolean;
  userEmail?: string;
  agreedToTerms?: boolean;
  termsAgreedAt?: number;
}

export enum AppRoute {
  LANDING = 'landing',
  LOGIN = 'login',
  SETUP = 'setup',
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  VOICE = 'voice',
  CLOSURE = 'closure',
  RESET_PASSWORD = 'reset_password',
}

export const TOTAL_DAYS = 30;
