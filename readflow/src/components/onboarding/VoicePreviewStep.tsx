"use client";

import { useState } from "react";
import { Play, Pause, ICON_COMPACT } from "@/lib/icons";

const VOICES = [
  { id: "alloy", label: "Alloy", description: "Neutral and clear" },
  { id: "echo", label: "Echo", description: "Warm and steady" },
  { id: "nova", label: "Nova", description: "Bright and articulate" },
  { id: "shimmer", label: "Shimmer", description: "Soft and calm" },
];

const SPEED_PRESETS = [
  { label: "0.75x", value: 0.75 },
  { label: "1.0x", value: 1.0 },
  { label: "1.5x", value: 1.5 },
  { label: "2.0x", value: 2.0 },
];

interface VoicePreviewStepProps {
  voice: string;
  speed: number;
  onVoiceChange: (voice: string) => void;
  onSpeedChange: (speed: number) => void;
}

export default function VoicePreviewStep({
  voice,
  speed,
  onVoiceChange,
  onSpeedChange,
}: VoicePreviewStepProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  function togglePreview(voiceId: string) {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(voiceId);
      // Audio preview would use TTS API in production
      setTimeout(() => setPlayingVoice(null), 3000);
    }
  }

  return (
    <>
      <div className="voice-step">
        <h2 className="step-title">Choose your narrator</h2>
        <p className="step-desc">
          Pick a voice for AI narration. You can preview each one and adjust
          speed.
        </p>

        <div className="voice-cards">
          {VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`voice-card ${voice === v.id ? "voice-active" : ""}`}
              onClick={() => onVoiceChange(v.id)}
            >
              <div className="voice-info">
                <span className="voice-label">{v.label}</span>
                <span className="voice-desc">{v.description}</span>
              </div>
              <button
                type="button"
                className="voice-play"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreview(v.id);
                }}
                aria-label={`Preview ${v.label} voice`}
              >
                {playingVoice === v.id ? (
                  <Pause {...ICON_COMPACT} />
                ) : (
                  <Play {...ICON_COMPACT} />
                )}
              </button>
            </button>
          ))}
        </div>

        <div className="speed-section">
          <label className="speed-label">Narration speed</label>
          <input
            type="range"
            min="0.75"
            max="2.5"
            step="0.05"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="speed-slider"
          />
          <div className="speed-presets">
            {SPEED_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`speed-preset ${Math.abs(speed - preset.value) < 0.01 ? "preset-active" : ""}`}
                onClick={() => onSpeedChange(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <span className="speed-value">{speed.toFixed(2)}x</span>
        </div>
      </div>

      <style jsx>{`
        .voice-step {
          display: flex;
          flex-direction: column;
        }
        .step-title {
          font-family: var(--font-display);
          font-size: 24px;
          color: var(--text-primary);
        }
        .step-desc {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 8px;
        }
        .voice-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 24px;
        }
        .voice-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 2px solid var(--border-default);
          cursor: pointer;
          text-align: left;
          transition: all 150ms ease;
        }
        .voice-card:hover {
          border-color: var(--border-hover);
        }
        .voice-active {
          border-color: var(--accent);
          background: var(--bg-accent-subtle);
        }
        .voice-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .voice-label {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }
        .voice-desc {
          font-size: 12px;
          color: var(--text-tertiary);
        }
        .voice-play {
          width: 32px;
          height: 32px;
          border-radius: 16px;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }
        .speed-section {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .speed-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .speed-slider {
          width: 100%;
          accent-color: var(--accent);
        }
        .speed-presets {
          display: flex;
          gap: 8px;
        }
        .speed-preset {
          padding: 4px 12px;
          border-radius: 14px;
          font-size: 12px;
          font-family: var(--font-mono);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          cursor: pointer;
          color: var(--text-secondary);
        }
        .preset-active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        .speed-value {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--text-secondary);
          text-align: center;
        }
      `}</style>
    </>
  );
}
