import { useState } from 'react';
import { UploadForm } from './components/UploadForm';
import { RadarChart } from './components/RadarChart';
import { ResultsPanel } from './components/ResultsPanel';
import type { AnalysisResult } from './types';

export default function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<AnalysisResult | null>(null);

    const handleResult = (raw: unknown) => {
        setData(raw as AnalysisResult);
        setError('');
        // Scroll to results
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleReset = () => {
        setData(null);
        setError('');
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* ─── Header ─────────────────────────────────────────────── */}
            <header className="sticky top-0 z-30 border-b border-white/8 backdrop-blur-md bg-slate-950/70">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📡</span>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-none">Personal Tech Radar</h1>
                            <p className="text-xs text-indigo-400 font-medium mt-0.5">Powered by Gemini AI</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <KeyStatusBadge />
                        {data && (
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 text-xs rounded-lg border border-white/15 text-slate-400 hover:text-white hover:border-white/30 transition-all"
                            >
                                ↩ Start Over
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ─── Main ────────────────────────────────────────────────── */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                {!data ? (
                    /* ── Upload Section ── */
                    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                        <div className="text-center space-y-3">
                            <h2 className="text-4xl font-extrabold text-white leading-tight">
                                Your Personal
                                <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                                    Tech Radar
                                </span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Upload your CV or paste your profile summary. Gemini AI will analyze your skills
                                and generate a personalized Thoughtworks-style technology radar.
                            </p>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: '🎯', label: 'Adopt → Hold', sub: '4 priority rings' },
                                { icon: '🤖', label: 'Gemini 1.5', sub: 'Flash model' },
                                { icon: '🔒', label: 'Server-side', sub: 'API key never exposed' },
                            ].map((stat) => (
                                <div key={stat.label} className="glass-card p-4 text-center space-y-1">
                                    <span className="text-2xl">{stat.icon}</span>
                                    <p className="text-xs font-semibold text-white">{stat.label}</p>
                                    <p className="text-xs text-slate-500">{stat.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card p-6">
                            <UploadForm
                                onResult={handleResult}
                                onError={setError}
                                onLoading={setLoading}
                                loading={loading}
                            />

                            {error && (
                                <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
                                    <p className="text-red-400 text-sm font-medium mb-1">⚠️ Error</p>
                                    <p className="text-red-300/80 text-sm leading-relaxed font-mono break-words">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── Results Section ── */
                    <div id="results-section" className="space-y-10 animate-fade-in">
                        {/* Results header */}
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-extrabold text-white">
                                🎉 Your Tech Radar is Ready
                            </h2>
                            <p className="text-slate-400">
                                {data.recommended_technologies.length} technologies analyzed across{' '}
                                {[...new Set(data.recommended_technologies.map((t) => t.priority))].length} priority rings
                            </p>
                        </div>

                        {/* Two-column layout: Radar + Results */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
                            <div className="glass-card p-6 sticky top-24">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                    Radar Visualization
                                </h3>
                                <RadarChart technologies={data.recommended_technologies} />
                                <div className="mt-4 pt-4 border-t border-white/8">
                                    <p className="text-xs text-slate-500 text-center">
                                        Hover blips to see technology details
                                    </p>
                                    <div className="mt-3 space-y-1">
                                        {data.recommended_technologies.map((t, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="text-slate-600 font-mono w-4">{i + 1}.</span>
                                                <span className="font-medium text-slate-300">{t.technology_name}</span>
                                                <span className="text-slate-600">—</span>
                                                <span className="text-slate-500">{t.category}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <ResultsPanel data={data} />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ─── Footer ─────────────────────────────────────────────── */}
            <footer className="border-t border-white/8 py-6 text-center">
                <p className="text-slate-600 text-xs">
                    Personal Tech Radar Agent · Built with Express + Vite + React + Gemini AI
                </p>
            </footer>
        </div>
    );
}

// ── Key status indicator in header ──────────────────────────────────────────
function KeyStatusBadge() {
    const [status, setStatus] = useState<'idle' | 'ok' | 'missing'>('idle');

    const check = async () => {
        try {
            const res = await fetch('/api/keycheck');
            const data = await res.json() as { present: boolean; prefix: string };
            setStatus(data.present ? 'ok' : 'missing');
            setTimeout(() => setStatus('idle'), 4000);
        } catch {
            setStatus('missing');
        }
    };

    return (
        <button
            onClick={check}
            title="Check Gemini API key status"
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all font-mono ${status === 'ok'
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : status === 'missing'
                        ? 'border-red-500/40 text-red-400 bg-red-500/10'
                        : 'border-white/15 text-slate-500 hover:text-slate-300 hover:border-white/25'
                }`}
        >
            {status === 'idle' ? '🔑 Key?' : status === 'ok' ? '✅ Key OK' : '❌ No Key'}
        </button>
    );
}
