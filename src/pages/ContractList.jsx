import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Upload, Download, Trash2 } from 'lucide-react';

const ContractList = ({ contracts, categories, user, onOpenImport, onOpenCreate, onOpenExport, onDelete }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [partyAFilter, setPartyAFilter] = useState('');
  const [partyBFilter, setPartyBFilter] = useState('');

  const availableYears = Array.from(new Set(
    contracts.map(c => {
      if (!c.date || c.date === '-') return null;
      const match = c.date.match(/^(\d{4})/);
      return match ? match[1] : null;
    }).filter(Boolean)
  )).sort((a, b) => b - a);

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' ? true : 
                       activeTab === 'Active' ? c.status === 'active' : 
                       activeTab === 'Drafts' ? c.status === 'draft' : 
                       c.status === 'archived';
    const matchesCategory = categoryFilter ? c.type === categoryFilter : true;
    const matchesPartyA = partyAFilter ? c.partyA?.toLowerCase().includes(partyAFilter.toLowerCase()) : true;
    const matchesPartyB = partyBFilter ? c.partyB?.toLowerCase().includes(partyBFilter.toLowerCase()) : true;
    const matchesYear = yearFilter ? c.date?.startsWith(yearFilter) : true;
    
    return matchesSearch && matchesTab && matchesCategory && matchesPartyA && matchesPartyB && matchesYear;
  });

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

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--apple-text-secondary)', alignSelf: 'center', marginRight: '8px', minWidth: '40px' }}>分类:</span>
          <div 
            className="badge" 
            style={{ 
              cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
              backgroundColor: categoryFilter === '' ? 'var(--apple-blue)' : 'var(--apple-bg-secondary)', 
              color: categoryFilter === '' ? '#fff' : 'var(--apple-text-primary)' 
            }}
            onClick={() => setCategoryFilter('')}
          >
            全部
          </div>
          {categories.map(cat => (
            <div 
              key={cat.id}
              className="badge" 
              style={{ 
                cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
                backgroundColor: categoryFilter === cat.name ? 'var(--apple-blue)' : 'var(--apple-bg-secondary)', 
                color: categoryFilter === cat.name ? '#fff' : 'var(--apple-text-primary)' 
              }}
              onClick={() => setCategoryFilter(cat.name)}
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
                backgroundColor: yearFilter === '' ? 'var(--apple-blue)' : 'var(--apple-bg-secondary)', 
                color: yearFilter === '' ? '#fff' : 'var(--apple-text-primary)' 
              }}
              onClick={() => setYearFilter('')}
            >
              全部
            </div>
            {availableYears.map(year => (
              <div 
                key={year}
                className="badge" 
                style={{ 
                  cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
                  backgroundColor: yearFilter === year ? 'var(--apple-blue)' : 'var(--apple-bg-secondary)', 
                  color: yearFilter === year ? '#fff' : 'var(--apple-text-primary)' 
                }}
                onClick={() => setYearFilter(year)}
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
                <th>纸质版归档</th>
                <th>状态 (Status)</th>
                <th>操作 (Actions)</th>
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
                  <td>{c.amount}</td>
                  <td style={{ color: 'var(--apple-text-secondary)' }}>{c.date}</td>
                  <td>{c.paperArchived}</td>
                  <td>
                    <span className={`badge badge-${c.status}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onDelete(c.id)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: '#ff3b30',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Delete Contract"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--apple-text-secondary)', padding: '40px' }}>
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
