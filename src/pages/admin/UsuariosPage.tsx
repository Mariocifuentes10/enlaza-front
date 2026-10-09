import { useEffect, useState, type FormEvent } from 'react';
import { adminApi } from '@/services/api';
import type { FiltrosUsuariosAdmin, TipoUsuarioAdmin, UsuarioAdmin } from '@/types/admin';
import { mensajeDe } from '@/lib/erroresFormulario';
import { formatoFecha } from '@/lib/formato';
import { ErrorGeneral } from '@/components/ui/form/Field';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { Paginacion } from './Paginacion';
import estilos from './admin.module.css';

const ETIQUETAS_ROL: Record<TipoUsuarioAdmin, string> = {
  candidato: 'Candidato',
  empresa: 'Empresa',
  mentor: 'Mentor',
  admin: 'Administrador',
};

const LIMITE = 20;

export function UsuariosPage() {
  const [filtros, setFiltros] = useState<FiltrosUsuariosAdmin>({ page: 1, limit: LIMITE });
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [idActualizando, setIdActualizando] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    adminApi
      .usuarios(filtros)
      .then((listado) => {
        if (cancelado) return;
        setUsuarios(listado.data);
        setTotal(listado.total);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No se pudieron cargar los usuarios.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [filtros, intento]);

  const buscar = (evento: FormEvent) => {
    evento.preventDefault();
    setFiltros((previos) => ({ ...previos, busqueda: busqueda.trim() || undefined, page: 1 }));
  };

  const cambiarFiltro = (cambios: Partial<FiltrosUsuariosAdmin>) => {
    setFiltros((previos) => ({ ...previos, ...cambios, page: 1 }));
  };

  const alternarActivo = async (usuario: UsuarioAdmin) => {
    setIdActualizando(usuario.id_usuario);
    setError(null);
    try {
      await adminApi.actualizarUsuario(usuario.id_usuario, { activo: !usuario.activo });
      setIntento((n) => n + 1);
    } catch (evaluacion) {
      setError(mensajeDe(evaluacion, 'No se pudo actualizar el usuario.'));
    } finally {
      setIdActualizando(null);
    }
  };

  const page = filtros.page ?? 1;
  const mostrarPaginacion = !cargando && !error && total > 0;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div>
          <h1 className={estilos.titulo}>Usuarios</h1>
          <p className={estilos.subtitulo}>Gestiona las cuentas de la plataforma.</p>
        </div>
      </div>

      <div className={estilos.panel}>
        <form className={estilos.barra} onSubmit={buscar}>
          <label className={`${estilos.campo} ${estilos.crecer}`}>
            <span className={estilos.campoEtiqueta}>Buscar por correo</span>
            <input
              className={estilos.entrada}
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="nombre@correo.com"
            />
          </label>

          <label className={estilos.campo}>
            <span className={estilos.campoEtiqueta}>Rol</span>
            <select
              className={estilos.select}
              value={filtros.tipo ?? ''}
              onChange={(evento) =>
                cambiarFiltro({ tipo: (evento.target.value || undefined) as TipoUsuarioAdmin | undefined })
              }
            >
              <option value="">Todos</option>
              <option value="candidato">Candidato</option>
              <option value="empresa">Empresa</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          <label className={estilos.campo}>
            <span className={estilos.campoEtiqueta}>Estado</span>
            <select
              className={estilos.select}
              value={filtros.activo ?? ''}
              onChange={(evento) =>
                cambiarFiltro({ activo: (evento.target.value || undefined) as 'true' | 'false' | undefined })
              }
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>

          <Boton type="submit">Buscar</Boton>
        </form>

        <ErrorGeneral mensaje={error ?? undefined} />

        {cargando ? (
          <div className={estilos.cargando}>
            <Spinner label="Cargando usuarios…" />
          </div>
        ) : null}

        {!cargando && !error && usuarios.length === 0 ? (
          <p className={estilos.vacio}>No se encontraron usuarios con esos filtros.</p>
        ) : null}

        {!cargando && usuarios.length > 0 ? (
          <div className={estilos.tablaContenedor}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Registro</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>
                      <span className={estilos.nombre}>{usuario.nombre ?? 'Sin perfil'}</span>
                    </td>
                    <td className={estilos.muted}>{usuario.correo}</td>
                    <td>
                      <span className={estilos.badge}>{ETIQUETAS_ROL[usuario.tipo_usuario]}</span>
                    </td>
                    <td>
                      <span
                        className={`${estilos.badge} ${
                          usuario.activo ? estilos.badgeActivo : estilos.badgeInactivo
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={estilos.muted}>{formatoFecha(usuario.fecha_registro)}</td>
                    <td>
                      <Boton
                        variante="secundario"
                        cargando={idActualizando === usuario.id_usuario}
                        onClick={() => void alternarActivo(usuario)}
                      >
                        {usuario.activo ? 'Desactivar' : 'Activar'}
                      </Boton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {mostrarPaginacion ? (
          <Paginacion
            page={page}
            limit={filtros.limit ?? LIMITE}
            total={total}
            onCambiar={(nueva) => setFiltros((previos) => ({ ...previos, page: nueva }))}
          />
        ) : null}
      </div>
    </div>
  );
}
