'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, FolderTree, ChevronRight,
  ChevronDown, Eye, EyeOff, Star, StarOff, FolderPlus
} from 'lucide-react';
import api from '@/lib/api';

const MOCK_CATEGORIES = [
  { id: '1', name: 'Development Boards', slug: 'development-boards', level: 0, parent_id: null, is_active: true, is_featured: true, order: 0 },
  { id: '2', name: 'Arduino', slug: 'arduino', level: 1, parent_id: '1', is_active: true, is_featured: false, order: 0 },
  { id: '3', name: 'Raspberry Pi', slug: 'raspberry-pi', level: 1, parent_id: '1', is_active: true, is_featured: false, order: 1 },
  { id: '4', name: 'Sensors & Modules', slug: 'sensors-modules', level: 0, parent_id: null, is_active: true, is_featured: true, order: 1 },
  { id: '5', name: 'Motors & Actuators', slug: 'motors-actuators', level: 0, parent_id: null, is_active: true, is_featured: false, order: 2 },
  { id: '6', name: 'Drone Parts', slug: 'drone-parts', level: 0, parent_id: null, is_active: true, is_featured: true, order: 3 },
  { id: '7', name: 'Batteries & Power', slug: 'batteries-power', level: 0, parent_id: null, is_active: true, is_featured: false, order: 4 },
  { id: '8', name: 'Displays', slug: 'displays', level: 0, parent_id: null, is_active: true, is_featured: false, order: 5 },
];

