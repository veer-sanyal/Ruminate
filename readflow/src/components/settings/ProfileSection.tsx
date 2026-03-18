"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ProfileSectionProps {
  profile: {
    display_name?: string | null;
    email: string;
    avatar_url?: string | null;
  };
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export default function ProfileSection({ profile, onSave }: ProfileSectionProps) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ display_name: displayName });
    setSaving(false);
  }

  return (
    <>
      <section className="settings-section">
        <h2 className="section-title">Profile</h2>
        <div className="fields">
          <Input
            id="display-name"
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            id="email"
            label="Email"
            value={profile.email}
            disabled
          />
          <Button size="sm" onClick={handleSave} loading={saving}>
            Save
          </Button>
        </div>
      </section>

      <style jsx>{`
        .settings-section {
          padding: 24px 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 360px;
        }
      `}</style>
    </>
  );
}
