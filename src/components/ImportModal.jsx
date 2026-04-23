import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { OUR_PARTIES } from '../data';
import { Upload, X, FileSpreadsheet, CheckCircle } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport, categories = [] }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [importCategory, setImportCategory] = useState('');

  useEffect(() => {
    // UI no longer relies on a fallback dropdown; category comes from sheet name
  }, [categories]);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        let allMappedData = [];
        
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (!aoa || aoa.length === 0) continue;

          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(10, aoa.length); i++) {
            if (aoa[i] && (aoa[i].includes('合同编号') || aoa[i].includes('序号') || aoa[i].includes('编号'))) {
              headerRowIndex = i;
              break;
            }
          }

          const json = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, raw: false, defval: '' });
          
          const mappedData = json.map((row, index) => {
            let partyA = row['我方签约主体'] || '';
            if (typeof partyA === 'string') {
              partyA = partyA.trim();
            }

            let parsedDate = row['签订时间'];
            if (!parsedDate || typeof parsedDate !== 'string' || parsedDate.trim() === '') {
              parsedDate = '-';
            }
            
            // Flexible header mapping
            const contractNumber = row['合同编号'] || row['编号'];
            const contractTitle = row['合同主要内容'] || row['项目'];
            const contractOwner = row['经办人'] || row['负责人'];

            if (!contractNumber) return null;

            return {
              id: `imported_${Date.now()}_${sheetName}_${index}`,
              number: contractNumber,
              partyA: partyA,
              partyB: row['合同相对方'] || '-',
              title: contractTitle || '未命名合同',
              amount: row['金额'] || '-',
              owner: contractOwner || '-',
              date: parsedDate,
              paperArchived: row['纸质版归档状态'] || '未归档',
              electronicArchived: row['电子版归档状态'] || '未归档',
              remarks: row['备注'] || '',
              type: sheetName, // Sheet name maps directly to Category
              status: 'active',
              ownerId: 'u1'
            };
          }).filter(Boolean);
          
          allMappedData = allMappedData.concat(mappedData);
        }
        
        setParsedData(allMappedData);
        setError('');
      } catch (err) {
        setError('Error parsing the file. Please make sure it is a valid Excel file.');
        setParsedData(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      onImport(parsedData);
      setParsedData(null);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card fade-in" style={{ width: '500px', maxWidth: '90vw', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Import Contracts</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--apple-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {!parsedData ? (
          <>
            <div className="info-group" style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', color: 'var(--apple-text-secondary)', display: 'block' }}>
                系统将自动读取 Excel 文件中的所有 Sheet 标签。
                <br/>
                **注意：系统会将每条合同的“分类”自动绑定为您 Excel 中对应 Sheet 的名称！**
              </span>
            </div>
            
            <div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--apple-accent)' : 'var(--apple-border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center',
              backgroundColor: dragActive ? '#E5F0FF' : 'var(--apple-bg-secondary)',
              transition: 'all var(--transition-fast)', cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef} type="file" accept=".xlsx, .xls, .csv" 
              onChange={handleChange} style={{ display: 'none' }} 
            />
            <Upload size={32} color={dragActive ? 'var(--apple-accent)' : 'var(--apple-text-secondary)'} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 500, marginBottom: '8px' }}>Click or drag file to this area to upload</p>
            <p style={{ fontSize: '12px', color: 'var(--apple-text-secondary)' }}>Supports .xlsx, .xls, .csv files</p>
            {error && <p style={{ color: '#FF3B30', fontSize: '14px', marginTop: '16px' }}>{error}</p>}
          </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckCircle size={48} color="#34C759" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>File Parsed Successfully</h3>
            <p style={{ color: 'var(--apple-text-secondary)', marginBottom: '24px' }}>
              Found {parsedData.length} contracts ready to be imported.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setParsedData(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirm}>Import {parsedData.length} Contracts</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
