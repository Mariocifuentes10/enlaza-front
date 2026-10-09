import { useState } from 'react';
import { useAccesibilidad, type Escala } from '@/context/AccesibilidadContext';
import estilos from './accesibilidad.module.css';

const OPCIONES_ESCALA: Array<{ valor: Escala; etiqueta: string }> = [
  { valor: 'normal', etiqueta: 'Normal (100%)' },
  { valor: 'grande', etiqueta: 'Grande (115%)' },
  { valor: 'muyGrande', etiqueta: 'Muy grande (130%)' },
];

export function ConfiguracionAccesibilidad() {
  const { contraste, escala, actualizar } = useAccesibilidad();
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  const cambiar = (cambios: Parameters<typeof actualizar>[0], aviso: string) => {
    actualizar(cambios);
    setConfirmacion(aviso);
  };

  return (
    <section className={estilos.seccion} aria-labelledby="accesibilidad-titulo">
      <h2 className={estilos.titulo} id="accesibilidad-titulo">
        Accesibilidad
      </h2>
      <p className={estilos.nota}>
        Las preferencias se aplican en toda la aplicación y se guardan en este dispositivo.
      </p>

      <div className={estilos.grupo}>
        <fieldset className={estilos.fieldset}>
          <legend className={estilos.leyenda}>Modo alto contraste</legend>
          <label className={estilos.opcion}>
            <input
              type="radio"
              name="accesibilidad-contraste"
              value="normal"
              checked={contraste === 'normal'}
              onChange={() => cambiar({ contraste: 'normal' }, 'Contraste normal aplicado.')}
            />
            Normal
          </label>
          <label className={estilos.opcion}>
            <input
              type="radio"
              name="accesibilidad-contraste"
              value="alto"
              checked={contraste === 'alto'}
              onChange={() => cambiar({ contraste: 'alto' }, 'Modo alto contraste aplicado.')}
            />
            Alto contraste
          </label>
        </fieldset>

        <fieldset className={estilos.fieldset}>
          <legend className={estilos.leyenda}>Tamaño de texto</legend>
          {OPCIONES_ESCALA.map((opcion) => (
            <label key={opcion.valor} className={estilos.opcion}>
              <input
                type="radio"
                name="accesibilidad-escala"
                value={opcion.valor}
                checked={escala === opcion.valor}
                onChange={() =>
                  cambiar({ escala: opcion.valor }, `Tamaño de texto ${opcion.etiqueta} aplicado.`)
                }
              />
              {opcion.etiqueta}
            </label>
          ))}
        </fieldset>
      </div>

      <span className={estilos.estado} role="status">
        {confirmacion ?? ''}
      </span>
    </section>
  );
}
