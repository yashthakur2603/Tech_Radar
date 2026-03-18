import React, { useState } from 'react';
import { Search, Filter, Bookmark, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_JOBS } from '../shared/mockData';

export default function JobFinder() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = MOCK_JOBS.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Search size={28} color="#6366F1" />
        Job Finder
      </h1>
      <p style={{ color: '#94A3B8', marginBottom: 30 }}>Live opportunities scored against your CV profile (Mock Data).</p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
          <input 
            type="text" 
            placeholder="Search roles or companies..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15 }}
          />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Company & Location</th>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Match</th>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Salary / Date</th>
              <th style={{ padding: '16px 20px', color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No jobs found matching "{searchTerm}"</td></tr>
            ) : filteredJobs.map(job => (
              <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '20px', color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>{job.title}</td>
                <td style={{ padding: '20px' }}>
                  <div style={{ color: '#E2E8F0', fontWeight: 500 }}>{job.company}</div>
                  <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{job.location}</div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: job.matchScore >= 85 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: job.matchScore >= 85 ? '#10B981' : '#F59E0B', fontWeight: 700, fontSize: 13 }}>
                    {job.matchScore}% Match
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ color: '#E2E8F0', fontWeight: 500 }}>{job.salary}</div>
                  <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{job.datePosted} • {job.source}</div>
                </td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 8, marginRight: 8 }} title="Save Job">
                    <Bookmark size={18} />
                  </button>
                  <button style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818CF8', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Apply <ExternalLink size={14} />
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
