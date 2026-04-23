import React, { useState } from 'react';
import { MOCK_USER_ADMIN, MOCK_USER_EMPLOYEE } from '../data';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin(MOCK_USER_ADMIN);
    } else if (username === 'employee' && password === 'employee') {
      onLogin(MOCK_USER_EMPLOYEE);
    } else {
      setError('Invalid username or password. Try admin/admin or employee/employee.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f7',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f5f5f7 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div className="card fade-in" style={{
        width: '400px',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        borderRadius: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <img 
          src="/logo.png" 
          alt="STAR VISION Logo" 
          style={{ width: '220px', marginBottom: '32px', objectFit: 'contain' }}
        />
        
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#1d1d1f' }}>
          Contract Platform
        </h1>
        <p style={{ color: '#86868b', marginBottom: '32px', fontSize: '14px' }}>
          Sign in to manage your contracts
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '16px' }}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #d2d2d7',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0071e3';
                e.target.style.boxShadow = '0 0 0 4px rgba(0,113,227,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d2d2d7';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #d2d2d7',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0071e3';
                e.target.style.boxShadow = '0 0 0 4px rgba(0,113,227,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d2d2d7';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {error && <div style={{ color: '#ff3b30', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#0071e3',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0077ED';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#0071e3';
              e.target.style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1.02)'}
          >
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '32px', fontSize: '12px', color: '#86868b', textAlign: 'center', lineHeight: '1.5' }}>
          Demo Credentials:<br/>
          <strong>admin</strong> / <strong>admin</strong><br/>
          <strong>employee</strong> / <strong>employee</strong>
        </div>
      </div>
    </div>
  );
};

export default Login;
