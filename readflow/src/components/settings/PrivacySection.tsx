"use client";

import { useState } from "react";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface PrivacySectionProps {
  journalPersonalization: boolean;
  localJournalOnly: boolean;
  deleteRawText: boolean;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export default function PrivacySection({
  journalPersonalization,
  localJournalOnly,
  deleteRawText,
  onSave,
}: PrivacySectionProps) {
  const [jp, setJp] = useState(journalPersonalization);
  const [ljo, setLjo] = useState(localJournalOnly);
  const [drt, setDrt] = useState(deleteRawText);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      journal_personalization: jp,
      local_journal_only: ljo,
      delete_raw_text: drt,
    });
    setSaving(false);
  }

  return (
    <>
      <section className="settings-section">
        <h2 className="section-title">Privacy & Data</h2>

        <div className="toggles">
          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Journal personalization</span>
              <span className="toggle-desc">
                Allow AI to use journal entries for better prompts
              </span>
            </div>
            <Toggle checked={jp} onChange={setJp} />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Local-only journal</span>
              <span className="toggle-desc">
                Keep journal entries only on this device
              </span>
            </div>
            <Toggle checked={ljo} onChange={setLjo} />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Delete raw text after processing</span>
              <span className="toggle-desc">
                Remove original text after AI distillation
              </span>
            </div>
            <Toggle checked={drt} onChange={setDrt} />
          </div>
        </div>

        <div className="actions-row">
          <Button size="sm" onClick={handleSave} loading={saving}>
            Save
          </Button>
        </div>

        <div className="danger-zone">
          <Button variant="ghost" size="sm">
            Export my data
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete my account
          </Button>
        </div>
      </section>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
      >
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          This will permanently delete your account, all books, reflections, and journal entries.
          This action cannot be undone.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive">Delete my account</Button>
        </div>
      </Modal>

      <style jsx>{`
        .settings-section {
          padding: 24px 0;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .toggles {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .toggle-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .toggle-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .toggle-desc {
          font-size: 12px;
          color: var(--text-tertiary);
        }
        .actions-row {
          margin-top: 20px;
        }
        .danger-zone {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          gap: 12px;
        }
      `}</style>
    </>
  );
}
