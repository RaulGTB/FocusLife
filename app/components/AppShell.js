'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEffect } from 'react';

export default function AppShell({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, loading, isLoginPage, router]);

  // Login page: no sidebar, no header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // While loading auth, show spinner
  if (loading) {
    return (
      <div className="app-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  // Not logged in (will redirect)
  if (!user) {
    return null;
  }

  // Logged in: full app layout
  return (
    <div className="app-layout">
      <Sidebar />
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
