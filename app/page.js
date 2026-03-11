'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { supabase } from './lib/supabase';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [latestMood, setLatestMood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [tasksRes, eventsRes, goalsRes, moodRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('calendar_events').select('*').eq('date', today).order('start_time').limit(3),
        supabase.from('goals').select('*').eq('status', 'active').order('created_at').limit(3),
        supabase.from('diary_entries').select('*').order('date', { ascending: false }).limit(1),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
      if (goalsRes.data) setGoals(goalsRes.data);
      if (moodRes.data && moodRes.data.length > 0) setLatestMood(moodRes.data[0]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="subtitle">Tu resumen del día</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Tu resumen del día</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Progress Circle Widget */}
        <div className={`card ${styles.progressWidget}`}>
          <div className={styles.widgetHeader}>
            <h4>Progreso diario</h4>
            <span className={styles.widgetBadge}>{completedTasks}/{totalTasks}</span>
          </div>
          <div className={styles.progressCircleWrap}>
            <svg className={styles.progressCircle} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-primary)" strokeWidth="6"/>
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className={styles.progressValue}>
              <span className={styles.progressNumber}>{progressPercent}%</span>
              <span className={styles.progressLabel}>completado</span>
            </div>
          </div>
        </div>

        {/* Today's Tasks Widget */}
        <div className={`card ${styles.tasksWidget}`}>
          <div className={styles.widgetHeader}>
            <h4>Tareas de hoy</h4>
            <button className="btn btn-ghost" style={{ fontSize: 'var(--fs-xs)' }}>Ver todas</button>
          </div>
          <div className={styles.taskList}>
            {tasks.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                  {task.completed && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <div className={styles.taskInfo}>
                  <span className={`${styles.taskTitle} ${task.completed ? styles.completed : ''}`}>{task.title}</span>
                  <span className={styles.taskCategory}>{task.category}</span>
                </div>
                <span className={`priority-badge ${task.priority}`}>{
                  task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'
                }</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events Widget */}
        <div className={`card ${styles.eventsWidget}`}>
          <div className={styles.widgetHeader}>
            <h4>Próximos eventos</h4>
            <button className="btn btn-ghost" style={{ fontSize: 'var(--fs-xs)' }}>Calendario</button>
          </div>
          <div className={styles.eventList}>
            {events.map(event => (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.eventTime}>{event.start_time}</div>
                <div className={styles.eventLine} style={{ background: event.color }} />
                <div className={styles.eventInfo}>
                  <span className={styles.eventTitle}>{event.title}</span>
                  <span className={styles.eventType}>{event.type}</span>
                </div>
              </div>
            ))}
            {events.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>No hay eventos hoy</p>}
          </div>
        </div>

        {/* Goals Widget */}
        <div className={`card ${styles.goalsWidget}`}>
          <div className={styles.widgetHeader}>
            <h4>Objetivos activos</h4>
            <span className={styles.widgetBadge}>{goals.length} activos</span>
          </div>
          <div className={styles.goalList}>
            {goals.map(goal => (
              <div key={goal.id} className={styles.goalItem}>
                <div className={styles.goalTop}>
                  <span className={styles.goalTitle}>{goal.title}</span>
                  <span className={styles.goalPercent}>{goal.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="fill" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Widget */}
        <div className={`card ${styles.moodWidget}`}>
          <div className={styles.widgetHeader}>
            <h4>Estado de ánimo</h4>
            <span className={styles.moodDate}>Hoy</span>
          </div>
          <div className={styles.moodDisplay}>
            <span className={styles.moodEmoji}>{latestMood?.mood || '😊'}</span>
            <span className={styles.moodText}>{latestMood?.title || 'Sin entrada'}</span>
            <p className={styles.moodNote}>{latestMood?.content?.slice(0, 100) || 'Escribe en el diario para registrar tu estado de ánimo'}{latestMood?.content?.length > 100 ? '...' : ''}</p>
          </div>
        </div>

        {/* Quick Actions Widget */}
        <div className={`card ${styles.quickWidget}`}>
          <div className={styles.widgetHeader}>
            <h4>Acciones rápidas</h4>
          </div>
          <div className={styles.quickActions}>
            <button className={styles.quickBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Nueva tarea</span>
            </button>
            <button className={styles.quickBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              <span>Nuevo evento</span>
            </button>
            <button className={styles.quickBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span>Escribir diario</span>
            </button>
            <button className={styles.quickBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              <span>Añadir a biblioteca</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
