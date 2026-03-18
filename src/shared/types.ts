export interface Technology {
  technology_name: string;
  category: string;
  short_description: string;
  why_relevant_for_me: string;
  priority: 'High' | 'Medium' | 'Low';
  learning_difficulty: 'Easy' | 'Medium' | 'Hard';
  market_signal: 'High' | 'Medium' | 'Low';
  salary_impact: 'High' | 'Medium' | 'Low';
  project_idea: string;
  sources: string[];
}

export interface AnalysisResult {
  run_date: string;
  current_profile_summary: string;
  recommended_technologies: Technology[];
  top_5_next_skills: string[];
}

// Module keys
export type ModuleKey = 'dashboard' | 'cv_radar' | 'best_roles' | 'jd_match' | 'job_finder' | 'resume_optimizer' | 'app_tracker' | 'learning_roadmap';
