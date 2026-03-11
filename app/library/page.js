'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

const TYPE_ICONS = {
  movie: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
  series: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
  book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  music: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
};

const STATUS_LABELS = {
  completed: 'Completado', watching: 'Viendo', reading: 'Leyendo', pending: 'Pendiente', abandoned: 'Abandonado',
};

const TYPE_COLORS = {
  movie: '#3b82f6', series: '#8b5cf6', book: '#10b981', music: '#f59e0b',
};

export default function LibraryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = create, object = edit
  const [formData, setFormData] = useState({ type: 'movie', title: '', year: '', author: '', rating: 0, status: 'pending', review: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [attachFile, setAttachFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef(null);
  const attachInputRef = useRef(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase.from('library_items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  const filteredItems = items.filter(item => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && !(item.author || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    movies: items.filter(i => i.type === 'movie').length,
    series: items.filter(i => i.type === 'series').length,
    books: items.filter(i => i.type === 'book').length,
    music: items.filter(i => i.type === 'music').length,
  };

  const uploadFile = async (file, folder) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from('uploads').upload(filePath, file);
    if (error) { console.error('Upload error:', error); return ''; }
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const openCreateModal = () => {
    setEditItem(null);
    setFormData({ type: 'movie', title: '', year: '', author: '', rating: 0, status: 'pending', review: '', tags: [] });
    setCoverFile(null);
    setCoverPreview(null);
    setAttachFile(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      year: item.year || '',
      author: item.author || '',
      rating: item.rating || 0,
      status: item.status || 'pending',
      review: item.review || '',
      tags: item.tags || [],
    });
    setCoverFile(null);
    setCoverPreview(item.cover_url || null);
    setAttachFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setUploading(true);

    let coverUrl = editItem?.cover_url || '';
    let attachmentUrl = editItem?.attachment_url || '';
    let attachmentName = editItem?.attachment_name || '';

    if (coverFile) {
      coverUrl = await uploadFile(coverFile, 'library/covers');
    }
    if (attachFile) {
      attachmentUrl = await uploadFile(attachFile, 'library/attachments');
      attachmentName = attachFile.name;
    }

    const payload = {
      type: formData.type,
      title: formData.title,
      year: parseInt(formData.year) || null,
      author: formData.author,
      rating: formData.rating,
      status: formData.status,
      review: formData.review,
      tags: formData.tags,
      cover_url: coverUrl,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
    };

    if (editItem) {
      // Update
      const { data } = await supabase.from('library_items').update(payload).eq('id', editItem.id).select().single();
      if (data) setItems(prev => prev.map(i => i.id === data.id ? data : i));
    } else {
      // Create
      payload.progress = '';
      payload.user_id = user?.id || null;
      const { data } = await supabase.from('library_items').insert(payload).select().single();
      if (data) setItems(prev => [data, ...prev]);
    }

    setShowModal(false);
    setEditItem(null);
    setCoverFile(null);
    setCoverPreview(null);
    setAttachFile(null);
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!editItem) return;
    await supabase.from('library_items').delete().eq('id', editItem.id);
    setItems(prev => prev.filter(i => i.id !== editItem.id));
    setShowModal(false);
    setEditItem(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(p => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.libraryPage}>
      <div className="page-header">
        <div>
          <h1>Biblioteca</h1>
          <p className="subtitle">Tu colección cultural personal</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Añadir
        </button>
      </div>

      <div className={styles.stats}>
        {[
          { label: 'Películas', count: stats.movies, color: TYPE_COLORS.movie, icon: TYPE_ICONS.movie },
          { label: 'Series', count: stats.series, color: TYPE_COLORS.series, icon: TYPE_ICONS.series },
          { label: 'Libros', count: stats.books, color: TYPE_COLORS.book, icon: TYPE_ICONS.book },
          { label: 'Música', count: stats.music, color: TYPE_COLORS.music, icon: TYPE_ICONS.music },
        ].map(s => (
          <div key={s.label} className={styles.statCard} style={{ '--stat-color': s.color }}>
            <div className={styles.statIcon}>{s.icon}</div>
            <span className={styles.statCount}>{s.count}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.filterRow}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>Todos</button>
          <button className={`tab ${typeFilter === 'movie' ? 'active' : ''}`} onClick={() => setTypeFilter('movie')}>Películas</button>
          <button className={`tab ${typeFilter === 'series' ? 'active' : ''}`} onClick={() => setTypeFilter('series')}>Series</button>
          <button className={`tab ${typeFilter === 'book' ? 'active' : ''}`} onClick={() => setTypeFilter('book')}>Libros</button>
          <button className={`tab ${typeFilter === 'music' ? 'active' : ''}`} onClick={() => setTypeFilter('music')}>Música</button>
        </div>
        <div className="search-bar" style={{ maxWidth: '280px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="loading-spinner" /></div>
      ) : (
        <div className={styles.libraryGrid}>
          {filteredItems.map(item => (
            <div key={item.id} className={`card ${styles.itemCard}`} onClick={() => openEditModal(item)} style={{ cursor: 'pointer' }}>
              <div className={styles.itemCover} style={item.cover_url ? { backgroundImage: `url(${item.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: `linear-gradient(135deg, ${TYPE_COLORS[item.type]}22, ${TYPE_COLORS[item.type]}08)` }}>
                {!item.cover_url && <div className={styles.itemTypeIcon} style={{ color: TYPE_COLORS[item.type] }}>{TYPE_ICONS[item.type]}</div>}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemTop}>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  <span className={styles.itemYear}>{item.year}</span>
                </div>
                <p className={styles.itemAuthor}>{item.author}</p>
                <div className={styles.itemStars}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ color: star <= item.rating ? '#fbbf24' : 'var(--border-secondary)', fontSize: '14px' }}>★</span>
                  ))}
                </div>
                <div className={styles.itemBottom}>
                  <span className={styles.statusBadge} style={{ background: TYPE_COLORS[item.type] + '18', color: TYPE_COLORS[item.type] }}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                  {item.attachment_url && (
                    <a href={item.attachment_url} target="_blank" rel="noopener noreferrer" className={styles.attachLink} onClick={e => e.stopPropagation()} title={item.attachment_name}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    </a>
                  )}
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className={styles.itemTags}>
                    {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditItem(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Editar elemento' : 'Añadir a biblioteca'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditItem(null); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}>
                <option value="movie">Película</option>
                <option value="series">Serie</option>
                <option value="book">Libro</option>
                <option value="music">Música</option>
              </select>
            </div>
            <div className="form-group">
              <label>Título</label>
              <input type="text" placeholder="Título..." value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{formData.type === 'book' ? 'Autor' : formData.type === 'music' ? 'Artista' : 'Director'}</label>
                <input type="text" placeholder="..." value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Año</label>
                <input type="number" placeholder="2024" value={formData.year} onChange={e => setFormData(p => ({ ...p, year: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Portada (imagen)</label>
              <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverSelect} style={{ display: 'none' }} />
              <button className={`btn btn-secondary ${styles.uploadBtn}`} onClick={() => coverInputRef.current?.click()} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {coverFile ? coverFile.name : coverPreview ? 'Cambiar portada' : 'Subir portada'}
              </button>
              {coverPreview && (
                <div className={styles.coverPreview}>
                  <img src={coverPreview} alt="cover preview" />
                  <button onClick={() => { setCoverFile(null); setCoverPreview(null); }} className={styles.removeCover}>✕</button>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Archivo adjunto</label>
              <input type="file" ref={attachInputRef} onChange={e => setAttachFile(e.target.files[0] || null)} style={{ display: 'none' }} />
              <button className={`btn btn-secondary ${styles.uploadBtn}`} onClick={() => attachInputRef.current?.click()} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                {attachFile ? attachFile.name : editItem?.attachment_name ? `${editItem.attachment_name} (cambiar)` : 'Adjuntar archivo'}
              </button>
            </div>
            <div className="form-group">
              <label>Valoración</label>
              <div className="star-rating">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className={`star ${star <= formData.rating ? 'filled' : ''}`} onClick={() => setFormData(p => ({ ...p, rating: star }))}>★</span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                <option value="pending">Pendiente</option>
                <option value="watching">{formData.type === 'book' ? 'Leyendo' : formData.type === 'music' ? 'Escuchando' : 'Viendo'}</option>
                <option value="completed">Completado</option>
                <option value="abandoned">Abandonado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Etiquetas</label>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <input type="text" placeholder="Añadir etiqueta..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <button className="btn btn-secondary" onClick={addTag}>+</button>
              </div>
              {formData.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginTop: 'var(--sp-2)' }}>
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag">{tag} <span className="remove" onClick={() => removeTag(tag)}>×</span></span>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Opinión</label>
              <textarea placeholder="Tu opinión personal..." value={formData.review} onChange={e => setFormData(p => ({ ...p, review: e.target.value }))} />
            </div>
            <div className="form-actions">
              {editItem && (
                <button className="btn btn-ghost" onClick={handleDelete} style={{ color: 'var(--error)', marginRight: 'auto' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Eliminar
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => { setShowModal(false); setEditItem(null); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={uploading}>
                {uploading ? 'Subiendo...' : editItem ? 'Guardar cambios' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
