import React from 'react';
import { AnalysisResult } from '../shared/types';
import { Map as MapIcon, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningRoadmap({ result }: { result: AnalysisResult | null }) {
  if (!result) {
    return (
      <div className="glass-panel" style={{ padding: 40, textAlign: 'center', marginTop: 40 }}>
        <MapIcon size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
        <h2 style={{ margin: 0, color: '#F8FAFC' }}>Profile Required</h2>
        <p style={{ color: '#94A3B8', marginTop: 10 }}>
          Run your CV through the <strong>CV Skill Radar</strong> to generate a tailored 90-day learning roadmap.
        </p>
      </div>
    );
  }

  // Slice the technologies into 30, 60, 90 day buckets based on their priority and difficulty.
  // We'll just distribute them roughly for the MVP.
  const highPriority = result.recommended_technologies.filter(t => t.priority === 'High');
  const mediumPriority = result.recommended_technologies.filter(t => t.priority === 'Medium');
  const lowPriority = result.recommended_technologies.filter(t => t.priority === 'Low');

  // Simple distribution logic
  const day30 = [...highPriority.slice(0, 2)];
  const day60 = [...highPriority.slice(2), ...mediumPriority.slice(0, 2)];
  const day90 = [...mediumPriority.slice(2), ...lowPriority.slice(0, 2)];

  const renderBucket = (title: string, techs: any[], color: string) => (
    <div style={{ position: 'relative', paddingLeft: 40, marginBottom: 40 }}>
      <div style={{ position: 'absolute', left: 0, top: 4, bottom: -40, width: 2, background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', left: -7, top: 0, width: 16, height: 16, borderRadius: '50%', background: color, border: '4px solid #0F172A' }} />
      
      <h3 style={{ margin: '0 0 16px 0', fontSize: 20, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Calendar size={18} color={color} /> {title}
      </h3>
      
      {techs.length === 0 ? (
        <p style={{ color: '#64748B', fontStyle: 'italic' }}>No specific goals scheduled for this block. Review your Radar.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {techs.map((tech, i) => (
            <div key={i} className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#E2E8F0' }}>{tech.technology_name}</div>
                <div style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}>{tech.learning_difficulty}</div>
              </div>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
                {tech.short_description}
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle size={16} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Milestone Project</div>
                  <div style={{ color: '#E2E8F0', fontSize: 13 }}>{tech.project_idea}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <MapIcon size={28} color="#6366F1" />
        90-Day Learning Roadmap
      </h1>
      <p style={{ color: '#94A3B8', marginBottom: 40 }}>A structured execution plan derived from your personalized skill radar.</p>

      <div style={{ marginLeft: 10 }}>
        {renderBucket('Days 1 - 30 (Top Priority Base)', day30, '#EF4444')}
        {renderBucket('Days 31 - 60 (Intermediate Expansion)', day60, '#F59E0B')}
        {renderBucket('Days 61 - 90 (Stretch Goals)', day90, '#10B981')}
      </div>
    </motion.div>
  );
}
