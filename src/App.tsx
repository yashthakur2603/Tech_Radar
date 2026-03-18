import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Briefcase, 
  FileCheck, 
  Search, 
  FileEdit, 
  List, 
  Map as MapIcon 
} from 'lucide-react';
import { AnalysisResult, ModuleKey } from './shared/types';

// Modules
import CVRadarModule from './existing_core/CVRadarModule';
import Dashboard from './new_modules/Dashboard';
import BestRoles from './new_modules/BestRoles';
import JDMatch from './new_modules/JDMatch';
import JobFinder from './new_modules/JobFinder';
import ResumeOptimizer from './new_modules/ResumeOptimizer';
import AppTracker from './new_modules/AppTracker';
import LearningRoadmap from './new_modules/LearningRoadmap';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('cv_radar');
  const [globalResult, setGlobalResult] = useState<AnalysisResult | null>(null);

  const menuItems: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { key: 'cv_radar', label: 'CV Skill Radar', icon: <Activity size={20} /> },
    { key: 'best_roles', label: 'Best Roles for Me', icon: <Briefcase size={20} /> },
    { key: 'jd_match', label: 'JD Match Checker', icon: <FileCheck size={20} /> },
    { key: 'job_finder', label: 'Job Finder', icon: <Search size={20} /> },
    { key: 'resume_optimizer', label: 'Resume Optimizer', icon: <FileEdit size={20} /> },
    { key: 'app_tracker', label: 'Applications Tracker', icon: <List size={20} /> },
    { key: 'learning_roadmap', label: 'Learning Roadmap', icon: <MapIcon size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A' }}>
      {/* SIDEBAR */}
      <div style={{ 
        width: '280px', 
        background: '#1E293B', 
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0 12px', marginBottom: 40 }}>
          <h2 style={{ margin: 0, color: '#F8FAFC', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Career<span style={{ color: '#6366F1' }}>OS</span>
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: 13 }}>Intelligence Platform</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {menuItems.map((item) => {
            const isActive = activeModule === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveModule(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: isActive ? '#818CF8' : '#94A3B8',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 15,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#E2E8F0';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* MAIN CONTENT ZONE */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {activeModule === 'cv_radar' && <CVRadarModule savedResult={globalResult} onAnalysisComplete={setGlobalResult} />}
          {activeModule === 'dashboard' && <Dashboard result={globalResult} />}
          {activeModule === 'best_roles' && <BestRoles result={globalResult} />}
          {activeModule === 'jd_match' && <JDMatch result={globalResult} />}
          {activeModule === 'job_finder' && <JobFinder />}
          {activeModule === 'resume_optimizer' && <ResumeOptimizer result={globalResult} />}
          {activeModule === 'app_tracker' && <AppTracker />}
          {activeModule === 'learning_roadmap' && <LearningRoadmap result={globalResult} />}
        </div>
      </div>
    </div>
  );
}
