"use client";

import { useState, useCallback } from "react";
import { Mic, MicOff, ICON_COMPACT } from "@/lib/icons";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface UserSummarySectionProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function UserSummarySection({
  value,
  onChange,
  onSave,
  isSaving,
}: UserSummarySectionProps) {
  const [isListening, setIsListening] = useState(false);

  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onChange(value + " " + transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, [isListening, value, onChange]);

  return (
    <>
      <div className="summary-section">
        <div className="section-header">
          <h3 className="section-title">In your own words</h3>
          <button
            className={`voice-btn ${isListening ? "listening" : ""}`}
            onClick={toggleVoice}
            title={isListening ? "Stop recording" : "Voice input"}
          >
            {isListening ? (
              <MicOff {...ICON_COMPACT} />
            ) : (
              <Mic {...ICON_COMPACT} />
            )}
          </button>
        </div>
        <textarea
          className="summary-textarea"
          placeholder="Summarize what you took away from this chapter..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          rows={4}
        />
        {isSaving && <span className="saving-indicator">Saving...</span>}
      </div>

      <style jsx>{`
        .summary-section {
          margin-bottom: 28px;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 17px;
          color: var(--text-primary);
        }
        .voice-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms ease;
        }
        .voice-btn:hover {
          background: var(--bg-tertiary);
        }
        .voice-btn.listening {
          background: var(--error);
          color: white;
          border-color: var(--error);
          animation: pulse 1.5s infinite;
        }
        .summary-textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 15px;
          line-height: 1.6;
          resize: vertical;
          font-family: inherit;
          transition: border-color 150ms ease;
        }
        .summary-textarea:focus {
          outline: none;
          border-color: var(--accent);
        }
        .summary-textarea::placeholder {
          color: var(--text-tertiary);
        }
        .saving-indicator {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 4px;
          display: block;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
