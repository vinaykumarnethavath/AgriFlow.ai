"use client";

import React from "react";
import { VoiceStatus } from "@/hooks/useVoiceCommand";

interface VoiceWaveformProps {
    status: VoiceStatus;
    barCount?: number;
}

const STATUS_COLORS: Record<VoiceStatus, { from: string; to: string }> = {
    idle: { from: "#22c55e", to: "#16a34a" },
    listening: { from: "#22c55e", to: "#4ade80" },
    processing: { from: "#f59e0b", to: "#fbbf24" },
    speaking: { from: "#3b82f6", to: "#60a5fa" },
    error: { from: "#ef4444", to: "#f87171" },
    unsupported: { from: "#6b7280", to: "#9ca3af" },
};

export function VoiceWaveform({ status, barCount = 5 }: VoiceWaveformProps) {
    const isActive = status === "listening" || status === "speaking";
    const colors = STATUS_COLORS[status] || STATUS_COLORS.idle;

    return (
        <div className="flex items-center justify-center gap-[3px] h-10">
            {Array.from({ length: barCount }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-full transition-all duration-150"
                    style={{
                        width: "4px",
                        background: `linear-gradient(to top, ${colors.from}, ${colors.to})`,
                        height: isActive ? undefined : "8px",
                        animation: isActive
                            ? `voiceWave 1.2s ease-in-out ${i * 0.15}s infinite`
                            : "none",
                        opacity: isActive ? 1 : 0.4,
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes voiceWave {
                    0%, 100% { height: 8px; }
                    50% { height: 32px; }
                }
            `}</style>
        </div>
    );
}

// ── Larger waveform for the modal overlay ────────────────────────────────────

interface LargeWaveformProps {
    status: VoiceStatus;
}

export function LargeWaveform({ status }: LargeWaveformProps) {
    const isActive = status === "listening" || status === "speaking";
    const colors = STATUS_COLORS[status] || STATUS_COLORS.idle;
    const barCount = 12;

    return (
        <div className="flex items-center justify-center gap-[4px] h-16 my-4">
            {Array.from({ length: barCount }).map((_, i) => {
                const delay = i < barCount / 2 ? i * 0.08 : (barCount - i - 1) * 0.08;
                return (
                    <div
                        key={i}
                        className="rounded-full transition-all duration-150"
                        style={{
                            width: "5px",
                            background: `linear-gradient(to top, ${colors.from}, ${colors.to})`,
                            height: isActive ? undefined : "6px",
                            animation: isActive
                                ? `voiceWaveLarge 0.9s ease-in-out ${delay}s infinite alternate`
                                : "none",
                            opacity: isActive ? 0.9 : 0.3,
                        }}
                    />
                );
            })}
            <style jsx>{`
                @keyframes voiceWaveLarge {
                    0% { height: 6px; }
                    100% { height: 56px; }
                }
            `}</style>
        </div>
    );
}
