import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Upload, Download } from 'lucide-react';

const ContractList = ({ contracts, categories, user, onOpenImport, onOpenCreate, onOpenExport }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' ? true : 
                       activeTab === 'Active' ? c.status === 'active' : 
                       activeTab === 'Drafts' ? c.status === 'draft' : 
                       c.status === 'archived';
    const matchesCategory = categoryFilter ? c.type === categoryFilter : true;
    
    return matchesSearch && matchesTab && matchesCategory;
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
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--apple-border)',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'var(--apple-text-primary)'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <div className="search-bar">
              <Search size={16} color="var(--apple-text-secondary)" />
              <input 
                type="text" 
                placeholder="Search by Title or No..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

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
