import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      setError('登录失败: ' + error.message);
    } else {
      const user = data.user;
      // 设定您自己的邮箱为超级管理员，其他人全是普通员工
      const isAdmin = user.email === 'ma.yangyue@star.vision';
      
      onLogin({
        id: user.id,
        email: user.email,
        name: user.email.split('@')[0],
        role: isAdmin ? 'admin' : 'employee',
        avatar: user.email.charAt(0).toUpperCase()
      });
    }
    setLoading(false);
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
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#005bb5' : '#0071e3',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { if(!loading) e.target.style.backgroundColor = '#0077ED'; }}
            onMouseLeave={(e) => { if(!loading) e.target.style.backgroundColor = '#0071e3'; }}
            onMouseDown={(e) => { if(!loading) e.target.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { if(!loading) e.target.style.transform = 'scale(1.02)'; }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '32px', fontSize: '12px', color: '#86868b', textAlign: 'center', lineHeight: '1.5' }}>
          Contact your administrator to get an account.
        </div>
      </div>
    </div>
  );
};

export default Login;
