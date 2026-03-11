'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { id: 1, name: 'Trabajo', color: '#3b82f6', icon: '💼' },
  { id: 2, name: 'Personal', color: '#10b981', icon: '🏠' },
  { id: 3, name: 'Estudio', color: '#8b5cf6', icon: '📚' },
  { id: 4, name: 'Salud', color: '#ef4444', icon: '❤️' },
  { id: 5, name: 'Casa', color: '#f59e0b', icon: '🏡' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('tasks');
  const [newTask, setNewTask] = useState({ title: '', description: '', category: 'Trabajo', priority: 'medium', dueDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [tasksRes, goalsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('goals').select('*').order('created_at'),
      ]);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (goalsRes.data) setGoals(goalsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t));
    await supabase.from('tasks').update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    }).eq('id', id);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (!showCompleted && t.completed) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleSaveTask = async () => {
    if (!newTask.title.trim()) return;
    const { data, error } = await supabase.from('tasks').insert({
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      due_date: newTask.dueDate || null,
      completed: false,
    }).select().single();
    if (data) setTasks(prev => [data, ...prev]);
    setShowModal(false);
    setNewTask({ title: '', description: '', category: 'Trabajo', priority: 'medium', dueDate: '' });
  };

  return (
    <div className={styles.tasksPage}>
      <div className="page-header">
        <div>
          <h1>{view === 'tasks' ? 'Tareas' : 'Objetivos'}</h1>
          <p className="subtitle">{view === 'tasks' ? 'Gestiona tu día a día' : 'Tus metas a corto y largo plazo'}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${view === 'tasks' ? 'active' : ''}`} onClick={() => setView('tasks')}>Tareas</button>
            <button className={`tab ${view === 'goals' ? 'active' : ''}`} onClick={() => setView('goals')}>Objetivos</button>
          </div>
          {view === 'tasks' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva tarea
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}>
          <div className="loading-spinner" />
        </div>
      ) : view === 'tasks' ? (
        <>
          {/* Daily Progress */}
          <div className={styles.progressSection}>
            <div className={styles.progressInfo}>
              <span className={styles.progressText}>Progreso del día</span>
              <span className={styles.progressPercent}>{progressPercent}%</span>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div className="fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className={styles.progressSub}>{completedCount} de {tasks.length} tareas completadas</span>
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.categoryFilters}>
              <button className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`} onClick={() => setFilter('all')}>Todas</button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.filterBtn} ${filter === cat.name ? styles.filterActive : ''}`}
                  onClick={() => setFilter(cat.name)}
                >
                  <span className="color-dot" style={{ background: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
            <label className={styles.toggleLabel}>
              <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} className={styles.toggleInput} />
              <span className={styles.toggleText}>Mostrar completadas</span>
            </label>
          </div>

          {/* Task List */}
          <div className={styles.taskList}>
            {filteredTasks.map(task => {
              const cat = CATEGORIES.find(c => c.name === task.category);
              return (
                <div key={task.id} className={`${styles.taskCard} ${task.completed ? styles.taskCompleted : ''}`}>
                  <div className={`checkbox ${task.completed ? 'checked' : ''}`} onClick={() => toggleTask(task.id)}>
                    {task.completed && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <div className={styles.taskContent}>
                    <div className={styles.taskTop}>
                      <span className={`${styles.taskTitle} ${task.completed ? styles.titleDone : ''}`}>{task.title}</span>
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                    <div className={styles.taskMeta}>
                      {cat && <span className={styles.taskCat} style={{ color: cat.color }}>{cat.name}</span>}
                      {task.due_date && <span className={styles.taskDue}>{task.due_date}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className={styles.goalsList}>
          {goals.map(goal => (
            <div key={goal.id} className={`card ${styles.goalCard}`}>
              <div className={styles.goalHeader}>
                <h4>{goal.title}</h4>
                <span className={`badge ${styles.periodBadge}`}>{goal.period === 'daily' ? 'Diario' : goal.period === 'weekly' ? 'Semanal' : 'Mensual'}</span>
              </div>
              <div className={styles.goalCategory}>{goal.category}</div>
              <div className={styles.goalProgress}>
                <div className="progress-bar" style={{ height: '10px' }}>
                  <div className="fill" style={{ width: `${goal.progress}%` }} />
                </div>
                <span className={styles.goalPercent}>{goal.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva tarea</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-group">
              <label>Título</label>
              <input type="text" placeholder="¿Qué necesitas hacer?" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea placeholder="Detalles opcionales..." value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select value={newTask.category} onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Prioridad</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Fecha límite</label>
              <input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveTask}>Crear tarea</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
