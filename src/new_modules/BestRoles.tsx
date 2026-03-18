import React from 'react';
import { AnalysisResult } from '../shared/types';
import { Briefcase, ChevronRight, TrendingUp, Target, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_ROLES } from '../shared/mockData';

export default function BestRoles({ result }: { result: AnalysisResult | null }) {
  if (!result) {
    return (
      <div className="glass-panel" style={{ padding: 40, textAlign: 'center', marginTop: 40 }}>
        <Briefcase size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
        <h2 style={{ margin: 0, color: '#F8FAFC' }}>Profile Required</h2>
        <p style={{ color: '#94A3B8', marginTop: 10 }}>
          Run your CV through the <strong>CV Skill Radar</strong> to unlock role recommendations.
        </p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    if (category === 'Immediate Match') return '#10B981';
    if (category === 'Stretch Role') return '#F59E0B';
    if (category === 'Higher Salary Potential') return '#6366F1';
    return '#94A3B8';
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'Immediate Match') return <Target size={14} />;
    if (category === 'Stretch Role') return <TrendingUp size={14} />;
    if (category === 'Higher Salary Potential') return <DollarSign size={14} />;
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Briefcase size={28} color="#6366F1" />
        Best Roles for Me
      </h1>
      <p style={{ color: '#94A3B8', marginBottom: 30 }}>
        Top roles based on your experience and our proprietary scoring model.
      </p>

      <div style={{ display: 'grid', gap: 20 }}>
        {MOCK_ROLES.sort((a, b) => b.matchScore - a.matchScore).map((role, idx) => {
          const catColor = getCategoryColor(role.category);
          return (
            <div key={idx} className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, color: '#F8FAFC', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
                    {role.title}
                    <span style={{ 
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', 
                      borderRadius: 999, backgroundColor: `${catColor}20`, color: catColor 
                    }}>
                      {getCategoryIcon(role.category)} {role.category}
                    </span>
                  </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: role.matchScore > 80 ? '#10B981' : '#FCD34D' }}>
                    {role.matchScore}%
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Match Score</div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: '#E2E8F0', display: 'block', marginBottom: 4 }}>Why it fits:</strong>
                <span style={{ color: '#94A3B8', lineHeight: 1.5 }}>{role.whyFits}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 1fr', gap: 20, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                <div>
                  <strong style={{ color: '#E2E8F0', display: 'block', marginBottom: 8, fontSize: 13, textTransform: 'uppercase' }}>Missing Skills to Bridge</strong>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {role.missingSkills.map((skill, i) => (
                      <span key={i} style={{ fontSize: 13, padding: '4px 10px', background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <strong style={{ color: '#E2E8F0', display: 'block', marginBottom: 4, fontSize: 13, textTransform: 'uppercase' }}>Salary Potential</strong>
                   <span style={{ color: '#10B981', fontWeight: 600 }}>{role.salaryPotential}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  );
}
