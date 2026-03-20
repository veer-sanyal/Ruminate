"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useChapter } from "@/hooks/useChapter";
import { useChapters } from "@/hooks/useChapters";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useRSVPPlayer } from "@/hooks/useRSVPPlayer";
import { useCheckpoints } from "@/hooks/useCheckpoints";
import { useReadingSession } from "@/hooks/useReadingSession";
import { useProgressPersistence } from "@/hooks/useProgressPersistence";
import { useReaderStore } from "@/stores/readerStore";
import { getSentenceForWord, splitIntoWords } from "@/lib/utils/text-utils";
import ReaderTopBar from "@/components/reader/ReaderTopBar";
import ChapterText from "@/components/reader/ChapterText";
import PlayPauseButton from "@/components/reader/PlayPauseButton";
import ScrubBar from "@/components/reader/ScrubBar";
import SpeedControl from "@/components/reader/SpeedControl";
import SentenceReplay from "@/components/reader/SentenceReplay";
import ParagraphView from "@/components/reader/ParagraphView";
import ConfusionFlag from "@/components/reader/ConfusionFlag";
import CheckpointCard from "@/components/reader/CheckpointCard";
import AudioLoadingState from "@/components/reader/AudioLoadingState";
import ChapterComplete from "@/components/reader/ChapterComplete";
import RSVPDisplay from "@/components/reader/RSVPDisplay";
import RSVPContextLine from "@/components/reader/RSVPContextLine";
import RSVPScrubBar from "@/components/reader/RSVPScrubBar";
import WPMControl from "@/components/reader/WPMControl";
import Skeleton from "@/components/ui/Skeleton";

