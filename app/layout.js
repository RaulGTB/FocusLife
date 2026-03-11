import './globals.css';
import ThemeProvider from './components/ThemeProvider';
import AuthProvider from './components/AuthProvider';
import AppShell from './components/AppShell';

export const metadata = {
  title: 'FocusLife — Productividad y Organización Personal',
  description: 'Aplicación de productividad, organización personal y registro cultural. Calendario, tareas, diario, biblioteca y colecciones en un solo lugar.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
