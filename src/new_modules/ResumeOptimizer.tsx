import React, { useState } from 'react';
import { AnalysisResult } from '../shared/types';
import { FileEdit, Wand2, Lightbulb, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResumeOptimizer({ result }: { result: AnalysisResult | null }) {
  const [selectedRole, setSelectedRole] = useState('Data Analyst');

  if (!result) {
    return (
      <div className="glass-panel" style={{ padding: 40, textAlign: 'center', marginTop: 40 }}>
        <FileEdit size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
        <h2 style={{ margin: 0, color: '#F8FAFC' }}>Profile Required</h2>
        <p style={{ color: '#94A3B8', marginTop: 10 }}>
          Run your CV through the <strong>CV Skill Radar</strong> to enable optimization suggestions.
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <FileEdit size={28} color="#6366F1" />
        Resume Optimizer
      </h1>
      <p style={{ color: '#94A3B8', marginBottom: 30 }}>Actionable suggestions to tailor your CV based on your target role.</p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Optimizing For</label>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15 }}
          >
            <option>Data Analyst</option>
            <option>Business Analyst</option>
            <option>Product Owner</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button style={{ height: 45, display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', borderRadius: 8, background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            <Wand2 size={16} /> Re-Optimize
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0, color: '#F8FAFC', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 20 }}>
          <Lightbulb size={20} color="#FCD34D" /> Professional Summary
        </h3>
        
        <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#FCA5A5', textTransform: 'uppercase', marginBottom: 8 }}>Current Issue</div>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: 14 }}>Your summary is too generic and lacks emphasis on your commercial impact and stakeholder management skills.</p>
        </div>

        <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#34D399', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={14} /> Suggested Improvement
          </div>
          <p style={{ margin: 0, color: '#E2E8F0', fontStyle: 'italic', fontSize: 14 }}>
            "Data-driven {selectedRole} with 3+ years driving cross-functional initiatives. Proven track record of translating complex datasets into actionable business strategies that increased revenue by 15% using SQL and Python."
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0, color: '#F8FAFC', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 20 }}>
          <Lightbulb size={20} color="#FCD34D" /> Bullet Points & ATS
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <strong style={{ color: '#E2E8F0', display: 'block', marginBottom: 12 }}>Missing ATS Keywords</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {result.top_5_next_skills.map((s, i) => (
                <span key={i} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 13, color: '#94A3B8' }}>{s}</span>
              ))}
            </div>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 12 }}>Ensure these keywords appear naturally in your latest role descriptions if you have exposure to them.</p>
          </div>
          
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 20 }}>
            <strong style={{ color: '#E2E8F0', display: 'block', marginBottom: 12 }}>High-Impact Action Verbs to Use</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Spearheaded', 'Orchestrated', 'Optimized', 'Synthesized', 'Engineered'].map((s, i) => (
                <span key={i} style={{ padding: '4px 10px', color: '#6366F1', fontWeight: 600, fontSize: 13 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
