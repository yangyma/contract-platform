import React from 'react';
import { FileText, Clock, Archive } from 'lucide-react';

const Dashboard = ({ contracts }) => {
  const activeCount = contracts.filter(c => c.status === 'active').length;
  const draftCount = contracts.filter(c => c.status === 'draft').length;
  const archivedCount = contracts.filter(c => c.status === 'archived').length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', backgroundColor: '#E5F0FF', borderRadius: '12px', color: 'var(--apple-accent)' }}>
              <FileText size={24} />
            </div>
            <div style={{ color: 'var(--apple-text-secondary)', fontWeight: 500 }}>Active Contracts</div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 600 }}>{activeCount}</div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', backgroundColor: '#F5F5F7', borderRadius: '12px', color: 'var(--apple-text-secondary)' }}>
              <Clock size={24} />
            </div>
            <div style={{ color: 'var(--apple-text-secondary)', fontWeight: 500 }}>Drafts</div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 600 }}>{draftCount}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', backgroundColor: '#FFF0F0', borderRadius: '12px', color: '#FF3B30' }}>
              <Archive size={24} />
            </div>
            <div style={{ color: 'var(--apple-text-secondary)', fontWeight: 500 }}>Archived</div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 600 }}>{archivedCount}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Recent Activity</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Contract No.</th>
                <th>Title (合同主要内容)</th>
                <th>Category (分类)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.slice(0, 3).map(c => (
                <tr key={c.id} className="table-row">
                  <td style={{ fontWeight: 500 }}>{c.number}</td>
                  <td>{c.title}</td>
                  <td>{c.type}</td>
                  <td>
                    <span className={`badge badge-${c.status}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--apple-text-secondary)' }}>
                    No recent activity found.
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

export default Dashboard;