export default function ReaderPage() {
  const { bookId, chId } = useParams<{ bookId: string; chId: string }>();
  const queryClient = useQueryClient();
  const { data: chapter, isLoading: chapterLoading } = useChapter(bookId, chId);
  const { data: chapters } = useChapters(bookId);
  const { togglePlayPause, currentWordIndex, reset, seek: storeSeek, playbackPosition, mode } = useReaderStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [rsvpWpm, setRsvpWpm] = useState(300);

  const isRSVP = mode === "rsvp";

  // Initialize reader hooks
  useCheckpoints();
  useReadingSession(chId, mode);
  useProgressPersistence(bookId, chId);

  // Reset store on chapter change
  useEffect(() => {
    reset();
  }, [chId, reset]);

  // Generate audio if needed
  useEffect(() => {
    if (!chapter || chapter.audio_url) return;

    let cancelled = false;

    async function generateAudio() {
      setGeneratingAudio(true);
      setAudioError(false);
      try {
        const res = await fetch(
          `/api/books/${bookId}/chapters/${chId}/audio`,
          { method: "POST" }
        );
        if (!res.ok) throw new Error("Failed to generate audio");
        // Refetch chapter to pick up the new audio_url
        if (!cancelled) {
          await queryClient.invalidateQueries({
            queryKey: ["chapter", bookId, chId],
          });
        }
      } catch {
        if (!cancelled) setAudioError(true);
      } finally {
        if (!cancelled) setGeneratingAudio(false);
      }
    }

    generateAudio();
    return () => { cancelled = true; };
  }, [chapter?.audio_url, bookId, chId, queryClient, retryCount]);

  // Fetch word timestamps in background once audio is ready
  useEffect(() => {
    if (!chapter?.audio_url || chapter.audio_timestamps?.length) return;

    let cancelled = false;

    async function fetchTimestamps() {
      try {
        const res = await fetch(
          `/api/books/${bookId}/chapters/${chId}/audio/timestamps`,
          { method: "POST" }
        );
        if (!res.ok) {
          console.warn("[Reader] Timestamp generation failed:", res.status);
          return;
        }
        if (!cancelled) {
          await queryClient.invalidateQueries({
            queryKey: ["chapter", bookId, chId],
          });
        }
      } catch (err) {
        console.warn("[Reader] Timestamp fetch error:", err);
      }
    }

    fetchTimestamps();
    return () => { cancelled = true; };
  }, [chapter?.audio_url, chapter?.audio_timestamps?.length, bookId, chId, queryClient]);

  // Audio player (narration mode)
  const { seekTo, getDuration, isLoading: audioLoading } = useAudioPlayer({
    audioUrl: !isRSVP ? (chapter?.audio_url ?? null) : null,
    timestamps: chapter?.audio_timestamps ?? undefined,
    onEnded: () => setShowComplete(true),
  });

  // RSVP player
  const rsvpPlayer = useRSVPPlayer({
    text: chapter?.raw_text ?? "",
    wpm: rsvpWpm,
    onEnded: () => setShowComplete(true),
  });

  // Sentence replay
  const handleReplaySentence = useCallback(() => {
    if (!chapter?.raw_text) return;
    const { sentenceText } = getSentenceForWord(
      chapter.raw_text,
      currentWordIndex
    );
    const words = splitIntoWords(chapter.raw_text);
    // Find sentence start word index
    const sentenceWords = splitIntoWords(sentenceText);
    let startIndex = 0;
    for (let i = 0; i <= currentWordIndex; i++) {
      if (words.slice(i, i + sentenceWords.length).join(" ") === sentenceWords.join(" ")) {
        startIndex = i;
      }
    }
    // If we have timestamps, seek to sentence start time
    if (chapter.audio_timestamps?.[startIndex]) {
      seekTo(chapter.audio_timestamps[startIndex].start);
    }
  }, [chapter, currentWordIndex, seekTo]);

  // Find next chapter
  const currentChapterIndex = chapters?.findIndex(
    (ch: { id: string }) => ch.id === chId
  );
  const nextChapter =
    currentChapterIndex !== undefined && currentChapterIndex >= 0
      ? chapters?.[currentChapterIndex + 1]
      : null;
  const isLastChapter =
    currentChapterIndex !== undefined &&
    chapters &&
    currentChapterIndex === chapters.length - 1;

  // Resume from saved progress
  useEffect(() => {
    if (!chapter) return;
    if (chapter.listen_progress_ms > 0 && chapter.audio_url) {
      seekTo(chapter.listen_progress_ms);
    }
  }, [chapter?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (chapterLoading) {
    return (
      <div style={{ padding: "80px 24px", maxWidth: "680px", margin: "0 auto" }}>
        <Skeleton width="40%" height="20px" />
        <div style={{ height: "20px" }} />
        <Skeleton height="14px" />
        <Skeleton height="14px" />
        <Skeleton width="80%" height="14px" />
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

  if (showComplete) {
    return (
      <ChapterComplete
        bookId={bookId}
        chapterId={chId}
        chapterTitle={chapter.title ?? "Chapter"}
        nextChapterId={nextChapter?.id ?? null}
        isLastChapter={!!isLastChapter}
      />
    );
  }

  const duration = getDuration();
  const progressPercent = isRSVP
    ? rsvpPlayer.progressPercent
    : duration > 0
      ? (playbackPosition / duration) * 100
      : 0;

  return (
    <>
      {/* Reading progress bar at very top */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      <div className="reader">
        <ReaderTopBar
          bookId={bookId}
          chapterTitle={chapter.title ?? "Chapter"}
          onSettingsClick={() => setShowSettings(!showSettings)}
          progressPercent={Math.round(progressPercent)}
          showModeToggle
        />

        <div className="reader-content">
          <div className="page-container">
            {isRSVP ? (
              /* RSVP Mode */
              <>
                <RSVPDisplay word={rsvpPlayer.currentWord} />
                {chapter.raw_text && (
                  <RSVPContextLine
                    text={chapter.raw_text}
                    currentWordIndex={rsvpPlayer.currentWordIndex}
                  />
                )}
              </>
            ) : (
              /* Narration Mode */
              <>
                {generatingAudio || audioLoading ? (
                  <AudioLoadingState status="generating" />
                ) : audioError ? (
                  <AudioLoadingState
                    status="error"
                    onRetry={() => {
                      setAudioError(false);
                      setRetryCount((c) => c + 1);
                    }}
                  />
                ) : null}

                {chapter.raw_text && (
                  <ChapterText
                    text={chapter.raw_text}
                    onTogglePlayPause={togglePlayPause}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          {isRSVP ? (
            <>
              <RSVPScrubBar
                currentWord={rsvpPlayer.currentWordIndex}
                totalWords={rsvpPlayer.totalWords}
                onSeek={rsvpPlayer.seekToWord}
              />
              <div className="controls-row">
                <WPMControl wpm={rsvpWpm} onWpmChange={setRsvpWpm} />
                <PlayPauseButton />
              </div>
            </>
          ) : (
            <>
              <ScrubBar duration={duration} onSeek={seekTo} />
              <div className="controls-row">
                <SentenceReplay onReplaySentence={handleReplaySentence} />
                <PlayPauseButton />
                <div style={{ width: "44px" }} /> {/* spacer for balance */}
              </div>
            </>
          )}
        </div>

        {showSettings && (
          <div className="settings-panel">
            {isRSVP ? (
              <WPMControl wpm={rsvpWpm} onWpmChange={setRsvpWpm} />
            ) : (
              <SpeedControl />
            )}
          </div>
        )}

        <ParagraphView text={chapter.raw_text ?? ""} />
        <ConfusionFlag />
        <CheckpointCard />
      </div>

      <style jsx>{`
        .progress-bar-track {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          z-index: 60;
          background: transparent;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--accent);
          transition: width 300ms linear;
          border-radius: 0 2px 2px 0;
        }
        .reader {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-reader);
        }
        .reader-content {
          flex: 1;
          padding: 72px 16px 180px;
          overflow-y: auto;
        }
        .page-container {
          max-width: 720px;
          margin: 0 auto;
          background: #FAF8F3;
          border-radius: 4px;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.04),
            inset 0 0 0 1px rgba(0, 0, 0, 0.03);
          min-height: 60vh;
          position: relative;
        }
        /* Page edge effect */
        .page-container::before,
        .page-container::after {
          content: "";
          position: absolute;
          top: 8px;
          bottom: 8px;
          width: 12px;
          pointer-events: none;
        }
        .page-container::before {
          left: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.02), transparent);
          border-radius: 4px 0 0 4px;
        }
        .page-container::after {
          right: 0;
          background: linear-gradient(to left, rgba(0,0,0,0.02), transparent);
          border-radius: 0 4px 4px 0;
        }
        .controls {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 30;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-subtle);
          padding: 12px 0 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 0 16px;
        }
        .settings-panel {
          position: fixed;
          bottom: 140px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 35;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          width: 320px;
          animation: slide-up 200ms ease;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Dark mode page */
        :global(.dark) .page-container {
          background: #2A2520;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(0, 0, 0, 0.15),
            inset 0 0 0 1px rgba(255, 255, 255, 0.04);
        }
        :global(.dark) .page-container::before {
          background: linear-gradient(to right, rgba(0,0,0,0.06), transparent);
        }
        :global(.dark) .page-container::after {
          background: linear-gradient(to left, rgba(0,0,0,0.06), transparent);
        }
      `}</style>
    </>
  );
}
