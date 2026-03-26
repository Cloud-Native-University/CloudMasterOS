import React, { useState, useEffect, useMemo } from 'react';
import { User, Mail, Shield, CheckCircle, Clock, Trophy, ChevronLeft, Zap, Award, BarChart3, Rocket, HelpCircle, BookOpen, Layout, Linkedin, Share2, ExternalLink } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8081/api' 
  : `${window.location.origin.replace(':5173', ':8081')}/api`;
const ACCENT_COLOR = '#58a6ff';
const GOLD_COLOR = '#ffab00';
const LOGO_URL = 'https://cloudnative.university/img/logo-w2x.png';

export default function Profile({ user, onBack, onLogout }) {
  const [stats, setStats] = useState({
    coursesStarted: 0,
    labsCompleted: 0
  });

  const [activeCourses, setActiveCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCertModal, setShowCertModal] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const resp = await fetch(`${API_URL}/progress?email=${user?.email}`);
        if (resp.ok) {
          const data = await resp.json();
          const completedTasks = data.progress || [];
          const allTasks = data.tasks || [];
          const completedCount = completedTasks.length;
          
          if (allTasks.length > 0) {
            const k8sCourse = {
              id: 'kubernetes',
              name: 'Kubernetes Mastery',
              completed: completedCount,
              total: allTasks.length,
              status: 'Active'
            };
            setActiveCourses([k8sCourse]);
            
            setStats({
              coursesStarted: 1,
              labsCompleted: completedCount
            });
          }
        }
      } catch (err) {
        console.error("Failed to load progress data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);



  return (
    <div className="profile-page" style={{ background: 'var(--bg-color)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Optimized Persistent Navigation Header */}
      <nav style={{ padding: '0.8rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 17, 23, 0.9)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)' }}>
        
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={onBack}>
              <img src={LOGO_URL} style={{ height: '32px' }} alt="CNU" />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontWeight: 950, fontSize: '1.2rem', letterSpacing: '-1px' }}>Cloud Native</span>
                <span style={{ color: ACCENT_COLOR, fontSize: '0.8rem', fontWeight: 900, letterSpacing: '2px' }}>UNIVERSITY</span>
              </div>
           </div>
        </div>

        {/* Center: Main App Links */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
           <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>
              <Layout size={18} /> Library
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
              <BookOpen size={18} color={ACCENT_COLOR} /> My Learning
           </div>
        </div>
        
        {/* Right: User Actions */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
           <div onClick={onLogout} style={{ color: 'var(--danger)', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', padding: '0.5rem', textTransform: 'uppercase' }}>Sign Out</div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        
        {/* Profile Identity Card */}
        <div className="glass-panel" style={{ padding: '3.5rem', display: 'flex', alignItems: 'center', gap: '3rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'relative' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '40px', background: 'var(--bg-color)', border: `2px solid ${ACCENT_COLOR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${ACCENT_COLOR}33`, overflow: 'hidden' }}>
                 {user?.profile_picture ? (
                   <img src={user.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <User size={64} color={ACCENT_COLOR} />
                 )}
              </div>
           </div>

           <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 950, margin: 0, letterSpacing: '-2px' }}>
                {user?.name}<br/><span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0px' }}>{user?.headline || 'Aspiring Cloud Native Engineer'}</span>
              </h1>

           </div>

           <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Membership Status</div>
              <div style={{ background: 'rgba(46, 160, 67, 0.1)', color: 'var(--success)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 900, display: 'inline-block', border: '1px solid var(--success)' }}>
                 CERTIFIED LEARNER
              </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
           <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(88, 166, 255, 0.1)', padding: '1rem', borderRadius: '20px' }}><Award size={32} color={ACCENT_COLOR} /></div>
              <div>
                 <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Courses</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.coursesStarted}</div>
              </div>
           </div>
           <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(46, 160, 67, 0.1)', padding: '1rem', borderRadius: '20px' }}><CheckCircle size={32} color="var(--success)" /></div>
              <div>
                 <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Labs Done</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.labsCompleted}</div>
              </div>
           </div>
           <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255, 171, 0, 0.1)', padding: '1rem', borderRadius: '20px' }}><Trophy size={32} color={GOLD_COLOR} /></div>
              <div>
                 <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Certificates</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.labsCompleted >= 20 ? 1 : 0}</div>
              </div>
           </div>
        </div>

        {/* Dynamic Certification Section */}
        <div style={{ marginBottom: '4rem' }}>
           <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Award size={24} color={GOLD_COLOR} /> Certificaciones de Carrera
           </h2>

           {stats.labsCompleted >= 20 ? (
             <div className="glass-panel" style={{ padding: '3rem', borderLeft: `8px solid ${GOLD_COLOR}`, background: `linear-gradient(90deg, ${GOLD_COLOR}11, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>Certified Kubernetes Master</h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Finalizado con éxito en Cloud Native University (Nivel Profesional).</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setShowCertModal('k8s')} className="btn btn-primary" style={{ padding: '1rem 2rem', background: GOLD_COLOR, border: 'none' }}>
                    <Shield size={18} /> Ver Certificado
                  </button>
                  
                </div>
             </div>
           ) : (
             <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                <Trophy size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
                <h3>Tu certificación está en progreso</h3>
                <p style={{ color: 'var(--text-muted)' }}>Completa los 20 laboratorios de Kubernetes para desbloquear tu certificado oficial.</p>
                <div style={{ maxWidth: '400px', margin: '2rem auto 0', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.labsCompleted / 20) * 100}%`, height: '100%', background: GOLD_COLOR }}></div>
                </div>
                <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: GOLD_COLOR, fontWeight: 800 }}>{stats.labsCompleted} / 20 Labs Listos</div>
             </div>
           )}
        </div>

      </div>

      {/* Certification Modal (Simulated) */}
      {showCertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(20px)' }}>
          <div className="certificate-layout" style={{ width: '100%', maxWidth: '900px', background: '#fff', color: '#000', padding: '4rem', position: 'relative', border: `20px solid ${GOLD_COLOR}`, boxShadow: '0 40px 100px rgba(0,0,0,1)' }}>
             <button onClick={() => setShowCertModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}>Cerrar ✕</button>
             
             <div style={{ textAlign: 'center' }}>
                <img src={LOGO_URL} style={{ height: '60px', filter: 'invert(1)', marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-2px' }}>CERTIFICADO</h1>
                <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>DE FINALIZACIÓN PROFESIONAL</p>
                
                <p style={{ fontSize: '1.4rem' }}>Se otorga por la presente a:</p>
                <div style={{ fontSize: '3rem', fontWeight: 900, margin: '1rem 0', color: ACCENT_COLOR, textDecoration: 'underline' }}>{user?.name}</div>
                
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '2rem auto', lineHeight: 1.6 }}>
                  Por haber superado satisfactoriamente los 20 laboratorios prácticos intensivos de <strong>Kubernetes Mastery Level</strong>, demostrando dominio en orquestación, redes y seguridad nativa cloud.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '4rem' }}>
                   <div style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #000', width: '200px', paddingBottom: '1rem', fontWeight: 900 }}>Cloud Native University</div>
                      <p style={{ fontSize: '0.8rem', color: '#888' }}>CENTRO ACADÉMICO OFICIAL</p>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #000', width: '200px', paddingBottom: '1rem', fontWeight: 900 }}>CERT-ID: CNU-{user?.email.split('@')[0].toUpperCase()}</div>
                      <p style={{ fontSize: '0.8rem', color: '#888' }}>REGISTRO DE BLOCKCHAIN</p>
                   </div>
                </div>
             </div>


          </div>
        </div>
      )}

      <style>{`
        .glass-panel:hover { border-color: ${ACCENT_COLOR}; transform: translateY(-4px); transition: 0.3s; }
        .btn-primary { background: ${ACCENT_COLOR}; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; alignItems: center; gap: 0.5rem; }
      `}</style>
    </div>
  );
}
