'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import styles from './page.module.css';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Introduce tu email');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetError) throw resetError;
        setSuccess('Te hemos enviado un email con instrucciones para recuperar tu contraseña.');
      } catch (err) {
        setError(err.message || 'Error al enviar el email');
      }
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Introduce tu contraseña');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.push('/');
      } else {
        const result = await signUp(email, password);
        if (result?.session) {
          router.push('/');
        } else {
          try {
            await signIn(email, password);
            router.push('/');
          } catch {
            setSuccess('¡Cuenta creada! Revisa tu email para confirmar y luego inicia sesión.');
            setMode('login');
          }
        }
      }
    } catch (err) {
      const msg = err.message;
      setError(
        msg === 'Invalid login credentials' ? 'Credenciales incorrectas' :
        msg === 'User already registered' ? 'Este email ya está registrado' :
        msg === 'Email not confirmed' ? 'Email no confirmado. Revisa tu bandeja.' :
        msg || 'Error desconocido'
      );
    }
    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      {/* Background decorative elements */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className={styles.authTitle}>FocusLife</h1>
          <p className={styles.authSubtitle}>
            {mode === 'forgot' ? 'Recupera tu contraseña' : 'Productividad y Organización Personal'}
          </p>
        </div>

        {mode !== 'forgot' && (
          <div className={styles.authTabs}>
            <button className={`${styles.authTab} ${mode === 'login' ? styles.authTabActive : ''}`} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
              Iniciar sesión
            </button>
            <button className={`${styles.authTab} ${mode === 'register' ? styles.authTabActive : ''}`} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
              Crear cuenta
            </button>
          </div>
        )}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.authError}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className={styles.authSuccess}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {success}
            </div>
          )}

          <div className={styles.formField}>
            <label>Email</label>
            <div className={styles.inputWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <>
              <div className={styles.formField}>
                <label>Contraseña</label>
                <div className={styles.inputWrapper}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                </div>
              </div>

              {mode === 'register' && (
                <div className={styles.formField}>
                  <label>Confirmar contraseña</label>
                  <div className={styles.inputWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className={styles.authButton} disabled={loading}>
            {loading ? (
              <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            ) : (
              mode === 'forgot' ? 'Enviar email de recuperación' :
              mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
            )}
          </button>
        </form>

        {mode === 'login' && (
          <button className={styles.forgotLink} onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>
            ¿Olvidaste tu contraseña?
          </button>
        )}

        <p className={styles.authFooter}>
          {mode === 'forgot' ? (
            <button className={styles.authLink} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
              ← Volver al inicio de sesión
            </button>
          ) : (
            <>
              {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button className={styles.authLink} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}>
                {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
