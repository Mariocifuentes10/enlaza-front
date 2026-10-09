import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import * as Sentry from '@sentry/react';

import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';

import '@/styles/reset.css';
import '@/styles/global.css';

import { AccesibilidadProvider } from '@/context/AccesibilidadContext';
import {
  aplicarPreferenciasAccesibilidad,
  leerPreferenciasAccesibilidad,
} from '@/context/AccesibilidadContext';
import { AuthProvider } from '@/context/AuthContext';
import { initSentry } from '@/lib/sentry';
import { router } from '@/routes/router';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorFallback } from '@/pages/errors/ErrorFallback';

aplicarPreferenciasAccesibilidad(leerPreferenciasAccesibilidad());
initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error }) => <ErrorFallback error={error} />}
      showDialog={false}
    >
      <Suspense
        fallback={
          <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
            <Spinner label="Cargando Enlaza…" />
          </div>
        }
      >
        <AccesibilidadProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </AccesibilidadProvider>
      </Suspense>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
