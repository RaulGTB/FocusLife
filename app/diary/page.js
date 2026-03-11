'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

const MOODS = [
  { emoji: '😊', label: 'Contento' },
  { emoji: '😢', label: 'Triste' },
  { emoji: '😡', label: 'Enfadado' },
  { emoji: '😴', label: 'Cansado' },
  { emoji: '🤩', label: 'Emocionado' },
  { emoji: '😌', label: 'Tranquilo' },
  { emoji: '🤔', label: 'Pensativo' },
  { emoji: '😰', label: 'Ansioso' },
  { emoji: '🥰', label: 'Enamorado' },
  { emoji: '💪', label: 'Motivado' },
  { emoji: '😂', label: 'Divertido' },
  { emoji: '🤯', label: 'Sorprendido' },
  { emoji: '😤', label: 'Frustrado' },
  { emoji: '🥺', label: 'Nostálgico' },
  { emoji: '🫠', label: 'Agotado' },
  { emoji: '🤗', label: 'Agradecido' },
  { emoji: '😎', label: 'Seguro' },
  { emoji: '🫡', label: 'Orgulloso' },
  { emoji: '🙃', label: 'Irónico' },
  { emoji: '🥱', label: 'Aburrido' },
];

export default function DiaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: '😊' });
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data } = await supabase.from('diary_entries').select('*').order('date', { ascending: false });
    if (data) setEntries(data);
    setLoading(false);
  }

  const filteredEntries = entries.filter(e => {
    const matchesText = !searchTerm ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || e.date === dateFilter;
    return matchesText && matchesDate;
  });

  const handleSaveEntry = async () => {
    if (!newEntry.title.trim()) return;
    const { data } = await supabase.from('diary_entries').insert({
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      is_private: false,
      date: new Date().toISOString().split('T')[0],
      user_id: user?.id || null,
    }).select().single();
    if (data) setEntries(prev => [data, ...prev]);
    setShowEditor(false);
    setNewEntry({ title: '', content: '', mood: '😊' });
  };

  const handleDeleteEntry = async (id) => {
    await supabase.from('diary_entries').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
    setConfirmDelete(null);
  };

  const getMoodDays = () => {
    const days = {};
    entries.forEach(e => { days[e.date] = e.mood; });
    return days;
  };

  const moodDays = getMoodDays();
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOffset = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;
  const calDays = [];
  for (let i = 0; i < firstDayOffset; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const handleCalDayClick = (day) => {
    if (!day) return;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setDateFilter(prev => prev === dateStr ? '' : dateStr);
    setSelectedEntry(null);
  };

  return (
    <div className={styles.diaryPage}>
      <div className="page-header">
        <div>
          <h1>Diario</h1>
          <p className="subtitle">Tu espacio personal</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowEditor(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva entrada
        </button>
      </div>

      <div className={styles.diaryLayout}>
        <div className={styles.diarySidebar}>
          <div className="search-bar" style={{ marginBottom: 'var(--sp-3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar en el diario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div className={styles.dateFilterRow}>
            <input type="date" className={styles.dateInput} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            {dateFilter && (
              <button className={styles.clearDateBtn} onClick={() => setDateFilter('')} title="Quitar filtro de fecha">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          <div className={`card ${styles.miniCal}`}>
            <h5 style={{ marginBottom: 'var(--sp-3)' }}>{monthNames[now.getMonth()]} {now.getFullYear()}</h5>
            <div className={styles.miniCalGrid}>
              {['L','M','X','J','V','S','D'].map(d => (
                <span key={d} className={styles.miniCalHeader}>{d}</span>
              ))}
              {calDays.map((day, i) => {
                const dateStr = day ? `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2, '0')}` : null;
                const mood = dateStr ? moodDays[dateStr] : null;
                const isSelected = dateStr === dateFilter;
                return (
                  <span
                    key={i}
                    className={`${styles.miniCalDay} ${mood ? styles.hasMood : ''} ${day === now.getDate() ? styles.today : ''} ${isSelected ? styles.selectedDay : ''}`}
                    onClick={() => handleCalDayClick(day)}
                    style={day ? { cursor: 'pointer' } : {}}
                  >
                    {day || ''}
                    {mood && <span className={styles.miniMood}>{mood}</span>}
                  </span>
                );
              })}
            </div>
          </div>

          <div className={`card ${styles.moodLegend}`}>
            <h5 style={{ marginBottom: 'var(--sp-3)' }}>Estados de ánimo</h5>
            <div className={styles.moodGrid}>
              {MOODS.map(m => (
                <div key={m.emoji} className={styles.moodItem}>
                  <span className={styles.moodEmoji}>{m.emoji}</span>
                  <span className={styles.moodLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.diaryMain}>
          {dateFilter && (
            <div className={styles.dateFilterBanner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Filtrando por: <strong>{dateFilter}</strong>
              <button onClick={() => setDateFilter('')} className={styles.clearFilterBtn}>Quitar filtro</button>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="loading-spinner" /></div>
          ) : selectedEntry ? (
            <div className={styles.entryDetail}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className={styles.backBtn} onClick={() => setSelectedEntry(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Volver
                </button>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(selectedEntry.id)} style={{ color: 'var(--error)', fontSize: 'var(--fs-sm)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Eliminar
                </button>
              </div>
              <div className={styles.entryDetailHeader}>
                <span className={styles.entryDetailMood}>{selectedEntry.mood}</span>
                <div>
                  <h2>{selectedEntry.title}</h2>
                  <span className={styles.entryDate}>{selectedEntry.date}</span>
                </div>
              </div>
              <div className={styles.entryBody}>{selectedEntry.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
            </div>
          ) : (
            <div className={styles.entryList}>
              {filteredEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-16)', color: 'var(--text-tertiary)' }}>
                  <p>{searchTerm || dateFilter ? 'No hay entradas que coincidan' : '¡Escribe tu primera entrada!'}</p>
                </div>
              ) : filteredEntries.map(entry => (
                <div key={entry.id} className={`card ${styles.entryCard}`}>
                  <div className={styles.entryHeader} onClick={() => setSelectedEntry(entry)} style={{ cursor: 'pointer' }}>
                    <span className={styles.entryMood}>{entry.mood}</span>
                    <div className={styles.entryMeta}>
                      <h4 className={styles.entryTitle}>{entry.title}</h4>
                      <span className={styles.entryDate}>{entry.date}</span>
                    </div>
                    <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); setConfirmDelete(entry.id); }} title="Eliminar entrada">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <p className={styles.entryPreview} onClick={() => setSelectedEntry(entry)} style={{ cursor: 'pointer' }}>{entry.content.slice(0, 150)}{entry.content.length > 150 ? '...' : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditor && (
        <div className="modal-overlay" onClick={() => setShowEditor(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3>Nueva entrada</h3>
              <button className="modal-close" onClick={() => setShowEditor(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-group">
              <label>¿Cómo te sientes hoy?</label>
              <div className={styles.moodSelector}>
                {MOODS.map(m => (
                  <button key={m.emoji} className={`${styles.moodBtn} ${newEntry.mood === m.emoji ? styles.moodBtnActive : ''}`} onClick={() => setNewEntry(p => ({ ...p, mood: m.emoji }))} title={m.label}>{m.emoji}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Título</label>
              <input type="text" placeholder="Dale un título a tu día..." value={newEntry.title} onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Contenido</label>
              <textarea placeholder="Escribe sobre tu día..." value={newEntry.content} onChange={e => setNewEntry(p => ({ ...p, content: e.target.value }))} style={{ minHeight: '200px' }} />
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setShowEditor(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveEntry}>Guardar entrada</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ padding: 'var(--sp-6)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 'var(--sp-4)' }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              <h3 style={{ marginBottom: 'var(--sp-2)' }}>¿Eliminar entrada?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-6)' }}>Esta acción no se puede deshacer.</p>
              <div className="form-actions" style={{ justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={() => handleDeleteEntry(confirmDelete)} style={{ background: 'var(--error)' }}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
