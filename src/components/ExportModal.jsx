import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExportModal = ({ isOpen, onClose, contracts }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    // Filter contracts by date
    let filteredContracts = contracts;
    
    if (startDate) {
      filteredContracts = filteredContracts.filter(c => new Date(c.date) >= new Date(startDate));
    }
    if (endDate) {
      filteredContracts = filteredContracts.filter(c => new Date(c.date) <= new Date(endDate));
    }

    if (filteredContracts.length === 0) {
      alert('No contracts found in the selected date range.');
      return;
    }

    // Map to export format
    const exportData = filteredContracts.map(c => ({
      '合同编号': c.number,
      '我方签约主体': c.partyA,
      '合同相对方': c.partyB,
      '合同主要内容': c.title,
      '金额': c.amount,
      '经办人': c.owner,
      '签订时间': c.date,
      '纸质版归档状态': c.paperArchived,
      '电子版归档状态': c.electronicArchived,
      '分类': c.type,
      '备注': c.remarks,
      '系统状态': c.status
    }));

    // Generate Excel file
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts");
    
    // Download
    XLSX.writeFile(workbook, `Contracts_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card fade-in" style={{ width: '400px', maxWidth: '90vw', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Export Contracts</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--apple-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--apple-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          Select a date range to export contracts. If left blank, all contracts will be exported.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <div className="info-group">
            <label className="info-label">Start Date (From)</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none' }} 
            />
          </div>
          
          <div className="info-group">
            <label className="info-label">End Date (To)</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--apple-border)', outline: 'none' }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={16} />
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
