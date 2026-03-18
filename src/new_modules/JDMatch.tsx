import React, { useState } from 'react';
import { AnalysisResult } from '../shared/types';
import { FileCheck, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JDMatch({ result }: { result: AnalysisResult | null }) {
  const [jdText, setJdText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) return;

    setAnalyzing(true);
    // Simulate API delay
    setTimeout(() => {
      setMatchResult({
        score: 84,
        matchingSkills: result ? result.top_5_next_skills.slice(0, 3) : ['SQL', 'Python', 'Stakeholder Management'],
        missingSkills: ['Looker', 'Advanced DAX'],
        notes: 'Your profile is a strong fit for the core analytical requirements. You will need to emphasize your experience with dashboarding tools to cover the missing gaps.'
      });
      setAnalyzing(false);
    }, 1500);
  };

  if (!result) {
    return (
      <div className="glass-panel" style={{ padding: 40, textAlign: 'center', marginTop: 40 }}>
        <FileCheck size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
        <h2 style={{ margin: 0, color: '#F8FAFC' }}>Profile Required</h2>
        <p style={{ color: '#94A3B8', marginTop: 10 }}>
          Run your CV through the <strong>CV Skill Radar</strong> to use the JD Match Checker.
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <FileCheck size={28} color="#6366F1" />
        JD Match Checker
      </h1>
      <p style={{ color: '#94A3B8', marginBottom: 30 }}>Paste a job description to instantly see how well your profile aligns.</p>

      <div style={{ display: 'grid', gridTemplateColumns: matchResult ? '1fr 1fr' : '1fr', gap: 30, alignItems: 'start' }}>
        
        {/* Input Form */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <form onSubmit={handleAnalyze}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 10, color: '#E2E8F0' }}>Job Description Text</label>
            <textarea
              rows={12}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              style={{ width: '100%', resize: 'vertical', padding: 14, fontSize: 14, marginBottom: 20 }}
              className="custom-scrollbar"
            />
            <button
              type="submit"
              disabled={analyzing || !jdText.trim()}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 10,
                border: 'none',
                cursor: (analyzing || !jdText.trim()) ? 'not-allowed' : 'pointer',
                background: (analyzing || !jdText.trim()) ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #10B981, #059669)',
                color: (analyzing || !jdText.trim()) ? '#94A3B8' : '#fff',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {analyzing ? 'Analyzing Fit...' : 'Check Match Score'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {matchResult && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel" style={{ padding: 30, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px 30px', background: 'rgba(16, 185, 129, 0.1)', borderBottomLeftRadius: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#10B981' }}>{matchResult.score}%</div>
              <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600, textTransform: 'uppercase' }}>Match Rate</div>
            </div>

            <h3 style={{ margin: '0 0 24px 0', fontSize: 20, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="#FCD34D" /> Fit Analysis
            </h3>

            <div style={{ marginBottom: 24 }}>
              <strong style={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <CheckCircle2 size={16} color="#10B981" /> Matching Core Skills
              </strong>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {matchResult.matchingSkills.map((s: string, i: number) => (
                  <span key={i} style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#34D399', borderRadius: 999, fontSize: 13, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <strong style={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <AlertTriangle size={16} color="#FCA5A5" /> Missing Requirements
              </strong>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {matchResult.missingSkills.map((s: string, i: number) => (
                  <span key={i} style={{ padding: '4px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', borderRadius: 999, fontSize: 13, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #6366F1' }}>
              <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Strategic Advice</div>
              <div style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 1.6 }}>{matchResult.notes}</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
