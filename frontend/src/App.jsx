import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Workspace from './pages/Workspace';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cloudmaster_user');
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Retrying session after corruption cleanup...");
      localStorage.removeItem('cloudmaster_user');
      return null;
    }
  });

  const [selectedCourse, setSelectedCourse] = useState(() => localStorage.getItem('cnu_last_course') || null);
  const [classCode, setClassCode] = useState(() => localStorage.getItem('cnu_last_code') || null);
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('cnu_last_view') || 'landing'); // 'landing', 'profile', 'workspace'
  const [systemMode, setSystemMode] = useState('community');

  useEffect(() => {
    const fetchSystemMode = async () => {
      try {
        const resp = await fetch(`${API_URL}/system-mode`);
        if (resp.ok) {
          const data = await resp.json();
          setSystemMode(data.mode);
        }
      } catch (e) {
        console.error("System mode fetch failed");
      }
    };
    fetchSystemMode();
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('cloudmaster_user', JSON.stringify(userData));
    setUser(userData);
    setCurrentView('landing');
    localStorage.setItem('cnu_last_view', 'landing');
  };

  const handleLogout = () => {
    localStorage.removeItem('cloudmaster_user');
    localStorage.removeItem('cnu_last_course');
    localStorage.removeItem('cnu_last_code');
    localStorage.removeItem('cnu_last_view');
    setUser(null);
    setSelectedCourse(null);
    setClassCode(null);
    setCurrentView('landing');
  };

  const handleSelectCourse = (courseId, code) => {
    localStorage.setItem('cnu_last_course', courseId);
    localStorage.setItem('cnu_last_code', code);
    localStorage.setItem('cnu_last_view', 'workspace');
    setSelectedCourse(courseId);
    setClassCode(code);
    setCurrentView('workspace');
  };

  const setView = (view) => {
    localStorage.setItem('cnu_last_view', view);
    setCurrentView(view);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === 'profile') {
    return <Profile user={user} onBack={() => setCurrentView('landing')} onLogout={handleLogout} />;
  }

  if (currentView === 'landing' || !selectedCourse) {
    return (
      <Landing 
        user={user} 
        onLogout={handleLogout} 
        onSelectCourse={handleSelectCourse} 
        onViewProfile={() => setCurrentView('profile')} 
        systemMode={systemMode}
      />
    );
  }

  return (
    <Router>
      <div className="app-container">
        <main className="content-wrapper" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
           <Workspace 
             user={user} 
             onLogout={handleLogout} 
             onBack={() => {
                setSelectedCourse(null);
                setCurrentView('landing');
                localStorage.setItem('cnu_last_view', 'landing');
             }}

             course={selectedCourse}
             classCode={classCode}
             systemMode={systemMode}
            />
        </main>
      </div>
    </Router>
  );
}

export default App;
