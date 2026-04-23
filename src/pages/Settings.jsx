import React, { useState } from 'react';
import { Plus, Edit, Trash2, Settings as SettingsIcon, Check, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Settings = ({ categories, setCategories }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', prefix: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', prefix: '' });

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, prefix: cat.prefix });
  };

  const handleSaveEdit = async (id) => {
    const { error } = await supabase.from('categories').update(editForm).eq('id', id);
    if (!error) {
      setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...editForm } : cat));
      setEditingId(null);
    } else {
      alert('Failed to update category.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
      } else {
        alert('Failed to delete category.');
      }
    }
  };

  const handleAdd = async () => {
    if (!newForm.name || !newForm.prefix) return alert('Name and Prefix are required.');
    const { data, error } = await supabase.from('categories').insert([{ name: newForm.name, prefix: newForm.prefix }]).select();
    if (!error && data && data.length > 0) {
      setCategories(prev => [...prev, data[0]]);
      setIsAdding(false);
      setNewForm({ name: '', prefix: '' });
    } else {
      alert('Failed to add new category.');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '8px', backgroundColor: '#E5F0FF', borderRadius: '8px', color: 'var(--apple-accent)' }}>
            <SettingsIcon size={20} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Contract Category & Numbering Rules</h2>
        </div>

        <p style={{ color: 'var(--apple-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          Define the contract categories and their corresponding prefixes. 
          When an employee creates a new contract, the system will automatically generate a contract number formatted as <strong>PREFIX-YY***</strong> (e.g., GJSCKJ-26001).
        </p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Prefix</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="table-row">
                  {editingId === cat.id ? (
                    <>
                      <td>
                        <input 
                          value={editForm.name} 
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--apple-border)', width: '100%' }}
                        />
                      </td>
                      <td>
                        <input 
                          value={editForm.prefix} 
                          onChange={e => setEditForm({ ...editForm, prefix: e.target.value.toUpperCase() })}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--apple-border)', width: '100%' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleSaveEdit(cat.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#34C759', marginRight: '8px' }}>
                          <Check size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--apple-text-secondary)' }}>
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ fontWeight: 500 }}>{cat.name}</td>
                      <td>
                        <span style={{ backgroundColor: '#F5F5F7', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}>
                          {cat.prefix}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleEditClick(cat)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--apple-accent)', marginRight: '12px' }}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#FF3B30' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {isAdding && (
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  <td>
                    <input 
                      placeholder="e.g. 软件授权合同"
                      value={newForm.name} 
                      onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--apple-border)', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input 
                      placeholder="e.g. RJSQ"
                      value={newForm.prefix} 
                      onChange={e => setNewForm({ ...newForm, prefix: e.target.value.toUpperCase() })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--apple-border)', width: '100%' }}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={handleAdd} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#34C759', marginRight: '8px' }}>
                      <Check size={18} />
                    </button>
                    <button onClick={() => setIsAdding(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--apple-text-secondary)' }}>
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isAdding && (
          <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => setIsAdding(true)}>
            <Plus size={16} />
            Add New Category
          </button>
        )}
      </div>
    </div>
  );
};

export default Settings;
