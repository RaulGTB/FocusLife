'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

export default function CollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ title: '', description: '', icon: '📁', color: '#10b981' });
  const [newItem, setNewItem] = useState({ title: '', description: '' });
  const [itemFile, setItemFile] = useState(null);
  const [itemFilePreview, setItemFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    setLoading(true);
    const { data } = await supabase.from('collections').select('*, collection_items(*)').order('order_index');
    if (data) {
      setCollections(data.map(c => ({
        ...c,
        items: (c.collection_items || []).sort((a, b) => a.order_index - b.order_index),
      })));
    }
    setLoading(false);
  }

  const handleSaveCollection = async () => {
    if (!newCollection.title.trim()) return;
    const { data } = await supabase.from('collections').insert({
      title: newCollection.title,
      description: newCollection.description,
      icon: newCollection.icon,
      color: newCollection.color,
      order_index: collections.length,
      user_id: user?.id || null,
    }).select('*, collection_items(*)').single();
    if (data) setCollections(prev => [...prev, { ...data, items: data.collection_items || [] }]);
    setShowModal(false);
    setNewCollection({ title: '', description: '', icon: '📁', color: '#10b981' });
  };

  const uploadFile = async (file) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filePath = `collections/${fileName}`;
    const { error } = await supabase.storage.from('uploads').upload(filePath, file);
    if (error) { console.error('Upload error:', error); return null; }
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
    return { url: urlData.publicUrl, name: file.name, type: file.type };
  };

  const handleSaveItem = async () => {
    if (!newItem.title.trim() || !selectedCollection) return;
    setUploading(true);
    let fileData = { url: '', name: '', type: '' };
    if (itemFile) {
      const result = await uploadFile(itemFile);
      if (result) fileData = result;
    }
    const { data } = await supabase.from('collection_items').insert({
      collection_id: selectedCollection.id,
      title: newItem.title,
      description: newItem.description,
      completed: false,
      order_index: selectedCollection.items.length,
      file_url: fileData.url,
      file_name: fileData.name,
      file_type: fileData.type,
    }).select().single();
    if (data) {
      const updatedItems = [...selectedCollection.items, data];
      setSelectedCollection(prev => ({ ...prev, items: updatedItems }));
      setCollections(prev => prev.map(c => c.id === selectedCollection.id ? { ...c, items: updatedItems } : c));
    }
    setShowItemModal(false);
    setNewItem({ title: '', description: '' });
    setItemFile(null);
    setItemFilePreview(null);
    setUploading(false);
  };

  const toggleItem = async (collId, itemId) => {
    const coll = collections.find(c => c.id === collId);
    if (!coll) return;
    const item = coll.items.find(i => i.id === itemId);
    if (!item) return;
    const newCompleted = !item.completed;
    const updateItems = (items) => items.map(i => i.id === itemId ? { ...i, completed: newCompleted } : i);
    setCollections(prev => prev.map(c => c.id === collId ? { ...c, items: updateItems(c.items) } : c));
    if (selectedCollection && selectedCollection.id === collId) {
      setSelectedCollection(prev => ({ ...prev, items: updateItems(prev.items) }));
    }
    await supabase.from('collection_items').update({ completed: newCompleted }).eq('id', itemId);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setItemFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setItemFilePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setItemFilePreview(null);
    }
  };

  const isImage = (type) => type && type.startsWith('image/');

  const ICON_OPTIONS = ['📁', '🎁', '🍽️', '✈️', '📱', '🎀', '🎵', '🎬', '📚', '🏋️', '🎮', '🧳', '💡', '🎯', '🌟', '❤️'];
  const COLOR_OPTIONS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#6366f1'];

  return (
    <div className={styles.collectionsPage}>
      <div className="page-header">
        <div>
          <h1>{selectedCollection ? selectedCollection.title : 'Colecciones'}</h1>
          <p className="subtitle">{selectedCollection ? selectedCollection.description : 'Tus listas y tableros personalizados'}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          {selectedCollection && (
            <button className="btn btn-ghost" onClick={() => setSelectedCollection(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Volver
            </button>
          )}
          <button className="btn btn-primary" onClick={() => selectedCollection ? setShowItemModal(true) : setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {selectedCollection ? 'Añadir ítem' : 'Nueva colección'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="loading-spinner" /></div>
      ) : !selectedCollection ? (
        <div className={styles.collectionsGrid}>
          {collections.map(col => (
            <div key={col.id} className={`card ${styles.collectionCard}`} onClick={() => setSelectedCollection(col)} style={{ '--col-color': col.color }}>
              <div className={styles.collectionIcon} style={{ background: col.color + '18' }}>
                <span style={{ fontSize: '28px' }}>{col.icon}</span>
              </div>
              <h4 className={styles.collectionTitle}>{col.title}</h4>
              <p className={styles.collectionDesc}>{col.description}</p>
              <div className={styles.collectionMeta}>
                <span>{col.items.length} ítems</span>
                <span>{col.items.filter(i => i.completed).length} completados</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 'var(--sp-3)' }}>
                <div className="fill" style={{ width: `${col.items.length > 0 ? (col.items.filter(i => i.completed).length / col.items.length) * 100 : 0}%`, background: col.color }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.collectionDetail}>
          <div className={styles.itemList}>
            {selectedCollection.items.map(item => (
              <div key={item.id} className={`${styles.itemCard} ${item.completed ? styles.itemDone : ''}`}>
                <div className={`checkbox ${item.completed ? 'checked' : ''}`} onClick={() => toggleItem(selectedCollection.id, item.id)} style={item.completed ? { background: selectedCollection.color, borderColor: selectedCollection.color } : {}}>
                  {item.completed && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <span className={`${styles.itemTitle} ${item.completed ? styles.titleDone : ''}`}>{item.title}</span>
                  {item.description && <span className={styles.itemDesc}>{item.description}</span>}
                </div>
                {item.file_url && (
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer" className={styles.fileAttachment} onClick={e => e.stopPropagation()}>
                    {isImage(item.file_type) ? (
                      <img src={item.file_url} alt={item.file_name} className={styles.fileThumbnail} />
                    ) : (
                      <div className={styles.fileIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                        <span style={{ fontSize: 'var(--fs-xs)' }}>{item.file_name?.slice(0,15)}</span>
                      </div>
                    )}
                  </a>
                )}
              </div>
            ))}
            {selectedCollection.items.length === 0 && (
              <div className="empty-state">
                <p>Esta colección está vacía. Añade tu primer ítem.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva colección</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" placeholder="Nombre de la colección" value={newCollection.title} onChange={e => setNewCollection(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea placeholder="¿De qué trata esta colección?" value={newCollection.description} onChange={e => setNewCollection(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Icono</label>
              <div className={styles.iconPicker}>
                {ICON_OPTIONS.map(icon => (
                  <button key={icon} className={`${styles.iconBtn} ${newCollection.icon === icon ? styles.iconActive : ''}`} onClick={() => setNewCollection(p => ({ ...p, icon }))}>{icon}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className={styles.colorPicker}>
                {COLOR_OPTIONS.map(color => (
                  <button key={color} className={`${styles.colorBtn} ${newCollection.color === color ? styles.colorActive : ''}`} style={{ background: color }} onClick={() => setNewCollection(p => ({ ...p, color }))} />
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveCollection}>Crear colección</button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo ítem</h3>
              <button className="modal-close" onClick={() => setShowItemModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-group">
              <label>Título</label>
              <input type="text" placeholder="Nombre del ítem" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea placeholder="Detalles..." value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Archivo adjunto (opcional)</label>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
              <button className={`btn btn-secondary ${styles.uploadBtn}`} onClick={() => fileInputRef.current?.click()} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {itemFile ? itemFile.name : 'Subir archivo o foto'}
              </button>
              {itemFilePreview && (
                <div className={styles.uploadPreview}>
                  <img src={itemFilePreview} alt="preview" />
                  <button onClick={() => { setItemFile(null); setItemFilePreview(null); }} className={styles.removeFile}>✕</button>
                </div>
              )}
              {itemFile && !itemFilePreview && (
                <div className={styles.fileSelected}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                  <span>{itemFile.name}</span>
                  <button onClick={() => { setItemFile(null); setItemFilePreview(null); }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>✕</button>
                </div>
              )}
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => { setShowItemModal(false); setItemFile(null); setItemFilePreview(null); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveItem} disabled={uploading}>
                {uploading ? 'Subiendo...' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
