import { useState, useCallback } from 'react';

interface UploadFormProps {
    onResult: (data: unknown) => void;
    onError: (msg: string) => void;
    onLoading: (loading: boolean) => void;
    loading: boolean;
}

export function UploadForm({ onResult, onError, onLoading, loading }: UploadFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const [cvText, setCvText] = useState('');
    const [dragging, setDragging] = useState(false);
    const [mode, setMode] = useState<'pdf' | 'text'>('pdf');

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped?.type === 'application/pdf') {
            setFile(dropped);
            setMode('pdf');
        } else {
            onError('Only PDF files are supported for upload.');
        }
    }, [onError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'pdf' && !file) {
            onError('Please select a PDF file or switch to text mode.');
            return;
        }
        if (mode === 'text' && !cvText.trim()) {
            onError('Please paste your CV text into the text area.');
            return;
        }

        onLoading(true);
        onError('');

        const formData = new FormData();
        if (mode === 'pdf' && file) {
            formData.append('cv', file);
        } else {
            formData.append('cvText', cvText);
        }

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            // Read raw text FIRST to handle HTML error pages
            const rawText = await response.text();
            const contentType = response.headers.get('Content-Type') ?? '';

            if (!contentType.includes('application/json')) {
                throw new Error(
                    `Middleware Routing Error: Server returned ${contentType || 'unknown type'} instead of JSON. ` +
                    `Check that /api routes are registered before vite.middlewares in server.ts. ` +
                    `Response preview: ${rawText.slice(0, 200)}`
                );
            }

            const data = JSON.parse(rawText);

            if (!response.ok) {
                throw new Error(data?.error ?? `Server error: ${response.status}`);
            }

            onResult(data);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            onLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 glass-card rounded-xl w-fit">
                <button
                    type="button"
                    onClick={() => setMode('pdf')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'pdf'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    📄 Upload PDF
                </button>
                <button
                    type="button"
                    onClick={() => setMode('text')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'text'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    ✏️ Paste Text
                </button>
            </div>

            {mode === 'pdf' ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${dragging
                            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                            : file
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-white/15 hover:border-white/30 hover:bg-white/5'
                        }`}
                    onClick={() => document.getElementById('pdf-input')?.click()}
                >
                    <input
                        id="pdf-input"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setFile(f); setMode('pdf'); }
                        }}
                    />

                    {file ? (
                        <div className="space-y-2 animate-fade-in">
                            <div className="text-4xl">✅</div>
                            <p className="text-emerald-400 font-semibold">{file.name}</p>
                            <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="text-xs text-slate-500 hover:text-red-400 transition-colors mt-1"
                            >
                                ✕ Remove
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-5xl">📂</div>
                            <p className="text-slate-300 font-medium">Drag & drop your CV PDF here</p>
                            <p className="text-slate-500 text-sm">or click to browse files</p>
                        </div>
                    )}
                </div>
            ) : (
                <textarea
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Paste your CV or professional summary here...

Example:
5 years experience as Business Data Analyst. Proficient in SQL, Power BI, Excel. Experience with Python pandas for data manipulation. Worked on ETL pipelines using Azure Data Factory. Background in Electronics Engineering..."
                    rows={10}
                    className="w-full glass-card rounded-2xl p-4 text-slate-300 placeholder-slate-600 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-indigo-500/50 border border-white/10 transition-all"
                />
            )}

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-8 rounded-xl font-semibold text-base transition-all duration-300 ${loading
                        ? 'bg-indigo-700/50 cursor-not-allowed text-indigo-300'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99]'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyzing with Gemini AI...
                    </span>
                ) : (
                    '🔬 Generate My Tech Radar'
                )}
            </button>
        </form>
    );
}
