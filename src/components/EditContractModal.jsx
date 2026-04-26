import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { OUR_PARTIES } from '../data';

const EditContractModal = ({ isOpen, onClose, onUpdate, initialData, categories = [] }) => {
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    type: '',
    partyA: '',
    partyB: '',
    amount: '',
    owner: '',
    date: '',
    paperArchived: '未归档',
    electronicArchived: '未归档',
    remarks: ''
  });

  const formatDateForInput = (dateStr) => {
    if (!dateStr || dateStr === '-' || dateStr === 'N/A') return '';
    // Replace dots or slashes with dashes
    let formatted = dateStr.replace(/[\.\/]/g, '-');
    // Ensure YYYY-MM-DD
    const match = formatted.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const yyyy = match[1];
      const mm = match[2].padStart(2, '0');
      const dd = match[3].padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: formatDateForInput(initialData.date)
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card fade-in" style={{ width: '600px', maxWidth: '90vw', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Edit Contract</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--apple-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="info-group">
              <label className="info-label">合同编号 (Contract No.)</label>
              <input required name="number" value={formData.number} onChange={handleChange} 
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none' }} />
            </div>

            <div className="info-group">
              <label className="info-label">合同主要内容 (Title)</label>
              <input required name="title" value={formData.title} onChange={handleChange} 
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none' }} />
            </div>

            <div className="info-group">
              <label className="info-label">分类 (Category)</label>
              <select required name="type" value={formData.type} onChange={handleChange}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none', backgroundColor: 'transparent' }}>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>

            <div className="info-group">
              <label className="info-label">签订时间 (Date)</label>
              <input type="date" required name="date" value={formData.date} onChange={handleChange} 
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none' }} />
            </div>

            <div className="info-group">
              <label className="info-label">我方签约主体 (Party A)</label>
              <select required name="partyA" value={formData.partyA} onChange={handleChange}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none', backgroundColor: 'transparent' }}>
                {OUR_PARTIES.map(party => <option key={party} value={party}>{party}</option>)}
              </select>
            </div>

            <div className="info-group">
              <label className="info-label">合同相对方 (Party B)</label>
              <input required name="partyB" value={formData.partyB} onChange={handleChange} 
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none' }} />
            </div>

            <div className="info-group">
              <label className="info-label">金额 (Amount)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select name="currency" value={formData.currency || (formData.amount?.toString().includes('$') ? 'USD' : 'RMB')} onChange={handleChange}
                  style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none', backgroundColor: 'transparent' }}>
                  <option value="RMB">¥ (RMB)</option>
                  <option value="USD">$ (USD)</option>
                </select>
                <input required name="amount" type="number" step="0.01" value={formData.amount?.toString().replace(/[^\d.]/g, '')} onChange={handleChange} placeholder="0.00"
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none' }} />
              </div>
            </div>

            <div className="info-group">
              <label className="info-label">经办人 (Owner)</label>
              <input required name="owner" value={formData.owner} onChange={handleChange} 
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none' }} />
            </div>

            <div className="info-group">
              <label className="info-label">纸质版归档</label>
              <select name="paperArchived" value={formData.paperArchived} onChange={handleChange}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none', backgroundColor: 'transparent' }}>
                <option value="未归档">未归档</option>
                <option value="已归档">已归档</option>
              </select>
            </div>

            <div className="info-group">
              <label className="info-label">电子版归档</label>
              <select name="electronicArchived" value={formData.electronicArchived} onChange={handleChange}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none', backgroundColor: 'transparent' }}>
                <option value="未归档">未归档</option>
                <option value="已归档">已归档</option>
              </select>
            </div>
          </div>

          <div className="info-group" style={{ marginTop: '16px' }}>
            <label className="info-label">备注 (Remarks)</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3"
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContractModal;
