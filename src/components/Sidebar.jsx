import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Shield, LogOut } from 'lucide-react';

const Sidebar = ({ user, onChangeRole, onLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{ padding: '24px 16px 12px', height: 'auto', display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/logo.png" 
          alt="STAR VISION" 
          style={{ width: '150px', height: 'auto', objectFit: 'contain' }}
        />
      </div>
      
      <div className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink 
          to="/contracts" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <FileText size={20} />
          Contracts
        </NavLink>
        {user.role === 'admin' && (
          <NavLink 
            to="/settings" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <Settings size={20} />
            Settings
          </NavLink>
        )}
      </div>

      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <button 
          className="nav-item" 
          onClick={onLogout} 
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--apple-text-secondary)', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <div className="user-profile" onClick={onChangeRole}>
        <div className="avatar">{user.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--apple-text-secondary)' }}>
            {user.role === 'admin' ? 'Administrator' : 'Employee'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
