// Shared TypeScript types matching the Gemini API response schema

export type Priority = 'Adopt' | 'Trial' | 'Assess' | 'Hold';

export type TechCategory =
    | 'Cloud Data Warehouse'
    | 'Lakehouse & ML'
    | 'Analytics Engineering'
    | 'BI & Visualization'
    | 'LLM Orchestration'
    | 'Real-Time Streaming'
    | 'Governed Analytics'
    | 'Unified Analytics';

export interface RecommendedTechnology {
    technology_name: string;
    category: TechCategory | string;
    priority: Priority;
    market_signal: string;
    project_idea: string;
    sources: string[];
}

export interface AnalysisResult {
    run_date: string;
    current_profile_summary: string;
    recommended_technologies: RecommendedTechnology[];
    top_5_next_skills: string[];
}
