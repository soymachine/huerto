import { useState, useRef, useEffect } from 'react';
import type { GardenMeta } from '../hooks/useGardenData';

interface Props {
  gardens:      GardenMeta[];
  activeId:     string | null;
  onSwitch:     (id: string) => void;
  onCreate:     (name: string) => void;
  onRename:     (id: string, name: string) => void;
  onDelete:     (id: string) => void;
}

export default function GardenSelector({ gardens, activeId, onSwitch, onCreate, onRename, onDelete }: Props) {
  const [open,     setOpen]     = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName,  setNewName]  = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const active = gardens.find(g => g.id === activeId);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setEditId(null);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setCreating(false);
    setOpen(false);
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    onRename(id, editName.trim());
    setEditId(null);
  };

  const handleDelete = (g: GardenMeta) => {
    if (!confirm(`¿Eliminar el huerto "${g.name}"? Esta acción no se puede deshacer.`)) return;
    onDelete(g.id);
    setOpen(false);
  };

  return (
    <div className="gs-wrap" ref={wrapRef}>
      <button className="gs-trigger" onClick={() => setOpen(v => !v)}>
        <span>🌿</span>
        <span className="gs-trigger-name">{active?.name ?? 'Mis huertos'}</span>
        <span className="gs-arrow">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="gs-dropdown">
          <div className="gs-list">
            {gardens.map(g => (
              <div key={g.id} className={`gs-item${g.id === activeId ? ' gs-active' : ''}`}>
                {editId === g.id ? (
                  <form
                    className="gs-edit-row"
                    onSubmit={e => { e.preventDefault(); handleRename(g.id); }}
                  >
                    <input
                      className="gs-edit-input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      autoFocus
                      onBlur={() => setEditId(null)}
                      onKeyDown={e => e.key === 'Escape' && setEditId(null)}
                    />
                  </form>
                ) : (
                  <>
                    <button
                      className="gs-item-name"
                      onClick={() => { onSwitch(g.id); setOpen(false); }}
                    >
                      {g.id === activeId && <span className="gs-check">✓</span>}
                      {g.name}
                    </button>
                    <div className="gs-item-actions">
                      <button
                        className="gs-btn-icon"
                        title="Renombrar"
                        onClick={() => { setEditId(g.id); setEditName(g.name); }}
                      >✏</button>
                      {gardens.length > 1 && (
                        <button
                          className="gs-btn-icon gs-btn-del"
                          title="Eliminar"
                          onClick={() => handleDelete(g)}
                        >✕</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="gs-footer">
            {creating ? (
              <form className="gs-create-row" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
                <input
                  className="gs-edit-input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Nombre del huerto…"
                  autoFocus
                  onKeyDown={e => e.key === 'Escape' && setCreating(false)}
                />
                <button type="submit" className="gs-btn-create">Crear</button>
              </form>
            ) : (
              <button className="gs-new-btn" onClick={() => setCreating(true)}>
                + Nuevo huerto
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
