import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Clock } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Operation Logs</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '8px', backgroundColor: '#E5F0FF', borderRadius: '8px', color: 'var(--apple-accent)' }}>
            <Clock size={20} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>System Audit Trail</h2>
        </div>
        
        <p style={{ color: 'var(--apple-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          This log shows the most recent contract operations performed by users in the system.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#86868b' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#86868b' }}>No operations recorded yet.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Timestamp</th>
                  <th>User Email</th>
                  <th>Action</th>
                  <th>Contract Number</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="table-row">
                    <td style={{ color: 'var(--apple-text-secondary)', fontSize: '13px' }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {log.user_email}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: 
                          log.action.includes('Created') ? '#E8F5E9' : 
                          log.action.includes('Archived') ? '#FFF3E0' :
                          log.action.includes('Updated') ? '#E3F2FD' : '#F5F5F7',
                        color:
                          log.action.includes('Created') ? '#2E7D32' : 
                          log.action.includes('Archived') ? '#E65100' :
                          log.action.includes('Updated') ? '#1565C0' : '#1D1D1F'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {log.contract_number}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
