import type { AnalysisResult, Priority } from '../types';

interface ResultsPanelProps {
    data: AnalysisResult;
}

const PRIORITY_STYLES: Record<Priority, string> = {
    Adopt: 'ring-adopt  border',
    Trial: 'ring-trial  border',
    Assess: 'ring-assess border',
    Hold: 'ring-hold   border',
};

const PRIORITY_DOT: Record<Priority, string> = {
    Adopt: 'bg-radar-adopt',
    Trial: 'bg-radar-trial',
    Assess: 'bg-radar-assess',
    Hold: 'bg-radar-hold',
};

export function ResultsPanel({ data }: ResultsPanelProps) {
    return (
        <div className="space-y-8 animate-slide-up">
            {/* Profile Summary */}
            <div className="glass-card p-6 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🧠</span>
                    <h2 className="text-lg font-bold text-white">Profile Summary</h2>
                    <span className="ml-auto text-xs text-slate-500 font-mono">{data.run_date}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{data.current_profile_summary}</p>
            </div>

            {/* Tech Radar Table */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <span className="text-2xl">📡</span>
                    <h2 className="text-lg font-bold text-white">Technology Recommendations</h2>
                    <span className="ml-auto text-xs text-slate-500">{data.recommended_technologies.length} technologies</span>
                </div>

                <div className="space-y-4">
                    {data.recommended_technologies.map((tech, i) => (
                        <div
                            key={i}
                            className="relative p-5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-all duration-200 group"
                        >
                            <div className="flex flex-wrap items-start gap-3 mb-3">
                                <span className="text-slate-500 text-sm font-mono w-6 shrink-0 mt-0.5">{i + 1}.</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white text-base">{tech.technology_name}</h3>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_STYLES[tech.priority] ?? 'bg-slate-700 text-slate-300'}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[tech.priority] ?? 'bg-slate-400'}`} />
                                            {tech.priority}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{tech.category}</span>
                                </div>
                            </div>

                            <div className="pl-9 space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Market Signal</p>
                                    <p className="text-slate-300 text-sm leading-relaxed">{tech.market_signal}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-indigo-500/8 border border-indigo-500/15">
                                    <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold mb-1">💡 Project Idea</p>
                                    <p className="text-slate-300 text-sm leading-relaxed">{tech.project_idea}</p>
                                </div>

                                {tech.sources && tech.sources.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">📚 Resources</p>
                                        <ul className="space-y-0.5">
                                            {tech.sources.map((src, j) => (
                                                <li key={j} className="text-xs text-slate-400">
                                                    {src.startsWith('http') ? (
                                                        <a href={src} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline-offset-2 hover:underline">
                                                            {src}
                                                        </a>
                                                    ) : (
                                                        <span className="text-indigo-400">{src}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top 5 Next Skills */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <span className="text-2xl">🎯</span>
                    <h2 className="text-lg font-bold text-white">Top 5 Next Skills to Learn</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.top_5_next_skills.map((skill, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-200"
                        >
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
                                {i + 1}
                            </span>
                            <span className="text-slate-200 font-medium text-sm">{skill}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
