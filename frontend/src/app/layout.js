import { Providers } from './providers';

export const metadata = {
  title: 'Sistema de Gestión de Activos',
  description: 'Sistema de gestión de activos y mantenimientos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
