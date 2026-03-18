"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import FocusAreasStep from "@/components/onboarding/FocusAreasStep";
import CoachToneStep from "@/components/onboarding/CoachToneStep";
import VoicePreviewStep from "@/components/onboarding/VoicePreviewStep";
import PrivacyStep from "@/components/onboarding/PrivacyStep";
import type { CoachTone } from "@/types";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step data
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [coachTone, setCoachTone] = useState<CoachTone>("gentle");
  const [voice, setVoice] = useState("alloy");
  const [speed, setSpeed] = useState(1.0);
  const [privacy, setPrivacy] = useState({
    journal_personalization: true,
    local_journal_only: false,
    delete_raw_text: false,
  });

  const canNext =
    step === 0 ? focusAreas.length >= 3 : true;

  async function handleFinish() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus_areas: focusAreas,
          coach_tone: coachTone,
          preferred_voice: voice,
          narration_speed: speed,
          ...privacy,
        }),
      });
      if (!res.ok) throw new Error("Failed to save onboarding");
      router.push("/library");
    } catch {
      setLoading(false);
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  }

  return (
    <>
      <div className="onboarding">
        {/* Progress dots */}
        <div className="dots">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`dot ${i === step ? "dot-active" : ""} ${i < step ? "dot-done" : ""}`}
            />
          ))}
        </div>

        {/* Steps */}
        <div className="step-content">
          {step === 0 && (
            <FocusAreasStep value={focusAreas} onChange={setFocusAreas} />
          )}
          {step === 1 && (
            <CoachToneStep value={coachTone} onChange={setCoachTone} />
          )}
          {step === 2 && (
            <VoicePreviewStep
              voice={voice}
              speed={speed}
              onVoiceChange={setVoice}
              onSpeedChange={setSpeed}
            />
          )}
          {step === 3 && <PrivacyStep value={privacy} onChange={setPrivacy} />}
        </div>

        {/* Navigation */}
        <div className="nav-row">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={handleNext}
            disabled={!canNext}
            loading={loading}
          >
            {step === TOTAL_STEPS - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .onboarding {
          max-width: 560px;
          margin: 0 auto;
          padding: 40px 0;
        }
        .dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 40px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background: var(--bg-tertiary);
          transition: all 200ms ease;
        }
        .dot-active {
          width: 24px;
          background: var(--accent);
        }
        .dot-done {
          background: var(--accent);
          opacity: 0.5;
        }
        .step-content {
          min-height: 360px;
        }
        .nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
        }
      `}</style>
    </>
  );
}
