import React from 'react';
import { AnalysisResult } from '../shared/types';
import { LayoutDashboard, Target, Briefcase, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ result }: { result: AnalysisResult | null }) {
  if (!result) {
    return (
      <div className="glass-panel" style={{ padding: 40, textAlign: 'center', marginTop: 40 }}>
        <Target size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
        <h2 style={{ margin: 0, color: '#F8FAFC' }}>No Profile Data Yet</h2>
        <p style={{ color: '#94A3B8', marginTop: 10 }}>
          Go to the <strong>CV Skill Radar</strong> tab to scan your profile first. The Dashboard will auto-populate using your results.
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <LayoutDashboard size={28} color="#6366F1" />
        Career Execution Dashboard
      </h1>
      <p style={{ color: '#94A3B8', marginBottom: 30 }}>Overview of your profile strength and immediate next steps.</p>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Top Recommended Skills</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>{result.top_5_next_skills.length}</div>
          <div style={{ color: '#10B981', fontSize: 13, marginTop: 4 }}>High Priority for Growth</div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Profile Insight</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Analyzed</div>
          <div style={{ color: '#6366F1', fontSize: 13, marginTop: 4 }}>{new Date(result.run_date).toLocaleDateString()}</div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Target Role Match</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>In Progress</div>
          <div style={{ color: '#FCD34D', fontSize: 13, marginTop: 4 }}>Action Items Pending</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0, color: '#E2E8F0' }}>
            <Activity size={18} color="#6366F1" /> Priority Skills to Learn
          </h3>
          <ul style={{ paddingLeft: 20, color: '#94A3B8', lineHeight: 1.8 }}>
            {result.top_5_next_skills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0, color: '#E2E8F0' }}>
            <Briefcase size={18} color="#10B981" /> Top Suggested Roles
          </h3>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>
            Based on your profile, consider exploring these roles (check the <strong>Best Roles</strong> tab for deep analysis):
          </p>
          <ul style={{ paddingLeft: 20, color: '#94A3B8', lineHeight: 1.8 }}>
            <li>Senior Business Analyst</li>
            <li>Product Analytics Lead</li>
            <li>Data Product Manager</li>
          </ul>
        </div>
      </div>

    </motion.div>
  );
}
