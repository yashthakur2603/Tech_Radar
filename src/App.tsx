import React, { useRef, useState, useEffect } from 'react';
import { Bell, UploadCloud, Target, Sparkles, CheckCircle2, AlertCircle, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { div } from 'framer-motion/client';

interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: string | null;
  error: string | null;
}

interface Notification {
  id: string;
  jobId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Technology {
  technology_name: string;
  category: string;
  short_description: string;
  why_relevant_for_me: string;
  priority: 'High' | 'Medium' | 'Low';
  learning_difficulty: 'Easy' | 'Medium' | 'Hard';
  market_signal: 'High' | 'Medium' | 'Low';
  project_idea: string;
  sources: string[];
}

interface AnalysisResult {
  run_date: string;
  current_profile_summary: string;
  recommended_technologies: Technology[];
  top_5_next_skills: string[];
}

export default function App() {
  const [cvText, setCvText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobStatus, setActiveJobStatus] = useState<'idle' | 'queued' | 'completed' | 'failed'>('idle');
  const [readyResult, setReadyResult] = useState<AnalysisResult | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Initial load and Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Polling logic
  useEffect(() => {
    const fetchNotificationsAndJobs = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }

      if (activeJobId) {
        try {
          const res = await fetch(`/api/result/${activeJobId}`);
          if (res.ok) {
            const job: Job = await res.json();
            if (job.status === 'completed' && job.result) {
              setReadyResult(typeof job.result === 'string' ? JSON.parse(job.result) : job.result);
              setActiveJobStatus('completed');
            } else if (job.status === 'failed') {
              setError(job.error || 'Job failed');
              setActiveJobStatus('failed');
            }
          }
        } catch (err) {
          console.error('Failed to poll active job:', err);
        }
      }
    };

    fetchNotificationsAndJobs();
    const interval = setInterval(fetchNotificationsAndJobs, 5000);
    return () => clearInterval(interval);
  }, [activeJobId]);

  const handleNotificationClick = async (jobId: string) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setActiveJobStatus('idle');
      setReadyResult(null);
      setShowNotifications(false);

      const res = await fetch(`/api/result/${jobId}`);
      if (!res.ok) throw new Error('Failed to load result');

      const job: Job = await res.json();

      if (job.status === 'completed' && job.result) {
        setResult(typeof job.result === 'string' ? JSON.parse(job.result) : job.result);
      } else if (job.status === 'failed') {
        setError(job.error || 'Job failed');
      }

      await fetch('/api/notifications/read', { method: 'POST' });
      setNotifications(prev => prev.filter(n => n.jobId !== jobId));
    } catch (err: any) {
      setError(err?.message || 'Failed to open notification');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setCvFile(null);
      setFileName('');
      return;
    }
    setCvFile(file);
    setFileName(file.name);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cvFile && !cvText.trim()) {
      setError('Please upload a CV PDF or paste CV text.');
      return;
    }
    if (!targetRole.trim()) {
      setError('Please enter a target role.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (cvFile) formData.append('cv', cvFile);
    formData.append('cvText', cvText);
    formData.append('targetRole', targetRole);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze CV');
      }

      setActiveJobStatus('queued');
      setActiveJobId(data.jobId);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = (val: string) => {
    if (val === 'High') return { bg: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', border: 'rgba(239, 68, 68, 0.2)' };
    if (val === 'Medium') return { bg: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', border: 'rgba(245, 158, 11, 0.2)' };
    return { bg: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7', border: 'rgba(16, 185, 129, 0.2)' };
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ marginBottom: 8, marginTop: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 8, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: 12 }}>
              <Activity size={24} color="#fff" />
            </div>
            Tech Radar <span style={{ color: '#6366F1' }}>Pro</span>
          </h1>
          <p style={{ color: '#94A3B8', marginTop: 0, marginBottom: 0, fontSize: 16 }}>
            Intelligent market analysis mapped to your unique profile.
          </p>
        </div>

        {/* NOTIFICATIONS */}
        <div style={{ position: 'relative', zIndex: 100 }}>
          <button
            ref={bellRef}
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <Bell size={22} color="#E2E8F0" strokeWidth={2} />
            {notifications.length > 0 && (
              <span className="pulse-dot" style={{
                position: 'absolute',
                top: 12,
                right: 14,
                borderRadius: '50%',
                width: 8,
                height: 8,
              }} />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                ref={notificationRef}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="glass-dropdown"
                style={{
                  position: 'absolute',
                  top: 64,
                  right: 0,
                  width: 340,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 600, color: '#F8FAFC', display: 'flex', justifyContent: 'space-between' }}>
                  Alerts
                  {notifications.length > 0 && (
                    <span style={{ fontSize: 12, background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', padding: '2px 8px', borderRadius: 999 }}>{notifications.length} Unread</span>
                  )}
                </div>
                <div className="custom-scrollbar" style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                      You're all caught up.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.jobId)}
                        style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          fontSize: 14,
                          color: '#E2E8F0',
                          display: 'flex',
                          gap: 12
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ marginTop: 2, color: '#10B981' }}><CheckCircle2 size={18} /></div>
                        <div>
                          <div style={{ lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr', gap: 30, alignItems: 'start' }}>

        {/* INPUT FORM */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#E2E8F0' }}>
                <UploadCloud size={18} color="#94A3B8" /> Upload CV (PDF)
              </label>
              <div
                style={{
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: 10,
                  padding: '24px 20px',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'border-color 0.2s, background 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)' }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.background = 'rgba(0,0,0,0.1)' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <FileText size={28} color={fileName ? '#6366F1' : '#64748B'} style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: 14, color: fileName ? '#E2E8F0' : '#94A3B8' }}>
                  {fileName ? fileName : 'Drag & drop or browse PDF'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 10, color: '#E2E8F0' }}>Or paste CV text</label>
              <textarea
                rows={6}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your raw experience here..."
                style={{ width: '100%', resize: 'vertical', padding: 14, fontSize: 14 }}
                className="custom-scrollbar"
              />
            </div>

            <div style={{ marginBottom: 30 }}>
              <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#E2E8F0' }}>
                <Target size={18} color="#94A3B8" /> Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Full Stack Engineer"
                style={{ width: '100%', padding: '14px 16px', fontSize: 14 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 10,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #6366F1, #4F46E5)',
                color: loading ? '#94A3B8' : '#fff',
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '0.01em',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.3)',
                transition: 'transform 0.1s, filter 0.2s',
              }}
              onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)' }}
              onMouseUp={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(1)' }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseOut={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1)' }}
            >
              {loading ? 'Submitting...' : 'Launch Internet Scan'}
            </button>
          </form>
        </div>

        {/* RESULTS / STATUS PANEL */}
        <div
          className={`glass-panel ${activeJobStatus === 'completed' ? 'flash-success' : ''}`}
          style={{ padding: 30, minHeight: 400, display: 'flex', flexDirection: 'column' }}
        >
          {/* Waiting State */}
          {!loading && !error && !result && activeJobStatus === 'idle' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748B' }}>
              <Target size={64} color="rgba(255,255,255,0.05)" style={{ marginBottom: 20 }} />
              <h3 style={{ margin: 0, color: '#94A3B8', fontSize: 20 }}>System Standby</h3>
              <p style={{ maxWidth: 280, marginTop: 10, lineHeight: 1.5 }}>
                Provide your profile details and target role to begin the intelligent analysis queue.
              </p>
            </div>
          )}

          {/* Queued State */}
          {activeJobStatus === 'queued' && !result && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366F1', marginBottom: 24 }}
              />
              <h3 style={{ margin: 0, color: '#E2E8F0', fontSize: 22 }}>Scanning the Internet</h3>
              <p style={{ color: '#94A3B8', marginTop: 10 }}>Job is queued. We are parsing market signals.</p>
            </div>
          )}

          {/* Completed State (Pulse View) */}
          {activeJobStatus === 'completed' && readyResult && !result && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: 90, height: 90, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)'
                }}
              >
                <CheckCircle2 size={40} color="#10B981" />
              </motion.div>
              <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: 26, fontWeight: 700 }}>Analysis Complete</h3>
              <p style={{ color: '#94A3B8', marginTop: 12, marginBottom: 30, fontSize: 16 }}>Your personalized tech radar is ready for review.</p>

              <button
                onClick={() => {
                  setResult(readyResult);
                  setActiveJobStatus('idle');
                  setReadyResult(null);
                  if (activeJobId) {
                    fetch('/api/notifications/read', { method: 'POST' });
                    setNotifications(prev => prev.filter(n => n.jobId !== activeJobId));
                  }
                }}
                style={{
                  padding: '14px 28px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  transition: 'transform 0.1s'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Reveal Insights
              </button>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              Processing Request...
            </div>
          )}

          {error && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#EF4444', textAlign: 'center' }}>
              <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.8 }} />
              <h3 style={{ margin: 0 }}>System Anomaly</h3>
              <p style={{ marginTop: 8 }}>{error}</p>
            </div>
          )}

          {/* Actual Results View */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>Strategic Insights</h2>
                <div style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} color="#6366F1" />
                  Generated {new Date(result.run_date).toLocaleDateString()}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 16, color: '#E2E8F0' }}>Profile Synergy</h3>
                <p style={{ margin: 0, color: '#94A3B8', lineHeight: 1.6, fontSize: 15 }}>{result.current_profile_summary}</p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 30 }}>
                {(result.top_5_next_skills || []).map((skill, idx) => (
                  <div key={idx} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#A5B4FC', padding: '6px 14px', borderRadius: 999, fontSize: 14, fontWeight: 500 }}>
                    {skill}
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: 20, fontSize: 18, color: '#F8FAFC' }}>Capitalize On</h3>
              <div style={{ display: 'grid', gap: 16 }}>
                {(result.recommended_technologies || []).map((tech, idx) => {
                  const pColor = priorityColor(tech.priority);
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 12,
                        padding: 20,
                        transition: 'background 0.2s, border-color 0.2s',
                        cursor: 'default'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#F8FAFC', marginBottom: 4 }}>{tech.technology_name}</div>
                          <div style={{ fontSize: 13, color: '#6366F1', fontWeight: 600 }}>{tech.category}</div>
                        </div>
                        <div style={{ background: pColor.bg, color: pColor.color, border: `1px solid ${pColor.border}`, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                          {tech.priority} Priority
                        </div>
                      </div>

                      <p style={{ color: '#E2E8F0', marginTop: 0, marginBottom: 16, fontSize: 15, lineHeight: 1.5 }}>{tech.short_description}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 }}>
                          <span style={{ display: 'block', fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Learning Curve</span>
                          <span style={{ color: '#E2E8F0', fontSize: 14 }}>{tech.learning_difficulty}</span>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 }}>
                          <span style={{ display: 'block', fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Market Signal</span>
                          <span style={{ color: '#E2E8F0', fontSize: 14 }}>{tech.market_signal}</span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid #10B981', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: '#10B981', fontWeight: 700, marginBottom: 4 }}>Why It Matters</div>
                        <div style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 1.5 }}>{tech.why_relevant_for_me}</div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 14, color: '#94A3B8' }}><strong style={{ color: '#CBD5E1' }}>Project Idea:</strong> {tech.project_idea}</div>
                        <div style={{ fontSize: 13 }}>
                          <strong style={{ color: '#64748B', marginRight: 8 }}>Sources:</strong>
                          {(tech.sources || []).map((src, i) => (
                            <a key={i} href={src} target="_blank" rel="noreferrer" style={{ color: '#6366F1', textDecoration: 'none', marginRight: 12, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#8B5CF6'} onMouseOut={(e) => e.currentTarget.style.color = '#6366F1'}>
                              Source {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div >
    </div >
  );
}