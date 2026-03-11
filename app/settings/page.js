'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '../lib/supabase';

const ACCENT_COLORS = [
  { name: 'green', color: '#10b981', label: 'Esmeralda' },
  { name: 'blue', color: '#3b82f6', label: 'Azul' },
  { name: 'purple', color: '#8b5cf6', label: 'Violeta' },
  { name: 'rose', color: '#f43f5e', label: 'Rosa' },
  { name: 'amber', color: '#f59e0b', label: 'Ámbar' },
  { name: 'cyan', color: '#06b6d4', label: 'Cian' },
  { name: 'pink', color: '#ec4899', label: 'Magenta' },
  { name: 'orange', color: '#f97316', label: 'Naranja' },
  { name: 'teal', color: '#14b8a6', label: 'Teal' },
  { name: 'indigo', color: '#6366f1', label: 'Índigo' },
  { name: 'lime', color: '#84cc16', label: 'Lima' },
  { name: 'red', color: '#ef4444', label: 'Rojo' },
];

export default function SettingsPage() {
  const { theme, accent, toggleTheme, changeAccent } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [fontSize, setFontSize] = useState('normal');
  const [settingsId, setSettingsId] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('user_settings').select('*').limit(1).single();
      if (data) {
        setSettingsId(data.id);
        setFontSize(data.font_size || 'normal');
      }
    }
    loadSettings();
  }, []);

  const saveSettings = async (updates) => {
    if (settingsId) {
      await supabase.from('user_settings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', settingsId);
    }
  };

  const handleThemeChange = (value) => {
    toggleTheme(value);
    saveSettings({ theme: value });
  };

  const handleAccentChange = (value) => {
    changeAccent(value);
    saveSettings({ accent_color: value });
  };

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    saveSettings({ font_size: value });
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const tables = ['tasks', 'goals', 'calendar_events', 'diary_entries', 'library_items', 'collections', 'collection_items', 'user_settings'];
      const allData = {};
      for (const table of tables) {
        const { data } = await supabase.from(table).select('*');
        allData[table] = data || [];
      }
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focuslife-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExporting(false);
  };

  return (
    <div className={styles.settingsPage}>
      <div className="page-header">
        <div>
          <h1>Ajustes</h1>
          <p className="subtitle">Personaliza tu experiencia</p>
        </div>
      </div>

      <div className={styles.settingsGrid}>
        {/* Appearance */}
        <section className={`card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <h3>Apariencia</h3>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Tema</span>
              <span className={styles.settingDesc}>Elige entre tema oscuro o claro</span>
            </div>
            <div className={styles.themeSelector}>
              {[
                { value: 'dark', label: 'Oscuro', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
                { value: 'light', label: 'Claro', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg> },
              ].map(t => (
                <button key={t.value} className={`${styles.themeBtn} ${theme === t.value ? styles.themeBtnActive : ''}`} onClick={() => handleThemeChange(t.value)}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Color de acento</span>
              <span className={styles.settingDesc}>Personaliza el color principal</span>
            </div>
            <div className={styles.accentGrid}>
              {ACCENT_COLORS.map(ac => (
                <button key={ac.name} className={`${styles.accentBtn} ${accent === ac.name ? styles.accentActive : ''}`} style={{ '--ac-color': ac.color }} onClick={() => handleAccentChange(ac.name)} title={ac.label}>
                  <span className={styles.accentDot} style={{ background: ac.color }} />
                  <span className={styles.accentLabel}>{ac.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Tamaño de texto</span>
              <span className={styles.settingDesc}>Ajusta el tamaño de la fuente</span>
            </div>
            <div className={styles.fontSizeSelector}>
              {['small', 'normal', 'large'].map(size => (
                <button key={size} className={`${styles.fontSizeBtn} ${fontSize === size ? styles.fontSizeBtnActive : ''}`} onClick={() => handleFontSizeChange(size)}>
                  <span style={{ fontSize: size === 'small' ? '12px' : size === 'normal' ? '15px' : '18px' }}>Aa</span>
                  <span>{size === 'small' ? 'Pequeño' : size === 'normal' ? 'Normal' : 'Grande'}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Profile */}
        <section className={`card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h3>Perfil</h3>
          </div>
          <div className={styles.profileSection}>
            <div className={styles.avatarLarge}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className={styles.profileForm}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className={`card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <h3>Datos</h3>
          </div>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Exportar datos</span>
              <span className={styles.settingDesc}>Descarga todos tus datos en formato JSON</span>
            </div>
            <button className="btn btn-secondary" onClick={handleExportJSON} disabled={exporting}>
              {exporting ? 'Exportando...' : 'Exportar JSON'}
            </button>
          </div>
        </section>

        {/* Session */}
        <section className={`card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <h3>Sesión</h3>
          </div>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Cerrar sesión</span>
              <span className={styles.settingDesc}>Salir de tu cuenta actual</span>
            </div>
            <button className="btn btn-ghost" onClick={handleLogout} style={{ color: 'var(--error)' }}>
              Cerrar sesión
            </button>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>FocusLife v1.0.0 · Hecho con ❤️</p>
      </footer>
    </div>
  );
}
