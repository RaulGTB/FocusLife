'use client';
import { useState, useEffect } from 'react';
import styles from './PinGate.module.css';

/**
 * PinGate — wraps content that requires PIN verification.
 * Props:
 *   pinKey: 'focuslife-app-pin' | 'focuslife-private-pin'
 *   title: string (e.g. "Zona privada")
 *   children: React nodes to show when unlocked
 *   onUnlocked: optional callback
 */
export default function PinGate({ pinKey = 'focuslife-private-pin', title = 'Contenido privado', children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [hasPinSet, setHasPinSet] = useState(false);

  useEffect(() => {
    const storedPin = localStorage.getItem(pinKey);
    setHasPinSet(!!storedPin);
    // If no PIN is set, auto-unlock
    if (!storedPin) setUnlocked(true);
  }, [pinKey]);

  const handleVerify = () => {
    const storedPin = localStorage.getItem(pinKey);
    if (pinInput === storedPin) {
      setUnlocked(true);
      setError('');
    } else {
      setError('PIN incorrecto');
      setPinInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleVerify();
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className={styles.pinGate}>
      <div className={styles.pinCard}>
        <div className={styles.lockIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3 className={styles.pinTitle}>{title}</h3>
        <p className={styles.pinDesc}>Introduce tu PIN para acceder</p>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="••••"
          value={pinInput}
          onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setError(''); }}
          onKeyDown={handleKeyDown}
          className={styles.pinInput}
          autoFocus
        />
        {error && <p className={styles.pinError}>{error}</p>}
        <button className={styles.pinButton} onClick={handleVerify}>
          Desbloquear
        </button>
      </div>
    </div>
  );
}
