import React, { useState, useEffect } from 'react';
import { List, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Application {
  id: string;
  company: string;
  role: string;
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Rejected' | 'Offered';
  dateApplied: string;
}

export default function AppTracker() {
  const [apps, setApps] = useState<Application[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');

  // Load from locale storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('career_os_apps');
    if (saved) {
      try {
        setApps(JSON.parse(saved));
      } catch (e) { }
    } else {
      // Mock initial data
      setApps([
        { id: '1', company: 'Google', role: 'Data Analyst', status: 'Interviewing', dateApplied: '2025-05-10' },
        { id: '2', company: 'Stripe', role: 'Business Analyst', status: 'Applied', dateApplied: '2025-05-15' },
      ]);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('career_os_apps', JSON.stringify(apps));
  }, [apps]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;
    const newApp: Application = {
      id: Date.now().toString(),
      company: newCompany,
      role: newRole,
      status: 'Saved',
      dateApplied: new Date().toISOString().split('T')[0]
    };
    setApps([...apps, newApp]);
    setNewCompany('');
    setNewRole('');
    setShowAdd(false);
  };

  const updateStatus = (id: string, status: Application['status']) => {
    setApps(apps.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteApp = (id: string) => {
    setApps(apps.filter(a => a.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Saved': return '#64748B';
      case 'Applied': return '#3B82F6';
      case 'Interviewing': return '#F59E0B';
      case 'Offered': return '#10B981';
      case 'Rejected': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <List size={28} color="#6366F1" />
            Applications Tracker
          </h1>
          <p style={{ color: '#94A3B8', margin: 0 }}>Manage your pipeline. Data is saved locally in your browser.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: '#6366F1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} /> Add Application
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-panel" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Company Name</label>
            <input type="text" value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="e.g. Netflix" required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Role Title</label>
            <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="e.g. Data Scientist" required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
          </div>
          <button type="submit" style={{ padding: '10px 24px', borderRadius: 6, background: '#10B981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, height: 40 }}>
            Save
          </button>
        </form>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Company</th>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No applications tracked yet.</td></tr>
            ) : apps.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px 20px', color: '#F8FAFC', fontWeight: 600 }}>{app.company}</td>
                <td style={{ padding: '16px 20px', color: '#E2E8F0' }}>{app.role}</td>
                <td style={{ padding: '16px 20px', color: '#94A3B8', fontSize: 14 }}>{app.dateApplied}</td>
                <td style={{ padding: '16px 20px' }}>
                  <select 
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as Application['status'])}
                    style={{ 
                      padding: '4px 12px', 
                      borderRadius: 999, 
                      border: `1px solid ${getStatusColor(app.status)}40`, 
                      background: `${getStatusColor(app.status)}15`, 
                      color: getStatusColor(app.status), 
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      outline: 'none',
                      appearance: 'none'
                    }}
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offered">Offered</option>
                  </select>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button onClick={() => deleteApp(app.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 8, opacity: 0.7 }} onMouseOver={e => e.currentTarget.style.opacity='1'} onMouseOut={e => e.currentTarget.style.opacity='0.7'} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
