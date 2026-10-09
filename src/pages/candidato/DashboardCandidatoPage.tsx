import { VacantesRecomendadas } from '@/components/candidato/VacantesRecomendadas';
import { ListadoPostulacionesCandidato } from '@/components/postulaciones/ListadoPostulacionesCandidato';
import estilos from './dashboard.module.css';

export function DashboardCandidatoPage() {
  return (
    <>
      <div className={estilos.pagina}>
        <h1 className={estilos.titulo}>Tu resumen</h1>
        <p className={estilos.subtitulo}>
          Encuentra vacantes afines a tu perfil y sigue el estado de tus postulaciones.
        </p>
      </div>
      <VacantesRecomendadas />
      <ListadoPostulacionesCandidato titulo="Mis postulaciones" nivelTitulo="h2" />
    </>
  );
}
