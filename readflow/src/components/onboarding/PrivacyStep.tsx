"use client";

import Toggle from "@/components/ui/Toggle";

interface PrivacySettings {
  journal_personalization: boolean;
  local_journal_only: boolean;
  delete_raw_text: boolean;
}

interface PrivacyStepProps {
  value: PrivacySettings;
  onChange: (settings: PrivacySettings) => void;
}

const OPTIONS: {
  key: keyof PrivacySettings;
  label: string;
  description: string;
}[] = [
  {
    key: "journal_personalization",
    label: "Journal personalization",
    description:
      "Allow AI to use your journal entries to generate better, more relevant prompts and reflections.",
  },
  {
    key: "local_journal_only",
    label: "Local-only journal storage",
    description:
      "Keep journal entries only on this device. They won't be synced or used for AI personalization.",
  },
  {
    key: "delete_raw_text",
    label: "Delete raw book text after processing",
    description:
      "Remove the original extracted text after AI distillation is complete. Saves storage but prevents re-processing.",
  },
];

export default function PrivacyStep({ value, onChange }: PrivacyStepProps) {
  return (
    <>
      <div className="privacy-step">
        <h2 className="step-title">Privacy & data</h2>
        <p className="step-desc">
          You&apos;re in control. Adjust these settings anytime from your
          profile.
        </p>

        <div className="privacy-options">
          {OPTIONS.map((opt) => (
            <div key={opt.key} className="privacy-option">
              <div className="option-text">
                <span className="option-label">{opt.label}</span>
                <span className="option-desc">{opt.description}</span>
              </div>
              <Toggle
                checked={value[opt.key]}
                onChange={(checked) =>
                  onChange({ ...value, [opt.key]: checked })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .privacy-step {
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
        .privacy-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 28px;
        }
        .privacy-option {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          justify-content: space-between;
        }
        .option-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .option-label {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .option-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }
      `}</style>
    </>
  );
}
