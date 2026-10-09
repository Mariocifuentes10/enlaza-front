import type { ReactNode } from 'react';
import estilos from './errores.module.css';

interface PaginaErrorProps {
  codigo?: string;
  titulo: string;
  descripcion: string;
  detalle?: string;
  acciones?: ReactNode;
}

export function PaginaError({ codigo, titulo, descripcion, detalle, acciones }: PaginaErrorProps) {
  return (
    <main className={estilos.contenedor}>
      <div className={estilos.tarjeta}>
        {codigo ? <span className={estilos.codigo}>{codigo}</span> : null}
        <h1 className={estilos.titulo}>{titulo}</h1>
        <p className={estilos.descripcion}>{descripcion}</p>
        {detalle ? <p className={estilos.detalle}>{detalle}</p> : null}
        {acciones ? <div className={estilos.acciones}>{acciones}</div> : null}
      </div>
    </main>
  );
}
