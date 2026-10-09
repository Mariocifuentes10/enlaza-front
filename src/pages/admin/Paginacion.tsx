import { Boton } from '@/components/ui/form/Boton';
import estilos from './admin.module.css';

interface PaginacionProps {
  page: number;
  limit: number;
  total: number;
  onCambiar: (page: number) => void;
}

export function Paginacion({ page, limit, total, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / limit));
  const desde = total === 0 ? 0 : (page - 1) * limit + 1;
  const hasta = Math.min(page * limit, total);

  return (
    <div className={estilos.paginacion}>
      <span>
        Mostrando {desde}–{hasta} de {total}
      </span>
      <div className={estilos.paginacionBotones}>
        <Boton
          variante="secundario"
          disabled={page <= 1}
          onClick={() => onCambiar(page - 1)}
        >
          Anterior
        </Boton>
        <Boton
          variante="secundario"
          disabled={page >= totalPaginas}
          onClick={() => onCambiar(page + 1)}
        >
          Siguiente
        </Boton>
      </div>
    </div>
  );
}