// ─── Category Form Modal ───
function CategoryFormModal({ category, parentCategories, onClose, onSave }) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image: category?.image || '',
    icon: category?.icon || '',
    parent_id: category?.parent_id || '',
    is_active: category?.is_active ?? true,
    is_featured: category?.is_featured ?? false,
    order: category?.order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Category name is required');
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        parent_id: form.parent_id || null,
        order: Number(form.order) || 0,
      };

      if (isEdit) {
        await api.put(`/categories/${category.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      onSave();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
    setSaving(false);
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{isEdit ? 'Edit Category' : 'Add New Category'}</h3>
          <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="admin-modal-body">
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input className="form-input" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Development Boards" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Category description..." rows={2} />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Category</label>
            <select className="form-input form-select" value={form.parent_id} onChange={e => updateField('parent_id', e.target.value)}>
              <option value="">None (Top-level category)</option>
              {parentCategories.filter(c => c.id !== category?.id && !c.parent_id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Select a parent to make this a subcategory</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" value={form.image} onChange={e => updateField('image', e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label className="form-label">Icon (emoji or class)</label>
              <input className="form-input" value={form.icon} onChange={e => updateField('icon', e.target.value)} placeholder="⚡ or icon-name" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sort Order</label>
            <input className="form-input" type="number" value={form.order} onChange={e => updateField('order', e.target.value)} placeholder="0" style={{ width: 120 }} />
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div className="toggle">
                <input type="checkbox" checked={form.is_active} onChange={e => updateField('is_active', e.target.checked)} />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Active</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div className="toggle">
                <input type="checkbox" checked={form.is_featured} onChange={e => updateField('is_featured', e.target.checked)} />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Featured</span>
            </label>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="btn-admin btn-admin-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
            {isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───
function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="confirm-dialog">
          <div className="confirm-icon"><Trash2 size={24} /></div>
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-text">{message}</p>
          <div className="confirm-buttons">
            <button className="btn-admin btn-admin-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-admin btn-admin-danger" onClick={onConfirm} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Category Tree Row ───
function CategoryRow({ category, children, depth, onEdit, onDelete, onAddSub, expandedIds, toggleExpand }) {
  const hasChildren = children && children.length > 0;
  const isExpanded = expandedIds.has(category.id);

  return (
    <>
      <tr style={depth > 0 ? { background: 'rgba(201,168,76,0.02)' } : {}}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: depth * 28 }}>
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span style={{ width: 20 }} />
            )}
            <div style={{
              width: 30, height: 30, borderRadius: 'var(--r-md)',
              background: depth === 0 ? 'linear-gradient(135deg, var(--gold-muted), rgba(201,168,76,0.15))' : 'var(--navy-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', flexShrink: 0,
            }}>
              {category.icon || (depth === 0 ? <FolderTree size={14} style={{ color: 'var(--gold)' }} /> : <FolderTree size={12} style={{ color: 'var(--text-muted)' }} />)}
            </div>
            <div>
              <div className="cell-primary" style={{ fontSize: '0.85rem' }}>{category.name}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{category.slug}</div>
            </div>
          </div>
        </td>
        <td style={{ fontSize: '0.8rem' }}>
          {depth === 0 ? (
            <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.75rem', background: 'var(--gold-muted)', padding: '2px 8px', borderRadius: 'var(--r-full)' }}>
              Parent
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sub</span>
          )}
        </td>
        <td>
          <div style={{ display: 'flex', gap: 4 }}>
            {category.is_featured && (
              <span className="status-badge status-confirmed" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Featured</span>
            )}
            {category.is_active ? (
              <span className="status-badge status-delivered" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Active</span>
            ) : (
              <span className="status-badge status-cancelled" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Inactive</span>
            )}
          </div>
        </td>
        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{category.order}</td>
        <td>
          <div style={{ display: 'flex', gap: 4 }}>
            {depth === 0 && (
              <button className="btn-admin btn-admin-secondary btn-admin-sm" onClick={() => onAddSub(category)} title="Add subcategory"
                style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem' }}>
                <FolderPlus size={12} /> Sub
              </button>
            )}
            <button className="btn-admin btn-admin-secondary btn-admin-icon btn-admin-sm" onClick={() => onEdit(category)} title="Edit">
              <Edit2 size={13} />
            </button>
            <button className="btn-admin btn-admin-danger btn-admin-icon btn-admin-sm" onClick={() => onDelete(category)} title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
      {hasChildren && isExpanded && children.map(child => (
        <CategoryRow
          key={child.id}
          category={child}
          children={child._children || []}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSub={onAddSub}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
        />
      ))}
    </>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/admin/flat');
      if (res.data && res.data.length > 0) {
        setCategories(res.data);
      } else {
        setCategories(MOCK_CATEGORIES);
      }
    } catch {
      setCategories(MOCK_CATEGORIES);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(categories.filter(c => !c.parent_id).map(c => c.id)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete. Remove subcategories first.');
    }
    setDeleting(false);
  };

  const handleAddSub = (parent) => {
    setEditCategory({ parent_id: parent.id, _isNewSub: true });
    setShowForm(true);
  };

  // Build tree structure
  const parentCats = categories.filter(c => !c.parent_id);
  const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId).sort((a, b) => a.order - b.order);

  const filteredParents = parentCats
    .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getChildren(c.id).some(ch => ch.name.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => a.order - b.order);

  const parentCount = parentCats.length;
  const subCount = categories.filter(c => c.parent_id).length;
  const featuredCount = categories.filter(c => c.is_featured).length;

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage product categories and subcategories</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={() => { setEditCategory(null); setShowForm(true); }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="animate-in animate-in-1">
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon products"><FolderTree size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--white)' }}>{parentCount}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Parent Categories</div>
            </div>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon orders"><FolderPlus size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)' }}>{subCount}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Subcategories</div>
            </div>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon revenue"><Star size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>{featuredCount}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Featured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar animate-in animate-in-2">
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" size={15} />
          <input className="toolbar-search-input" placeholder="Search categories..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <button className="btn-admin btn-admin-secondary btn-admin-sm" onClick={expandAll}>
          <ChevronDown size={13} /> Expand All
        </button>
      </div>

      {/* Table */}
      <div className="dash-card animate-in animate-in-3">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Level</th>
                <th>Status</th>
                <th>Order</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (<td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>))}</tr>
                ))
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><FolderTree size={28} /></div>
                      <h3 className="empty-state-title">No categories found</h3>
                      <p className="empty-state-text">Create your first category to organize products.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredParents.map(cat => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  children={getChildren(cat.id)}
                  depth={0}
                  onEdit={(c) => { setEditCategory(c); setShowForm(true); }}
                  onDelete={(c) => setDeleteTarget(c)}
                  onAddSub={handleAddSub}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <CategoryFormModal
          category={editCategory?._isNewSub ? { parent_id: editCategory.parent_id } : editCategory}
          parentCategories={categories}
          onClose={() => { setShowForm(false); setEditCategory(null); }}
          onSave={() => { setShowForm(false); setEditCategory(null); fetchCategories(); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteTarget.name}"? Subcategories must be removed first.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
