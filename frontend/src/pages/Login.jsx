import React, { useState } from 'react';
import { Terminal, Lock, Mail, ArrowRight } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8081/api' 
  : `${window.location.origin.replace(':5173', ':8081')}/api`;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error de autenticación');
      }
      
      if (data.user) {
        onLogin(data.user);
      } else {
        throw new Error('Identidad de usuario no encontrada');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el nodo central');
    } finally {
      setLoading(false);
    }
  };

  const ACCENT_COLOR = '#58a6ff';

  return (
    <div className="login-container" style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #161b22, #0d1117)', padding: '20px'
    }}>
      <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '420px', padding: '3.5rem 2.5rem', 
        borderRadius: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
             <img src="https://cloudnative.university/img/logo-w2x.png" style={{ height: '40px' }} alt="CNU" />
             <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 950, fontSize: '1.4rem', lineHeight: 1, letterSpacing: '-1px' }}>
                  Cloud Native<br/><span style={{ color: ACCENT_COLOR }}>University.</span>
                </div>
             </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
             Domina los Contenedores y Kubernetes.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', color: '#ff6b6b', padding: '1rem', 
            borderRadius: '16px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Email Académico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.2rem', borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                color: 'white', outline: 'none', fontSize: '0.95rem'
              }}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="Security Key (Contraseña)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.2rem', borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                color: 'white', outline: 'none', fontSize: '0.95rem'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ 
              padding: '1.1rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem',
              marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
            }}
          >
            {loading ? 'Validando...' : 'Entrar a la Universidad'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>


        <div style={{ marginTop: '2.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          System ID: <span style={{ color: ACCENT_COLOR, fontWeight: 700 }}>CNU-OS-2026</span>
        </div>

        <div style={{ 
          position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px',
          background: ACCENT_COLOR, opacity: 0.1, filter: 'blur(80px)', pointerEvents: 'none'
        }}></div>
      </div>
    </div>
  );
}
