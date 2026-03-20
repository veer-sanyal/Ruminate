"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useChapter } from "@/hooks/useChapter";
import { useReflection } from "@/hooks/useReflection";
import ReflectionHeader from "@/components/reflection/ReflectionHeader";
import UserSummarySection from "@/components/reflection/UserSummarySection";
import PromptCardsSection from "@/components/reflection/PromptCardsSection";
import ConnectionsSection from "@/components/reflection/ConnectionsSection";
import RecallQuestionsSection from "@/components/reflection/RecallQuestionsSection";
import ConfusionClarifications from "@/components/reflection/ConfusionClarifications";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { ArrowLeft, ChevronRight, ICON_COMPACT } from "@/lib/icons";

export default function ReflectPage() {
  const { bookId, chId } = useParams<{ bookId: string; chId: string }>();
  const { data: chapter, isLoading: chapterLoading } = useChapter(bookId, chId);
  const {
    reflection,
    isLoading: reflectionLoading,
    create,
    isCreating,
    update,
    isSaving,
    generateRecall,
    isGeneratingRecall,
  } = useReflection(chId);

  const [userSummary, setUserSummary] = useState("");
  const [promptResponses, setPromptResponses] = useState<string[]>([]);
  const [recallAnswers, setRecallAnswers] = useState<string[]>([]);
  const [clarifications, setClarifications] = useState<
    { passage: string; clarification: string }[]
  >([]);

  // Initialize local state from reflection data
  useEffect(() => {
    if (reflection) {
      setUserSummary(reflection.user_summary ?? "");
      setPromptResponses(
        Array.isArray(reflection.prompt_responses) ? reflection.prompt_responses : []
      );
      setRecallAnswers(
        Array.isArray(reflection.recall_answers) ? reflection.recall_answers : []
      );
      setClarifications(
        Array.isArray(reflection.confusion_clarifications)
          ? reflection.confusion_clarifications
          : []
      );
    }
  }, [reflection]);

  // Auto-create reflection on first visit
  useEffect(() => {
    if (!reflectionLoading && !reflection && chapter) {
      create();
    }
  }, [reflectionLoading, reflection, chapter, create]);

  const handleSave = useCallback(() => {
    if (!reflection) return;
    update({
      user_summary: userSummary || null,
      prompt_responses: promptResponses,
      recall_answers: recallAnswers,
      confusion_clarifications: clarifications,
    });
  }, [reflection, update, userSummary, promptResponses, recallAnswers, clarifications]);

  const handlePromptResponseChange = useCallback(
    (index: number, value: string) => {
      setPromptResponses((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    []
  );

  const handleRecallAnswerChange = useCallback(
    (index: number, value: string) => {
      setRecallAnswers((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    []
  );

  const handleAddClarification = useCallback(
    (item: { passage: string; clarification: string }) => {
      setClarifications((prev) => [...prev, item]);
      // Auto-save after adding clarification
      if (reflection) {
        update({
          confusion_clarifications: [...clarifications, item],
        });
      }
    },
    [reflection, update, clarifications]
  );

  // Get distillation summary for header
  const [distillation, setDistillation] = useState<{ summary: string } | null>(null);
  useEffect(() => {
    if (!chId) return;
    fetch(`/api/books/${bookId}/chapters/${chId}`)
      .then((r) => r.json())
      .then((ch) => {
        if (ch.distillation) setDistillation(ch.distillation);
      })
      .catch(() => {});
  }, [bookId, chId]);

  if (chapterLoading || reflectionLoading || isCreating) {
    return (
      <div style={{ padding: "24px", maxWidth: "680px", margin: "0 auto" }}>
        <Skeleton width="40%" height="20px" />
        <div style={{ height: "16px" }} />
        <Skeleton height="14px" />
        <Skeleton height="14px" />
        <Skeleton width="80%" height="14px" />
        <div style={{ height: "24px" }} />
        <Skeleton height="120px" borderRadius="10px" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Chapter not found.</p>
      </div>
    );
  }

  const prompts = Array.isArray(reflection?.ai_prompts)
    ? reflection.ai_prompts
    : [];
  const connections = Array.isArray(reflection?.ai_connections)
    ? reflection.ai_connections
    : [];
  const recallQuestions = Array.isArray(reflection?.recall_questions)
    ? reflection.recall_questions
    : [];

  return (
    <>
      <div className="reflect-page">
        <div className="reflect-top-bar">
          <Link href={`/library/${bookId}`} className="back-link">
            <ArrowLeft {...ICON_COMPACT} />
            Back to book
          </Link>
          <Link href={`/read/${bookId}/${chId}`}>
            <Button variant="ghost" size="sm" icon={<ChevronRight {...ICON_COMPACT} />}>
              Continue reading
            </Button>
          </Link>
        </div>

        <ReflectionHeader
          chapterTitle={chapter.title ?? "Chapter"}
          summary={distillation?.summary ?? "Analyzing this chapter..."}
        />

        <UserSummarySection
          value={userSummary}
          onChange={setUserSummary}
          onSave={handleSave}
          isSaving={isSaving}
        />

        <PromptCardsSection
          prompts={prompts}
          responses={promptResponses}
          onResponseChange={handlePromptResponseChange}
          onSave={handleSave}
        />

        <ConnectionsSection bookId={bookId} connections={connections} />

        <RecallQuestionsSection
          questions={recallQuestions}
          answers={recallAnswers}
          onAnswerChange={handleRecallAnswerChange}
          onSave={handleSave}
          onGenerate={generateRecall}
          isGenerating={isGeneratingRecall}
        />

        <ConfusionClarifications
          clarifications={clarifications}
          chapterId={chId}
          onAddClarification={handleAddClarification}
        />
      </div>

      <style jsx>{`
        .reflect-page {
          max-width: 680px;
          margin: 0 auto;
          padding: 24px 16px 80px;
        }
        .reflect-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        :global(.back-link) {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;
        }
        :global(.back-link):hover {
          color: var(--text-primary);
        }
      `}</style>
    </>
  );
}
