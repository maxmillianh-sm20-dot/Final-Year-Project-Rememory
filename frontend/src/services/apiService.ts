import axios, { AxiosHeaders } from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set('Content-Type', 'application/json');
  config.headers = headers;
  return config;
});

interface PersonaResponse {
  id: string;
  name: string;
  status: 'active' | 'expired' | 'deleted' | 'completed';
  expiresAt?: string;
  relationship: string;
}

interface ChatResponse {
  personaStatus: 'active' | 'expired' | 'deleted' | 'completed';
  remainingMs: number;
  messages: Array<{
    id: string;
    sender: 'user' | 'ai' | 'system';
    text: string;
    timestamp: string;
    meta?: Record<string, unknown>;
  }>;
  summaryAppended: boolean;
}

export const fetchPersona = async (token: string): Promise<PersonaResponse | null> => {
  const response = await apiClient.get<PersonaResponse>('/persona', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data ?? null;
};

export const fetchPersonas = async (token: string): Promise<PersonaResponse[]> => {
  const response = await apiClient.get<PersonaResponse[]>('/persona/list', {
    headers: { Authorization: `Bearer ${token}` },
    params: { _t: Date.now() } // Cache buster
  });
  return response.data ?? [];
};

export const fetchMessages = async (personaId: string, token: string) => {
  const response = await apiClient.get<{ messages: ChatResponse['messages'] }>(`/persona/${personaId}/chat`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit: 25 }
  });
  return response.data.messages;
};

export const chatWithPersona = async (personaId: string, text: string, token: string): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>(
    `/persona/${personaId}/chat`,
    { text, clientMessageId: crypto.randomUUID() },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const resetSession = async (personaId: string, token: string) => {
  await apiClient.post(`/persona/${personaId}/reset-session`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const advanceSession = async (personaId: string, token: string) => {
  await apiClient.post(`/persona/${personaId}/advance-session`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const closePersona = async (personaId: string, answers: Record<string, string>, token: string) => {
  await apiClient.post(`/persona/${personaId}/close`, { answers }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
