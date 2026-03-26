import React, { useState, useEffect } from 'react';
import { Play, Terminal, Zap, Check, RefreshCw, UserCircle, ShieldAlert, ShieldCheck, LogOut, ChevronLeft, ArrowLeft, PanelLeftClose, PanelLeftOpen, Trophy, Frown, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8081/api' 
  : `${window.location.origin.replace(':5173', ':8081')}/api`;
const LOGO_URL = 'https://cloudnative.university/img/logo-w2x.png';

// Elite Lab Guide System (20 Specific K8s Challenges)
// Se cargara dinamicamente desde el backend segun el proyecto
const DEFAULT_TASKS = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, {
  title: `Cargando Laboratorio ${i + 1}...`,
  module: "Cargando...",
  content: "Preparando contenido del entorno educativo.",
  goal: "Cargando objetivos...",
  steps: [{ t: "Cargando", c: "kubectl..." }]
}]));


const RESPONSIVE_STYLES = `
  .btn-text { display: none; }
  @media (min-width: 1200px) {
    .btn-text { display: inline-block; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px; }
  }
  @media (max-width: 1024px) {
    .user-info { display: none !important; }
    .logo-text { display: none; }
  }
  @media (max-width: 768px) {
    .workspace-sidebar { position: fixed; z-index: 1000; height: calc(100% - 80px); width: 100% !important; left: 0; top: 80px; }
  }
  .progress-scroll::-webkit-scrollbar { height: 3px; }
  .progress-scroll::-webkit-scrollbar-thumb { background: rgba(88, 166, 255, 0.3); border-radius: 10px; }
`;

