"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProfileSection from "@/components/settings/ProfileSection";
import ReadingPreferencesSection from "@/components/settings/ReadingPreferencesSection";
import PersonalizationSection from "@/components/settings/PersonalizationSection";
import PrivacySection from "@/components/settings/PrivacySection";
import Skeleton from "@/components/ui/Skeleton";

async function fetchProfile() {
  const res = await fetch("/api/user/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });

  async function handleSave(data: Record<string, unknown>) {
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Skeleton width="120px" height="28px" />
        <Skeleton height="200px" borderRadius="8px" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          color: "var(--text-primary)",
        }}
      >
        Settings
      </h1>

      <ProfileSection profile={profile} onSave={handleSave} />
      <ReadingPreferencesSection
        narrationSpeed={profile.narration_speed ?? 1.0}
        preferredVoice={profile.preferred_voice ?? "alloy"}
        onSave={handleSave}
      />
      <PersonalizationSection
        focusAreas={profile.focus_areas ?? []}
        coachTone={profile.coach_tone ?? "gentle"}
        onSave={handleSave}
      />
      <PrivacySection
        journalPersonalization={profile.journal_personalization ?? true}
        localJournalOnly={profile.local_journal_only ?? false}
        deleteRawText={profile.delete_raw_text ?? false}
        onSave={handleSave}
      />
    </div>
  );
}
