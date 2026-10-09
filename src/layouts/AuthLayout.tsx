import { Link, Outlet } from 'react-router-dom';
import { paths } from '@/routes/paths';
import estilos from './AuthLayout.module.css';

const BENEFICIOS = [
  'Vacantes con ajustes razonables',
  'Empresas verificadas e inclusivas',
  'Mentorías para tu desarrollo',
];

export function AuthLayout() {
  return (
    <main className={estilos.contenedor}>
      <section className={estilos.marca}>
        <Link to={paths.home} className={estilos.logo}>
          Enlaza
        </Link>
        <div className={estilos.mensajeMarca}>
          <h2 className={estilos.marcaTitulo}>Talento y oportunidades sin barreras</h2>
          <p className={estilos.marcaTexto}>
            La plataforma de empleo inclusivo que conecta a personas con discapacidad con empresas
            comprometidas.
          </p>
          <ul className={estilos.listaMarca}>
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio}>{beneficio}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={estilos.panel}>
        <Link to={paths.home} className={estilos.logoMovil}>
          Enlaza
        </Link>
        <div className={estilos.tarjeta}>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
