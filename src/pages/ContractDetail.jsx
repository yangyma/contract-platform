import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive, Edit, Printer, FileCheck, Shield, Upload, Trash2 } from 'lucide-react';
import EditContractModal from '../components/EditContractModal';

const ContractDetail = ({ contracts, categories, user, onArchive, onUpdate, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  const contract = contracts.find(c => c.id === id);

  if (!contract) {
    return <div>Contract not found</div>;
  }

  // Permission check
  if (user.role === 'employee' && contract.ownerId !== user.id) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', marginTop: '100px' }}>
        <Shield size={48} color="#FF3B30" style={{ margin: '0 auto', marginBottom: '16px' }} />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--apple-text-secondary)' }}>You do not have permission to view this contract.</p>
        <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => navigate('/contracts')}>
          Return to Contracts
        </button>
      </div>
    );
  }

  const handleArchive = () => {
    if (confirm('Are you sure you want to archive this contract? It will become read-only.')) {
      onArchive(contract.id);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to PERMANENTLY delete this contract? This action cannot be undone.')) {
      onDelete(contract.id);
      navigate('/contracts');
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate(contract.id, { ...contract, pdfUrl: event.target.result });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Please select a valid PDF file.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (event) => {
          onUpdate(contract.id, { ...contract, pdfUrl: event.target.result });
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid PDF file.');
      }
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/contracts')} style={{ padding: '6px 12px' }}>
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>{contract.title}</h1>
              <span className={`badge badge-${contract.status}`}>
                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </span>
            </div>
            <div className="detail-subtitle">Number: {contract.number}</div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {contract.status !== 'archived' && (
              <>
                <button className="btn btn-secondary" onClick={() => setIsEditOpen(true)}>
                  <Edit size={16} />
                  Edit
                </button>
                {(user.role === 'admin' || contract.ownerId === user.id) && (
                  <>
                    <button className="btn btn-secondary" style={{ color: '#FF3B30' }} onClick={handleArchive}>
                      <Archive size={16} />
                      Archive
                    </button>
                    <button className="btn btn-secondary" style={{ color: '#FF3B30' }} onClick={handleDelete}>
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', borderBottom: '1px solid var(--apple-border)', paddingBottom: '24px', marginBottom: '24px' }}>
          
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="var(--apple-accent)" />
              Basic Information
            </h3>
            <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="info-group">
                <span className="info-label">Category (分类)</span>
                <span className="info-value">{contract.type}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Amount (金额)</span>
                <span className="info-value">
                  {contract.currency === 'USD' || (contract.amount && contract.amount.toString().includes('$')) ? '$' : '¥'}
                  {parseFloat(contract.amount?.toString().replace(/[^\d.]/g, '') || 0).toLocaleString()}
                </span>
              </div>
              <div className="info-group">
                <span className="info-label">Signing Date (签订时间)</span>
                <span className="info-value">{contract.date}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Handler/Owner (经办人)</span>
                <span className="info-value">{contract.owner}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Parties Involved</h3>
            <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="info-group">
                <span className="info-label">Our Party (我方签约主体)</span>
                <span className="info-value">{contract.partyA}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Counterparty (合同相对方)</span>
                <span className="info-value">{contract.partyB}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Archive Status</h3>
            <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="info-group">
                <span className="info-label">Paper Archive (纸质版)</span>
                <span className="info-value">{contract.paperArchived}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Electronic Archive (电子版)</span>
                <span className="info-value">{contract.electronicArchived}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Remarks (备注)</span>
                <span className="info-value">{contract.remarks || '-'}</span>
              </div>
            </div>
          </div>

        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Contract Content / Preview</h3>
            {contract.pdfUrl && (user.role === 'admin' || contract.ownerId === user.id) && contract.status !== 'archived' && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => {
                  if (confirm('Are you sure you want to remove the uploaded PDF?')) {
                    onUpdate(contract.id, { ...contract, pdfUrl: null });
                  }
                }}
              >
                Remove PDF
              </button>
            )}
          </div>
          
          <div style={{ 
            backgroundColor: 'var(--apple-bg-secondary)', 
            borderRadius: 'var(--radius-md)',
            minHeight: '400px',
            border: contract.pdfUrl ? 'none' : '1px dashed var(--apple-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--apple-text-secondary)',
            overflow: 'hidden'
          }}>
            {contract.pdfUrl ? (
              <object 
                data={contract.pdfUrl} 
                type="application/pdf" 
                width="100%" 
                height="600px"
                style={{ border: 'none', display: 'block' }}
              >
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p>Your browser does not support inline PDFs.</p>
                  <a href={contract.pdfUrl} download="contract.pdf" className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-block' }}>
                    Download PDF
                  </a>
                </div>
              </object>
            ) : contract.status === 'archived' ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Archive size={48} color="var(--apple-border)" style={{ margin: '0 auto', marginBottom: '16px' }} />
                <p>This contract is archived and has no PDF attached.</p>
              </div>
            ) : (
              <div 
                style={{ 
                  textAlign: 'center', padding: '40px', cursor: 'pointer', width: '100%', height: '100%', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  transition: 'background-color var(--transition-fast)',
                  backgroundColor: dragActive ? '#E5F0FF' : 'transparent'
                }}
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={(e) => !dragActive && (e.currentTarget.style.backgroundColor = 'rgba(0, 113, 227, 0.05)')}
                onMouseLeave={(e) => !dragActive && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <input 
                  type="file" 
                  accept="application/pdf" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handlePdfUpload}
                />
                <Upload size={32} color={dragActive ? 'var(--apple-accent)' : 'var(--apple-text-secondary)'} style={{ marginBottom: '16px' }} />
                <p style={{ fontWeight: 500, color: dragActive ? 'var(--apple-accent)' : 'var(--apple-text)' }}>
                  {dragActive ? 'Drop PDF here' : 'Click or drag PDF here to upload'}
                </p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Supports .pdf files up to 50MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditContractModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onUpdate={onUpdate}
        initialData={contract}
        categories={categories}
      />
    </div>
  );
};

export default ContractDetail;
