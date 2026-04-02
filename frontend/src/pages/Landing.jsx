import React, { useState, useMemo } from 'react';
import { ArrowRight, Lock, ShieldCheck, Search, LogOut, User, Zap, ChevronRight, Layers, LayoutGrid, Terminal } from 'lucide-react';

const ACCENT_COLOR = '#58a6ff';
const LOGO_URL = 'https://cloudnative.university/img/logo-w2x.png';

const ALL_PROJECTS = {
  fundamentals: [
    { id: 'docker', name: 'Docker', cat: 'Containers', logo: 'docker', active: true },
    { id: 'compose', name: 'Docker Compose', cat: 'Orchestration', logo: 'docker', active: true },
    { id: 'docker-sandbox', name: 'Docker Sandbox', cat: 'Security', logo: 'docker', active: true },
    { id: 'docker-models', name: 'Docker Models', cat: 'MLOps', logo: 'docker', active: true },
    { id: 'docker-mcp', name: 'Docker MCP', cat: 'AI Agents', logo: 'docker', active: true },
    { id: 'podman', name: 'Podman', cat: 'Containers', logo: 'https://logo.svgcdn.com/devicon/podman-original.svg', active: false },
    { id: 'golang', name: 'Go', cat: 'Programming', logo: 'https://go.dev/blog/go-brand/Go-Logo/Go-Logo_Blue.png', active: false },
    { id: 'python', name: 'Python', cat: 'Programming', logo: 'https://www.python.org/static/community_logos/python-logo-master-v3-TM.png', active: false },
    { id: 'linux', name: 'Linux', cat: 'Operating System', logo: 'https://www.linux.org/images/logo.png', active: false },
  ],
  graduated: [
    { id: 'kubernetes', name: 'Kubernetes', cat: 'Orchestration', logo: 'kubernetes', active: true },
    { id: 'prometheus', name: 'Prometheus', cat: 'Observability', logo: 'prometheus', active: false },
    { id: 'argo', name: 'Argo', cat: 'CI/CD', logo: 'argo', active: false },
    { id: 'envoy', name: 'Envoy', cat: 'Service Proxy', logo: 'envoy', active: false },
    { id: 'helm', name: 'Helm', cat: 'App Definition', logo: 'helm', active: false },
    { id: 'containerd', name: 'containerd', cat: 'Runtime', logo: 'containerd', active: false },
    { id: 'istio', name: 'Istio', cat: 'Service Mesh', logo: 'istio', active: false },
    { id: 'coredns', name: 'CoreDNS', cat: 'Service Discovery', logo: 'coredns', active: false },
    { id: 'etcd', name: 'etcd', cat: 'Storage', logo: 'etcd', active: false },
    { id: 'fluentd', name: 'Fluentd', cat: 'Logging', logo: 'fluentd', active: false },
    { id: 'harbor', name: 'Harbor', cat: 'Registry', logo: 'harbor', active: false },
    { id: 'cilium', name: 'Cilium', cat: 'Networking', logo: 'cilium', active: false },
    { id: 'rook', name: 'Rook', cat: 'Storage', logo: 'rook', active: false },
    { id: 'vitess', name: 'Vitess', cat: 'Database', logo: 'vitess', active: false },
    { id: 'jaeger', name: 'Jaeger', cat: 'Tracing', logo: 'jaeger', active: false },
    { id: 'linkerd', name: 'Linkerd', cat: 'Service Mesh', logo: 'linkerd', active: false },
    { id: 'opa', name: 'OPA', cat: 'Policy', logo: 'open_policy_agent', active: false },
    { id: 'spiffe', name: 'SPIFFE', cat: 'Identity', logo: 'spiffe', active: false },
    { id: 'spire', name: 'SPIRE', cat: 'Identity', logo: 'spire', active: false },
    { id: 'tikv', name: 'TiKV', cat: 'Database', logo: 'tikv', active: false },
    { id: 'cloudevents', name: 'CloudEvents', cat: 'Serverless', logo: 'cloudevents', active: false },
    { id: 'flux', name: 'Flux', cat: 'CD', logo: 'flux', active: false },
    { id: 'openshift', name: 'OpenShift', cat: 'Platform', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/OpenShift-LogoType.svg', active: false },
    { id: 'docker-models', name: 'Docker Models', cat: 'AI/ML', logo: 'docker', active: false },
    { id: 'docker-ia', name: 'Docker AI', cat: 'AI/ML', logo: 'docker', active: false },
  ],
  incubating: [
    { id: 'ctf_k8s_breakout', name: 'Cloud Native CTF', cat: 'Security & Hacking', logo: 'https://www.kali.org/images/kali-logo.svg', active: true },
    { id: 'artifact-hub', name: 'Artifact Hub', cat: 'Hub', logo: 'artifact_hub', active: false },

    { id: 'backstage', name: 'Backstage', cat: 'Dev Portal', logo: 'backstage', active: false },
    { id: 'buildpacks', name: 'Buildpacks', cat: 'Tooling', logo: 'buildpacks', active: false },
    { id: 'cert-manager', name: 'Cert Manager', cat: 'Security', logo: 'cert_manager', active: false },
    { id: 'chaos-mesh', name: 'Chaos Mesh', cat: 'Chaos Eng', logo: 'chaos_mesh', active: false },
    { id: 'cloud-custodian', name: 'Cloud Custodian', cat: 'Governance', logo: 'cloud_custodian', active: false },
    { id: 'cni', name: 'CNI', cat: 'Networking', logo: 'container_network_interface', active: false },
    { id: 'contour', name: 'Contour', cat: 'Ingress', logo: 'contour', active: false },
    { id: 'cortex', name: 'Cortex', cat: 'Observability', logo: 'cortex', active: false },
    { id: 'cri-o', name: 'CRI-O', cat: 'Runtime', logo: 'cri_o', active: false },
    { id: 'crossplane', name: 'Crossplane', cat: 'Control Plane', logo: 'crossplane', active: false },
    { id: 'cubefs', name: 'CubeFS', cat: 'Storage', logo: 'cubefs', active: false },
    { id: 'dapr', name: 'Dapr', cat: 'Runtime', logo: 'dapr', active: false },
    { id: 'dragonfly', name: 'Dragonfly', cat: 'Distribution', logo: 'dragonfly', active: false },
    { id: 'emissary', name: 'Emissary Ingress', cat: 'Ingress', logo: 'emissary_ingress', active: false },
    { id: 'falco', name: 'Falco', cat: 'Security', logo: 'falco', active: false },
    { id: 'flatcar', name: 'Flatcar', cat: 'OS', logo: 'flatcar_container_linux', active: false },
    { id: 'grpc', name: 'gRPC', cat: 'RPC', logo: 'grpc', active: false },
    { id: 'in-toto', name: 'in-toto', cat: 'Supply Chain', logo: 'in_toto', active: false },
    { id: 'karmada', name: 'Karmada', cat: 'Multi-cluster', logo: 'karmada', active: false },
    { id: 'keda', name: 'KEDA', cat: 'Autoscaling', logo: 'keda', active: false },
    { id: 'keptn', name: 'Keptn', cat: 'Delivery', logo: 'keptn', active: false },
    { id: 'keycloak', name: 'Keycloak', cat: 'Auth', logo: 'keycloak', active: false },
    { id: 'knative', name: 'Knative', cat: 'Serverless', logo: 'knative', active: false },
    { id: 'kubeedge', name: 'KubeEdge', cat: 'Edge', logo: 'kubeedge', active: false },
    { id: 'kubeflow', name: 'Kubeflow', cat: 'Machine Learning', logo: 'kubeflow', active: false },
    { id: 'kubescape', name: 'Kubescape', cat: 'Security', logo: 'kubescape', active: false },
    { id: 'kubevela', name: 'KubeVela', cat: 'App Delivery', logo: 'kubevela', active: false },
    { id: 'kubevirt', name: 'KubeVirt', cat: 'Virtualization', logo: 'kubevirt', active: false },
    { id: 'kyverno', name: 'Kyverno', cat: 'Policy', logo: 'kyverno', active: false },
    { id: 'litmus', name: 'Litmus', cat: 'Chaos Eng', logo: 'litmus', active: false },
    { id: 'longhorn', name: 'Longhorn', cat: 'Storage', logo: 'longhorn', active: false },
    { id: 'nats', name: 'NATS', cat: 'Messaging', logo: 'nats', active: false },
    { id: 'notary', name: 'Notary', cat: 'Security', logo: 'notary_project', active: false },
    { id: 'openfeature', name: 'OpenFeature', cat: 'Flags', logo: 'openfeature', active: false },
    { id: 'opencost', name: 'OpenCost', cat: 'FinOps', logo: 'opencost', active: false },
    { id: 'openkruise', name: 'OpenKruise', cat: 'App Mgmt', logo: 'openkruise', active: false },
    { id: 'opentelemetry', name: 'OpenTelemetry', cat: 'Observability', logo: 'opentelemetry', active: false },
    { id: 'openyurt', name: 'OpenYurt', cat: 'Edge', logo: 'openyurt', active: false },
    { id: 'operator-framework', name: 'Operator Framework', cat: 'Automation', logo: 'operator_framework', active: false },
    { id: 'strimzi', name: 'Strimzi', cat: 'Messaging', logo: 'strimzi', active: false },
    { id: 'thanos', name: 'Thanos', cat: 'Observability', logo: 'thanos', active: false },
    { id: 'tuf', name: 'TUF', cat: 'Security', logo: 'the_update_framework', active: false },
    { id: 'volcano', name: 'Volcano', cat: 'Scheduling', logo: 'volcano', active: false },
    { id: 'wasmcloud', name: 'wasmCloud', cat: 'WebAssembly', logo: 'wasmcloud', active: false },
  ]
};





const getLogoUrl = (logo) => {
  if (logo.startsWith('http')) return logo;
  if (logo === 'docker') return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg';
  return `/img/cncf_logos/${logo}.svg`;
};

function ProjectCard({ p, onClick }) {
  return (
    <div 
      onClick={() => onClick(p)}
      style={{
          height: '280px', background: 'rgba(25, 30, 35, 0.4)', border: '1px solid var(--border-color)',
          borderRadius: '32px', padding: '2rem', cursor: p.active ? 'pointer' : 'not-allowed',
          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '1.5rem', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden', backdropFilter: 'blur(10px)'
      }}
      className={`project-box ${p.active ? 'active' : 'locked'}`}
    >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px' }}>
          <img 
            src={getLogoUrl(p.logo)} 
            alt={p.name}
            style={{ 
              height: '110px', maxWidth: '85%', objectFit: 'contain',
              filter: p.active ? 'none' : 'grayscale(1) opacity(0.25)',
              transition: '0.5s'
            }}
          />
        </div>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: p.active ? 'var(--text-main)' : '#333' }}>{p.name}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: p.active ? ACCENT_COLOR : '#222', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>{p.cat}</div>
        </div>
        {p.active && (
          <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: ACCENT_COLOR, boxShadow: `0 0 15px ${ACCENT_COLOR}` }}></div>
          </div>
        )}
        {p.active && <div className="active-overlay" style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 0%, ${ACCENT_COLOR}11 100%)`, opacity: 0, transition: '0.3s' }}></div>}
    </div>
  );
}

export default function Landing({ onSelectCourse, onLogout, onViewProfile, user, systemMode }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activationCode, setActivationCode] = useState('');
  const [category, setCategory] = useState('all');

  const handleCourseClick = (course) => {
    if (!course.active) return;
    if (systemMode === 'community') {
      onSelectCourse(course.id, 'Community Edition');
    } else {
      setSelectedCourse(course);
    }
  };

  const CATEGORIES = [
    { id: 'all', label: 'Todos los Proyectos', icon: <LayoutGrid size={18} /> },
    { id: 'fundamentals', label: 'Fundamentos', icon: <Terminal size={18} /> },
    { id: 'graduated', label: 'Orquestación y Core', icon: <Zap size={18} /> },
    { id: 'incubating', label: 'Observabilidad y Más', icon: <Layers size={18} /> }
  ];

  const filteredCollection = useMemo(() => {
    let base = [];
    if (category === 'all') {
      base = [...ALL_PROJECTS.fundamentals, ...ALL_PROJECTS.graduated, ...ALL_PROJECTS.incubating];
    } else {
      base = ALL_PROJECTS[category] || [];
    }
    return base;
  }, [category]);



  const handleActivate = (e) => {
    e.preventDefault();
    if (activationCode.toUpperCase() === 'NX2301') {
      onSelectCourse(selectedCourse.id, activationCode.toUpperCase());
    }
  };

  return (
    <div className="landing-layout" style={{ background: 'var(--bg-color)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Navbar Section */}
      <nav style={{ padding: '0.8rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 17, 23, 0.8)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
           <img src={LOGO_URL} style={{ height: '32px' }} alt="CNU" />
           <span style={{ fontWeight: 950, fontSize: '1.4rem', letterSpacing: '-1.5px', lineHeight: 1 }}>Cloud Native<br/><span style={{ color: ACCENT_COLOR, fontSize: '1.1rem', letterSpacing: '0px' }}>UNIVERSITY</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
           <div 
            onClick={onViewProfile}
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '12px', transition: '0.2s', border: '1px solid var(--border-color)' }}
            className="navbar-user"
          >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>{user?.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>MEMBER ACCESS</div>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color={ACCENT_COLOR} />
              </div>
           </div>
           <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>SIGN OUT</button>
        </div>
      </nav>

      {/* Hero Header */}
      <header style={{ textAlign: 'center', padding: '6rem 1rem 2rem' }}>
         <h1 style={{ fontSize: '4.5rem', fontWeight: 950, margin: 0, letterSpacing: '-2.5px', lineHeight: 1 }}>
            Domina el Mundo de los<br/><span style={{ color: ACCENT_COLOR }}>Contenedores & Cloud Native.</span>
         </h1>
         <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '1.5rem', maxWidth: '700px', margin: '1.5rem auto', fontWeight: 500, lineHeight: 1.6 }}>
            Acceso ilimitado a laboratorios certificados del ecosistema oficial de Contenedores y Kubernetes en español. Cero excusas.
         </p>

         <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setCategory(cat.id)}
                style={{ 
                  background: category === cat.id ? ACCENT_COLOR : 'transparent',
                  border: '1px solid',
                  borderColor: category === cat.id ? ACCENT_COLOR : 'var(--border-color)',
                  padding: '0.8rem 2rem',
                  color: category === cat.id ? '#fff' : 'var(--text-muted)',
                  borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: '0.3s',
                  display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem'
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
         </div>
      </header>

      {/* Grid Content */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '4rem 2rem 10rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }}>
              {filteredCollection.map(p => <ProjectCard key={p.id} p={p} onClick={handleCourseClick} />)}
          </div>
      </div>

      {/* Activation Modal */}
      {selectedCourse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '100%', maxWidth: '440px', padding: '2rem', textAlign: 'center' }}>
             <img src={getLogoUrl(selectedCourse.logo)} style={{ height: '120px', marginBottom: '2rem' }} />
             <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>{selectedCourse.name}</h2>
             <p style={{ color: 'var(--text-muted)', margin: '1rem 0 3rem' }}>Enter academic access code to unlock path.</p>
             <form onSubmit={handleActivate}>
                <input 
                  type="text" 
                  placeholder="NX2301"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '1rem', borderRadius: '12px', color: '#fff', fontSize: '1.2rem', textAlign: 'center', marginBottom: '1.5rem' }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setSelectedCourse(null)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#222', border: '1px solid #333', color: '#fff', fontWeight: 800 }}>CANCEL</button>
                  <button type="submit" style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: ACCENT_COLOR, border: 'none', color: '#fff', fontWeight: 800 }}>ACTIVATE</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
