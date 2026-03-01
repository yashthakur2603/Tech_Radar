import { useMemo, useState } from 'react';
import type { RecommendedTechnology, Priority } from '../types';

interface RadarChartProps {
    technologies: RecommendedTechnology[];
}

const RINGS: { label: Priority; color: string; stroke: string; r: number }[] = [
    { label: 'Adopt', color: 'rgba(16,185,129,0.08)', stroke: '#10b981', r: 90 },
    { label: 'Trial', color: 'rgba(59,130,246,0.08)', stroke: '#3b82f6', r: 155 },
    { label: 'Assess', color: 'rgba(245,158,11,0.08)', stroke: '#f59e0b', r: 215 },
    { label: 'Hold', color: 'rgba(239,68,68,0.08)', stroke: '#ef4444', r: 270 },
];

const BLIP_COLORS: Record<Priority, string> = {
    Adopt: '#10b981',
    Trial: '#3b82f6',
    Assess: '#f59e0b',
    Hold: '#ef4444',
};

interface Blip {
    tech: RecommendedTechnology;
    x: number;
    y: number;
}

function seedRandom(str: string): () => number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return () => {
        h ^= h << 13; h ^= h >> 17; h ^= h << 5;
        return (h >>> 0) / 4294967296;
    };
}

function positionBlip(tech: RecommendedTechnology, index: number, total: number): { x: number; y: number } {
    const ringMap: Record<Priority, [number, number]> = {
        Adopt: [15, 75],
        Trial: [95, 140],
        Assess: [160, 200],
        Hold: [220, 260],
    };

    const rand = seedRandom(tech.technology_name + index);
    const [rMin, rMax] = ringMap[tech.priority] ?? [15, 75];
    const r = rMin + rand() * (rMax - rMin);

    // Spread blips evenly across quadrants based on index
    const sectorAngle = (2 * Math.PI) / Math.max(total, 1);
    const baseAngle = index * sectorAngle;
    const jitter = (rand() - 0.5) * sectorAngle * 0.6;
    const angle = baseAngle + jitter;

    return {
        x: 285 + r * Math.cos(angle),
        y: 285 + r * Math.sin(angle),
    };
}

export function RadarChart({ technologies }: RadarChartProps) {
    const [tooltip, setTooltip] = useState<Blip | null>(null);

    const blips: Blip[] = useMemo(
        () => technologies.map((tech, i) => ({
            tech,
            ...positionBlip(tech, i, technologies.length),
        })),
        [technologies]
    );

    return (
        <div className="relative flex flex-col items-center animate-fade-in">
            <svg
                viewBox="0 0 570 570"
                className="w-full max-w-lg drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 40px rgba(99,102,241,0.15))' }}
            >
                {/* Rings (outer → inner) */}
                {[...RINGS].reverse().map((ring) => (
                    <circle
                        key={ring.label}
                        cx={285} cy={285} r={ring.r}
                        fill={ring.color}
                        stroke={ring.stroke}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        opacity={0.7}
                    />
                ))}

                {/* Crosshairs */}
                <line x1={285} y1={15} x2={285} y2={555} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <line x1={15} y1={285} x2={555} y2={285} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

                {/* Ring labels */}
                {RINGS.map((ring) => (
                    <text
                        key={ring.label}
                        x={285}
                        y={285 - ring.r + 14}
                        textAnchor="middle"
                        fill={ring.stroke}
                        fontSize={10}
                        fontWeight={600}
                        opacity={0.9}
                    >
                        {ring.label.toUpperCase()}
                    </text>
                ))}

                {/* Blips */}
                {blips.map((blip, i) => {
                    const color = BLIP_COLORS[blip.tech.priority] ?? '#94a3b8';
                    return (
                        <g
                            key={i}
                            className="cursor-pointer"
                            onMouseEnter={() => setTooltip(blip)}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <circle
                                cx={blip.x} cy={blip.y} r={10}
                                fill={color}
                                fillOpacity={0.2}
                                stroke={color}
                                strokeWidth={2}
                            />
                            <text
                                x={blip.x} y={blip.y + 4}
                                textAnchor="middle"
                                fill="white"
                                fontSize={8}
                                fontWeight={700}
                            >
                                {i + 1}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="absolute top-4 right-0 glass-card p-4 rounded-xl max-w-[220px] text-sm z-20 animate-fade-in shadow-2xl border border-white/10"
                >
                    <p className="font-bold text-white mb-1">{tooltip.tech.technology_name}</p>
                    <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2"
                        style={{
                            background: `${BLIP_COLORS[tooltip.tech.priority]}22`,
                            color: BLIP_COLORS[tooltip.tech.priority],
                            border: `1px solid ${BLIP_COLORS[tooltip.tech.priority]}55`,
                        }}
                    >
                        {tooltip.tech.priority}
                    </span>
                    <p className="text-slate-400 text-xs leading-relaxed">{tooltip.tech.category}</p>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {RINGS.map((ring) => (
                    <div key={ring.label} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: ring.stroke }} />
                        <span className="text-slate-400 font-medium">{ring.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
