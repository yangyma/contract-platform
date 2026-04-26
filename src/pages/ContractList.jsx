import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Upload, Download, Trash2 } from 'lucide-react';

const ContractList = ({ contracts, categories, user, onOpenImport, onOpenCreate, onOpenExport, onDelete }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [yearFilters, setYearFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [partyAFilter, setPartyAFilter] = useState('');
  const [partyBFilter, setPartyBFilter] = useState('');

  const extractYear = (number) => {
    if (!number) return null;
    // Format: 2026GA001 (starts with 4 digits)
    if (/^20\d{2}/.test(number)) {
      return number.substring(0, 4);
    }
    // Format: GJSCKJ-26011 (dash followed by YY)
    const match = number.match(/-(\d{2})/);
    if (match) {
      return '20' + match[1];
    }
    return null;
  };

  const availableYears = Array.from(new Set(
    contracts.map(c => extractYear(c.number)).filter(Boolean)
  )).sort((a, b) => b - a);

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' ? true : 
                       activeTab === 'Active' ? c.status === 'active' : 
                       activeTab === 'Drafts' ? c.status === 'draft' : 
                       c.status === 'archived';
    const matchesCategory = categoryFilters.length === 0 ? true : categoryFilters.includes(c.type);
    const matchesPartyA = partyAFilter ? c.partyA?.toLowerCase().includes(partyAFilter.toLowerCase()) : true;
    const matchesPartyB = partyBFilter ? c.partyB?.toLowerCase().includes(partyBFilter.toLowerCase()) : true;
    const matchesYear = yearFilters.length === 0 ? true : yearFilters.some(y => extractYear(c.number) === y);
    
    return matchesSearch && matchesTab && matchesCategory && matchesPartyA && matchesPartyB && matchesYear;
  }).sort((a, b) => {
    return a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' });
  });

  const totalUSD = filteredContracts.reduce((sum, c) => {
    if (!c.amount) return sum;
    // Extract numeric part
    const numericAmount = parseFloat(c.amount.toString().replace(/[^\d.]/g, '')) || 0;
    // Determine currency
    const isUSD = c.currency === 'USD' || c.amount.toString().includes('$');
    return sum + (isUSD ? numericAmount : numericAmount / 7.2);
  }, 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Contracts</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user.role === 'admin' && (
            <button className="btn btn-secondary" onClick={onOpenExport}>
              <Download size={16} />
              Export (Excel)
            </button>
          )}
          <button className="btn btn-secondary" onClick={onOpenImport}>
            <Upload size={16} />
            Import (Excel)
          </button>
          <button className="btn btn-primary" onClick={onOpenCreate}>
            <Plus size={16} />
            New Contract
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="tabs" style={{ marginBottom: 0, border: 'none' }}>
            {['All', 'Active', 'Drafts', 'Archived'].map(tab => (
              <div 
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar">
              <Search size={16} color="var(--apple-text-secondary)" />
              <input 
                type="text" 
                placeholder="Search by Title or No..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Amount Summary */}
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px 20px', 
          backgroundColor: 'rgba(0, 122, 255, 0.05)', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(0, 122, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--apple-text-secondary)', fontWeight: 500 }}>
              Showing {filteredContracts.length} contracts
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '14px', color: 'var(--apple-text-secondary)', marginRight: '8px' }}>Total Amount (Estimated USD):</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--apple-accent)' }}>
              ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--apple-text-tertiary)', marginTop: '2px' }}>
              Exchange Rate: 1 USD = 7.2 RMB
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--apple-text-secondary)', alignSelf: 'center', marginRight: '8px', minWidth: '40px' }}>分类:</span>
          <div 
            className="badge" 
            style={{ 
              cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
              backgroundColor: categoryFilters.length === 0 ? 'var(--apple-accent)' : 'var(--apple-bg-secondary)', 
              color: categoryFilters.length === 0 ? '#fff' : 'var(--apple-text-primary)' 
            }}
            onClick={() => setCategoryFilters([])}
          >
            全部
          </div>
          {categories.map(cat => (
            <div 
              key={cat.id}
              className="badge" 
              style={{ 
                cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
                backgroundColor: categoryFilters.includes(cat.name) ? 'var(--apple-accent)' : 'var(--apple-bg-secondary)', 
                color: categoryFilters.includes(cat.name) ? '#fff' : 'var(--apple-text-primary)' 
              }}
              onClick={() => {
                setCategoryFilters(prev => 
                  prev.includes(cat.name) ? prev.filter(c => c !== cat.name) : [...prev, cat.name]
                );
              }}
            >
              {cat.name}
            </div>
          ))}
        </div>

        {availableYears.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--apple-text-secondary)', alignSelf: 'center', marginRight: '8px', minWidth: '40px' }}>年份:</span>
            <div 
              className="badge" 
              style={{ 
                cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
                backgroundColor: yearFilters.length === 0 ? 'var(--apple-accent)' : 'var(--apple-bg-secondary)', 
                color: yearFilters.length === 0 ? '#fff' : 'var(--apple-text-primary)' 
              }}
              onClick={() => setYearFilters([])}
            >
              全部
            </div>
            {availableYears.map(year => (
              <div 
                key={year}
                className="badge" 
                style={{ 
                  cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
                  backgroundColor: yearFilters.includes(year) ? 'var(--apple-accent)' : 'var(--apple-bg-secondary)', 
                  color: yearFilters.includes(year) ? '#fff' : 'var(--apple-text-primary)' 
                }}
                onClick={() => {
                  setYearFilters(prev => 
                    prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
                  );
                }}
              >
                {year}
              </div>
            ))}
          </div>
        )}

        {showFilters && (
          <div style={{ 
            display: 'flex', gap: '16px', marginBottom: '24px', 
            padding: '16px', backgroundColor: 'var(--apple-bg-secondary)', 
            borderRadius: 'var(--radius-md)' 
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '4px' }}>
                我方签约主体 (Party A)
              </label>
              <input 
                type="text" 
                placeholder="Filter by Party A..." 
                value={partyAFilter}
                onChange={e => setPartyAFilter(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--apple-border)', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '4px' }}>
                合同相对方 (Party B)
              </label>
              <input 
                type="text" 
                placeholder="Filter by Party B..." 
                value={partyBFilter}
                onChange={e => setPartyBFilter(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--apple-border)', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setPartyAFilter(''); setPartyBFilter(''); }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '1000px' }}>
            <thead>
              <tr>
                <th>合同编号 (No.)</th>
                <th>合同主要内容 (Title)</th>
                <th>分类 (Category)</th>
                <th>我方签约主体</th>
                <th>合同相对方</th>
                <th>金额 (Amount)</th>
                <th>签订时间 (Date)</th>
                <th>经办人</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(c => (
                <tr key={c.id} className="table-row" onClick={() => navigate(`/contracts/${c.id}`)}>
                  <td style={{ fontWeight: 500 }}>{c.number}</td>
                  <td>{c.title}</td>
                  <td>{c.type}</td>
                  <td>{c.partyA}</td>
                  <td>{c.partyB}</td>
                  <td style={{ fontWeight: 600 }}>
                    {c.currency === 'USD' || (c.amount && c.amount.toString().includes('$')) ? '$' : '¥'}
                    {parseFloat(c.amount?.toString().replace(/[^\d.]/g, '') || 0).toLocaleString()}
                  </td>
                  <td style={{ color: 'var(--apple-text-secondary)' }}>{c.date}</td>
                  <td>{c.owner}</td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--apple-text-secondary)', padding: '40px' }}>
                    No contracts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractList;
