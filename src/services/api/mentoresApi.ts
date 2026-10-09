import { api } from './client';
import type { AgendarMentoria, Mentor, Mentoria } from '@/types/mentores';

export const mentoresApi = {
  listar: () => api.get<Mentor[]>('/api/mentores'),
  agendar: (datos: AgendarMentoria) => api.post<Mentoria>('/api/mentorias', datos),
};
