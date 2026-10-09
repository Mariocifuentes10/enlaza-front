export interface CandidatoMentor {
  id_candidato: number;
  nombre_completo: string;
  ubicacion: string | null;
  resumen_perfil: string | null;
}

export interface Mentor {
  id_mentor: number;
  id_candidato: number;
  biografia: string | null;
  disponible: boolean;
  candidato: CandidatoMentor;
}

export interface MentorMentoria {
  id_mentor: number;
  candidato: { id_candidato: number; nombre_completo: string };
}

export interface Mentoria {
  id_mentoria: number;
  id_mentor: number;
  id_candidato: number;
  fecha_sesion: string | null;
  notas: string | null;
  mentor: MentorMentoria;
}

export interface AgendarMentoria {
  id_mentor: number;
  fecha_sesion?: string | null;
  notas?: string | null;
}
