'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { supabase } from '../lib/supabase';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const EVENT_TYPES = [
  { value: 'event', label: 'Evento', color: '#3b82f6' },
  { value: 'task', label: 'Tarea', color: '#10b981' },
  { value: 'meeting', label: 'Quedada', color: '#f59e0b' },
  { value: 'class', label: 'Clase', color: '#8b5cf6' },
  { value: 'deadline', label: 'Deadline', color: '#ef4444' },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'event', color: '#3b82f6', description: '' });
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.from('calendar_events').select('*').order('date').order('start_time');
    if (data) setEvents(data.map(e => ({ ...e, startTime: e.start_time, endTime: e.end_time })));
    setLoading(false);
  }

  const navigateMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = adjustedFirst - 1; i >= 0; i--) {
      days.push({ day: daysInPrev - i, current: false, date: new Date(year, month - 1, daysInPrev - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, current: true, date: new Date(year, month, i) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
    }
    return days;
  };

  const getEventsForDate = (dateStr) => events.filter(e => e.date === dateStr);

  const formatDateStr = (d) => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  const isToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const handleDayClick = (dayObj) => {
    const dateStr = formatDateStr(dayObj.date);
    setSelectedDate(dateStr);
    setNewEvent(prev => ({ ...prev, date: dateStr }));
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) return;
    const { data } = await supabase.from('calendar_events').insert({
      title: newEvent.title,
      date: newEvent.date,
      start_time: newEvent.startTime,
      end_time: newEvent.endTime,
      type: newEvent.type,
      color: newEvent.color,
      description: newEvent.description,
    }).select().single();
    if (data) setEvents(prev => [...prev, { ...data, startTime: data.start_time, endTime: data.end_time }]);
    setShowModal(false);
    setNewEvent({ title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'event', color: '#3b82f6', description: '' });
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const hours = Array.from({ length: 16 }, (_, i) => i + 6);

  return (
    <div className={styles.calendarPage}>
      <div className="page-header">
        <div>
          <h1>Calendario</h1>
          <p className="subtitle">Organiza tu tiempo</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Mes</button>
            <button className={`tab ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Semana</button>
            <button className={`tab ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Día</button>
          </div>
          <button className="btn btn-primary" onClick={() => { setSelectedDate(formatDateStr(currentDate)); setNewEvent(prev => ({ ...prev, date: formatDateStr(currentDate) })); setShowModal(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo evento
          </button>
        </div>
      </div>

      <div className={styles.calNav}>
        <button className={styles.navBtn} onClick={() => navigateMonth(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h3 className={styles.calTitle}>{MONTHS[month]} {year}</h3>
        <button className={styles.navBtn} onClick={() => navigateMonth(1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="loading-spinner" /></div>
      ) : (
        <>
          {view === 'month' && (
            <div className={styles.monthGrid}>
              {DAYS.map(d => <div key={d} className={styles.dayHeader}>{d}</div>)}
              {getDaysInMonth().map((dayObj, i) => {
                const dateStr = formatDateStr(dayObj.date);
                const dayEvents = getEventsForDate(dateStr);
                return (
                  <div key={i} className={`${styles.dayCell} ${!dayObj.current ? styles.otherMonth : ''} ${isToday(dayObj.date) ? styles.today : ''}`} onClick={() => handleDayClick(dayObj)}>
                    <span className={styles.dayNumber}>{dayObj.day}</span>
                    <div className={styles.dayEvents}>
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id} className={styles.dayEvent} style={{ background: e.color + '22', color: e.color, borderLeft: `3px solid ${e.color}` }}>
                          <span className={styles.dayEventTime}>{e.startTime}</span>
                          <span className={styles.dayEventTitle}>{e.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && <span className={styles.moreEvents}>+{dayEvents.length - 3} más</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'week' && (
            <div className={styles.weekView}>
              <div className={styles.weekHeader}>
                <div className={styles.weekTimeCol} />
                {getWeekDays().map((d, i) => (
                  <div key={i} className={`${styles.weekDayCol} ${isToday(d) ? styles.todayCol : ''}`}>
                    <span className={styles.weekDayName}>{DAYS[i]}</span>
                    <span className={styles.weekDayNum}>{d.getDate()}</span>
                  </div>
                ))}
              </div>
              <div className={styles.weekBody}>
                {hours.map(h => (
                  <div key={h} className={styles.weekRow}>
                    <div className={styles.weekTime}>{String(h).padStart(2, '0')}:00</div>
                    {getWeekDays().map((d, i) => {
                      const dateStr = formatDateStr(d);
                      const hourEvents = events.filter(e => e.date === dateStr && parseInt(e.startTime) === h);
                      return (
                        <div key={i} className={styles.weekCell}>
                          {hourEvents.map(e => (
                            <div key={e.id} className={styles.weekEvent} style={{ background: e.color + '22', borderLeft: `3px solid ${e.color}`, color: e.color }}>
                              <span className={styles.weekEventTitle}>{e.title}</span>
                              <span className={styles.weekEventTime}>{e.startTime}-{e.endTime}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'day' && (
            <div className={styles.dayView}>
              {hours.map(h => {
                const dateStr = formatDateStr(currentDate);
                const hourEvents = events.filter(e => e.date === dateStr && parseInt(e.startTime) === h);
                return (
                  <div key={h} className={styles.dayRow}>
                    <div className={styles.dayTime}>{String(h).padStart(2, '0')}:00</div>
                    <div className={styles.dayContent}>
                      {hourEvents.map(e => (
                        <div key={e.id} className={styles.dayEvent2} style={{ background: e.color + '18', borderLeft: `4px solid ${e.color}` }}>
                          <div className={styles.dayEvent2Title}>{e.title}</div>
                          <div className={styles.dayEvent2Time}>{e.startTime} - {e.endTime}</div>
                          {e.description && <div className={styles.dayEvent2Desc}>{e.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo evento</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-group">
              <label>Título</label>
              <input type="text" placeholder="Nombre del evento" value={newEvent.title} onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <div className={styles.typeSelector}>
                {EVENT_TYPES.map(t => (
                  <button key={t.value} className={`${styles.typeBtn} ${newEvent.type === t.value ? styles.typeBtnActive : ''}`} style={{ '--type-color': t.color }} onClick={() => setNewEvent(prev => ({ ...prev, type: t.value, color: t.color }))}>
                    <span className={styles.typeDot} style={{ background: t.color }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" value={newEvent.date} onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Hora inicio</label>
                <input type="time" value={newEvent.startTime} onChange={e => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Hora fin</label>
                <input type="time" value={newEvent.endTime} onChange={e => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea placeholder="Detalles del evento..." value={newEvent.description} onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveEvent}>Guardar evento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