export default function Workspace({ user, onLogout, onBack, course, classCode, systemMode }) {
  const [loading, setLoading] = useState(false);
  const [activeLabId, setActiveLabId] = useState(1);
  const [ideUrl, setIdeUrl] = useState(() => localStorage.getItem(`cnu_ide_${user?.email}_${course}`));
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
  
  const [labs, setLabs] = useState(Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    status: 'pending',
    title: `Tarea ${i + 1}`
  })));

  const [labTasks, setLabTasks] = useState(DEFAULT_TASKS);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Cargar contenido dinamico del proyecto
  useEffect(() => {
    const fetchLabContent = async () => {
      try {
        const resp = await fetch(`${API_URL}/lab-content?course=${course}`);
        if (resp.ok) {
          const data = await resp.json();

          if (data.tasks) {
            setLabTasks(data.tasks);
            // Actualizar titulos de los labs
            setLabs(prev => prev.map(l => ({
              ...l,
              title: data.tasks[l.id]?.title || `Tarea ${l.id}`
            })));
          }
        }
      } catch (e) {
        console.error("No se pudo cargar la guia del proyecto", e);
      }
    };
    fetchLabContent();
  }, [course]);

  // Persistence effect
  useEffect(() => {
    if (ideUrl) {
      localStorage.setItem(`cnu_ide_${user?.email}_${course}`, ideUrl);
    }
  }, [ideUrl, user?.email, course]);

  const TEACHER_URL = import.meta.env.VITE_TEACHER_URL || 'https://vagotropic-emigrational-luetta.ngrok-free.dev';
  const [syncStatus, setSyncStatus] = useState('offline');

  const syncWithTeacher = async (progressData) => {
    if (!user?.email || !progressData) return;
    setSyncStatus('syncing');
    try {
      await fetch(`${API_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: user.email,
          student_name: user.name,
          class_code: classCode,
          exercise_id: course,
          progress: progressData
        })
      });
      setSyncStatus('online');
    } catch (e) {
      setSyncStatus('offline');
    }
  };

  useEffect(() => {
    const syncProgress = async () => {
      if (!user?.email) return;
      try {
        const resp = await fetch(`${API_URL}/progress?email=${user.email}&course=${course}`);
        if (resp.ok) {
          const data = await resp.json();

          // Merge remote progress into our local 20-lab state
          const completedIds = new Set((data.progress || []).map(p => p.task_id));
          setLabs(prev => prev.map(lab => ({
            ...lab,
            status: completedIds.has(lab.id) ? 'completed' : 'pending'
          })));
        }
      } catch (e) {
        console.error("Failed to sync remote progress");
      }
    };
    syncProgress();
    // Run sync every time ideUrl changes or every 30s
    const interval = setInterval(syncProgress, 30000);
    return () => clearInterval(interval);
  }, [course, user?.email, ideUrl]);

  const startExercise = async () => {
    setLoading(true);
    setError(null);
    setIdeUrl(null); 
    try {
      const resp = await fetch(`${API_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: user?.email || 'student-dev',
          course_id: course || 'kubernetes',
          exercise_id: String(activeLabId) || '1',
          class_code: classCode || 'NX2301',
        }),

      });
      
      if (!resp.ok) {
        throw new Error('Failed to provision container. Backend might be down.');
      }

      const data = await resp.json();
      
      setTimeout(() => {
        setIdeUrl(data.url);
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const verifyTask = async (taskId) => {
    if (!user?.email || !ideUrl) return;
    setLoadingProgress(true);
    try {
      const resp = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          task_id: taskId
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.completed) {
          setLabs(prev => prev.map(l => l.id === taskId ? { ...l, status: 'completed' } : l));
          setToast({ type: 'success', message: `¡Tarea #${taskId} completada con éxito!` });
          await syncWithTeacher(labs);
        } else {
          setToast({ type: 'error', message: `La Tarea #${taskId} aún no cumple los requisitos. Verifica e intenta de nuevo.` });
        }
      } else {
        setToast({ type: 'error', message: "Error al comunicar con el orquestador." });
      }
    } catch (e) {
      console.error("Verification failed for task", taskId);
      setToast({ type: 'error', message: "Error interno de validación." });
    } finally {
      setLoadingProgress(false);
    }
  };

  const checkProgress = async () => {
    if (!user?.email || !ideUrl) return;
    setLoadingProgress(true);
    try {
      const resp = await fetch(`${API_URL}/progress?email=${user.email}`);
      if (resp.ok) {
        const data = await resp.json();
        const completedIds = new Set((data.progress || []).map(p => p.task_id));
        setLabs(prev => prev.map(lab => ({
          ...lab,
          status: completedIds.has(lab.id) ? 'completed' : 'pending'
        })));
        setToast({ type: 'success', message: 'Progreso sincronizado con el instructor.' });
      }
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: 'Error al sincronizar con el servidor.' });
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const resetProgress = async () => {
    // Immediate UI feedback
    setLabs(prev => prev.map(l => ({ ...l, status: 'pending' })));
    setLoadingProgress(true);
    try {
      const resp = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      });
      if (!resp.ok) {
        throw new Error("Reset failed on server");
      }
      // Re-sync with teacher (empty progress)
      setLabs(prev => prev.map(l => ({ ...l, status: 'pending' })));
      setIdeUrl(null);
      localStorage.removeItem(`cnu_ide_${user?.email}_${course}`);
      await syncWithTeacher([]);
    } catch (e) {
      console.error("Reset Error:", e);
      // Fallback: sync again via background timer
    } finally {
      setLoadingProgress(false);
    }
  };

  const ACCENT_COLOR = '#58a6ff';

  return (
    <div className="workspace-wrapper" style={{ gap: '1rem', height: 'calc(100vh - 3rem)', padding: '0 0.5rem' }}>
      {/* Expressive Feedback Modal */}
      {toast && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', maxWidth: '380px', padding: '3rem 2rem', textAlign: 'center',
            border: `2px solid ${toast.type === 'success' ? '#2ea043' : '#ff7b72'}`,
            background: 'rgba(13, 17, 23, 0.9)',
            boxShadow: `0 0 50px ${toast.type === 'success' ? 'rgba(46, 160, 67, 0.4)' : 'rgba(255, 123, 114, 0.4)'}`,
            borderRadius: '32px',
            animation: 'modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ 
              marginBottom: '1.5rem', display: 'inline-flex', padding: '1.5rem', 
              borderRadius: '50%', background: toast.type === 'success' ? 'rgba(46, 160, 67, 0.1)' : 'rgba(255, 123, 114, 0.1)',
              color: toast.type === 'success' ? '#2ea043' : '#ff7b72'
            }}>
              {toast.type === 'success' ? <Trophy size={64} /> : <Frown size={64} />}
            </div>
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#fff', marginBottom: '1rem', lineHeight: 1.2 }}>
              {toast.type === 'success' ? '¡RETO SUPERADO!' : '¡CASI LO TIENES!'}
            </h2>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '2rem' }}>
              {toast.message}
              {toast.type === 'error' && <><br/><span style={{ color: '#ff7b72', display: 'block', marginTop: '0.5rem' }}>¡No te rindas, vuelve a intentarlo!</span></>}
            </p>

            <button 
              onClick={() => {
                if (toast.type === 'success' && activeLabId < 20) {
                  setActiveLabId(prev => prev + 1);
                  // Scroll sidebar to top to see new content
                  const sidebarEl = document.querySelector('.glass-panel[style*="width: 380px"]');
                  if (sidebarEl) sidebarEl.scrollTop = 0;
                }
                setToast(null);
              }}
              className="btn btn-primary"
              style={{ 
                width: '100%', padding: '1.1rem', borderRadius: '16px', fontWeight: 900,
                background: toast.type === 'success' ? '#2ea043' : '#f85149',
                border: 'none', color: '#fff', fontSize: '1rem'
              }}
            >
              {toast.type === 'success' ? 'CONTINUAR AL SIGUIENTE RETO' : 'ENTENDIDO, VOY A CORREGIR'}
            </button>
          </div>
        </div>
      )}

      {/* Redesigned Header: [Logo] | [Circles] ... [Sync][Profile][Exit] */}
      <div className="glass-panel" style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', marginBottom: '1rem', gap: '1rem' }}>
        
        {/* Left Side: Branding & Progress Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
          <img src={LOGO_URL} style={{ height: '32px' }} alt="CNU" />
          
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem', flexShrink: 0 }}></div>

          <div className="stepper-row progress-scroll" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', padding: '0.4rem 10px', maxWidth: '100%', whiteSpace: 'nowrap' }}>
            {labs.map((lab, index) => (
              <div key={lab.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button 
                  onClick={() => {
                    setActiveLabId(lab.id);
                  }}
                  title={`Validar Lab ${lab.id}: ${lab.title || ''}`}
                  disabled={loadingProgress || !ideUrl}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '0.8rem', fontWeight: 950, border: '2px solid', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: ideUrl ? 'pointer' : 'not-allowed',
                    background: lab.status === 'completed' ? 'var(--success)' : 
                               activeLabId === lab.id ? 'rgba(88, 166, 255, 0.2)' : 'rgba(13, 17, 23, 0.4)',
                    borderColor: lab.status === 'completed' ? 'var(--success)' : 
                                activeLabId === lab.id ? ACCENT_COLOR : 'rgba(255,255,255,0.1)',
                    color: lab.status === 'completed' ? '#fff' : 
                          activeLabId === lab.id ? ACCENT_COLOR : 'rgba(255,255,255,0.2)',
                    boxShadow: 'none',
                    transform: (lab.status === 'completed' || activeLabId === lab.id) ? 'scale(1.15)' : 'scale(1)'
                  }}
                >
                  {lab.status === 'completed' ? <Check size={14} strokeWidth={4} /> : lab.id}
                </button>
                {index < labs.length - 1 && (
                  <div style={{ width: '4px', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Actions: Sync, Profile, Logout */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
          <button 
            className="btn" 
            onClick={resetProgress} 
            title="Reiniciar todo el progreso de este laboratorio"
            style={{ 
              padding: '0.6rem 0.8rem', 
              background: 'rgba(255, 123, 114, 0.05)', 
              border: '1px solid rgba(255, 123, 114, 0.15)',
              color: '#ff7b72',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 123, 114, 0.15)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 123, 114, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 123, 114, 0.05)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
             <RotateCcw size={16} /> 
             <span className="btn-text">RESET</span>
          </button>

          {systemMode === 'academic' && (
            <button 
              className="btn" 
              onClick={checkProgress} 
              title="Sincronizar mi progreso con el servidor"
              disabled={loadingProgress}
              style={{ 
                padding: '0.6rem 0.8rem', 
                background: 'rgba(88, 166, 255, 0.05)', 
                border: '1px solid rgba(88, 166, 255, 0.15)',
                color: ACCENT_COLOR,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.15)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(88, 166, 255, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.05)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
               <RefreshCw size={16} className={loadingProgress ? "spin" : ""} /> 
               <span className="btn-text">SYNC</span>
            </button>
          )}

          <button 
            className="btn" 
            onClick={startExercise} 
            title="Reconectar con mi instancia de VS Code o forzar encendido"
            disabled={loading}
            style={{ 
              padding: '0.6rem 0.8rem', 
              background: 'rgba(46, 160, 67, 0.05)', 
              border: '1px solid rgba(46, 160, 67, 0.15)',
              color: 'var(--success)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(46, 160, 67, 0.15)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(46, 160, 67, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(46, 160, 67, 0.05)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
             <Zap size={16} className={loading ? "spin" : ""} fill={loading ? "none" : "currentColor"} /> 
             <span className="btn-text">CONNECT</span>
          </button>

          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '1rem' }}>
             <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#fff' }}>{user?.name || 'Victor Recio'}</div>
             <div style={{ fontSize: '0.65rem', color: ACCENT_COLOR, fontWeight: 700 }}>{classCode}</div>
          </div>

          <button onClick={onBack} title="Cerrar Sesión" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)', textAlign: 'center' }}>
          Error: {error}
        </div>
      )}

      {/* Main Layout Region */}
      <div style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden', minHeight: 0 }}>
        
        {/* Lab Progression Sidebar (Toggleable) */}
         {showSidebar ? (
          <div className="glass-panel workspace-sidebar" style={{ width: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
                     <Terminal size={18} color={ACCENT_COLOR} /> GUÍA DEL ESTUDIANTE
                  </h3>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fundamentos Kubernetes</p>
               </div>
               <button 
                  onClick={() => setShowSidebar(false)} 
                  title="Ocultar Guía"
                  className="btn" 
                  style={{ 
                    padding: '0.5rem', 
                    background: 'rgba(88, 166, 255, 0.1)', 
                    borderColor: 'rgba(88, 166, 255, 0.2)', 
                    color: ACCENT_COLOR,
                    borderRadius: '10px',
                    transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: '0 0 10px rgba(88, 166, 255, 0.1)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(88, 166, 255, 0.4)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(88, 166, 255, 0.1)'; }}
               >
                  <PanelLeftClose size={18} />
               </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', background: 'rgba(88, 166, 255, 0.1)', color: ACCENT_COLOR, borderRadius: '4px', fontWeight: 900 }}>
                      TASK {activeLabId}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>{labTasks[activeLabId]?.module}</span>
                  </div>
                  
                  <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800, marginBottom: '0.8rem' }}>{labTasks[activeLabId]?.title}</h4>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {labTasks[activeLabId]?.content}
                  </p>

                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: ACCENT_COLOR, marginBottom: '0.5rem' }}>OBJETIVO DEL RETO</div>
                    <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{labTasks[activeLabId]?.goal}</div>
                  </div>
                  
                  {labTasks[activeLabId]?.code && (
                    <div style={{ background: '#0d1117', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.65rem', color: ACCENT_COLOR, marginBottom: '0.5rem', fontWeight: 800 }}>PLANTILLA YAML</div>
                      <pre style={{ fontSize: '0.7rem', color: '#7ee787', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        {labTasks[activeLabId].code}
                      </pre>
                    </div>
                  )}

                  {labTasks[activeLabId]?.steps && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>PASOS EN TERMINAL</div>
                      {labTasks[activeLabId].steps.map((step, idx) => (
                        <div key={idx} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: `3px solid ${ACCENT_COLOR}` }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>{step.t}</div>
                          <code style={{ fontSize: '0.7rem', color: '#ff7b72' }}>{step.c}</code>
                        </div>
                      ))}
                    </div>
                  )}

                  {labTasks[activeLabId]?.bullets && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {labTasks[activeLabId].bullets.map((bullet, idx) => (
                        <li key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: ACCENT_COLOR }}>•</span> {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
               <button onClick={() => verifyTask(activeLabId)} disabled={loadingProgress || !ideUrl} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '12px', fontWeight: 800 }}>
                  {loadingProgress ? <RefreshCw className="spin" size={16} /> : <ShieldCheck size={18} />}
                  VALIDAR TAREA #{activeLabId}
               </button>
            </div>
          </div>
        ) : (
          /* Floating Neon Tab when Sidebar is collapsed */
          <div style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}>
            <button 
              onClick={() => setShowSidebar(true)}
              title="Mostrar Guía de Estudio"
              style={{ 
                background: 'rgba(29, 35, 43, 0.95)', 
                border: `2px solid ${ACCENT_COLOR}`, 
                borderLeft: 'none',
                color: ACCENT_COLOR, 
                padding: '1.2rem 0.5rem', 
                borderRadius: '0 15px 15px 0', 
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 0 20px rgba(88, 166, 255, 0.3)`,
                transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                animation: 'pulseGlow 2s infinite ease-in-out'
              }}
              onMouseOver={(e) => { e.currentTarget.style.paddingLeft = '0.8rem'; e.currentTarget.style.boxShadow = `0 0 40px ${ACCENT_COLOR}`; }}
              onMouseOut={(e) => { e.currentTarget.style.paddingLeft = '0.5rem'; e.currentTarget.style.boxShadow = `0 0 20px rgba(88, 166, 255, 0.3)`; }}
            >
              <PanelLeftOpen size={22} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* IDE Region */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {ideUrl ? (
            <div className="ide-container" style={{ position: 'relative', flex: 1, backgroundColor: '#1e1e1e', borderRadius: '24px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
              <iframe 
                src={ideUrl} 
                title="Labspace IDE"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          ) : (
            <div className="ide-placeholder glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.5rem', background: 'rgba(13, 17, 23, 0.3)', borderRadius: '24px' }}>
              <img src={LOGO_URL} style={{ height: '80px', opacity: 0.1, filter: 'grayscale(1)' }} />
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '-1px' }}>ESPERANDO LABORATORIO {course}...</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem' }}>Cargando el entorno de Cloud Native University.</p>
              </div>
              <button className="btn btn-primary" onClick={startExercise} disabled={loading} style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '20px' }}>
                 {loading ? <RefreshCw className="spin" size={20} /> : <Play size={20} fill="#000" />}
                 {loading ? 'Inicializando...' : 'Comenzar Laboratorio'}
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
