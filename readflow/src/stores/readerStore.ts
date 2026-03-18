import { create } from "zustand";

export type ReaderMode = "narration" | "rsvp";

interface ConfusionFlag {
  wordIndex: number;
  timestamp: number;
}

interface CheckpointRating {
  rating: "got_it" | "kinda" | "lost";
  wordIndex: number;
  timestamp: number;
}

interface ReaderState {
  // Playback
  isPlaying: boolean;
  currentWordIndex: number;
  currentSentenceIndex: number;
  playbackPosition: number; // ms for audio, word index for RSVP

  // Settings
  speed: number;
  mode: ReaderMode;

  // Paragraph view
  showParagraphView: boolean;
  paragraphViewWordIndex: number;

  // Checkpoints
  checkpointPending: boolean;
  checkpointRatings: CheckpointRating[];

  // Confusion
  confusionFlags: ConfusionFlag[];

  // Session
  sessionStartTime: number | null;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (position: number) => void;
  setCurrentWordIndex: (index: number) => void;
  setCurrentSentenceIndex: (index: number) => void;
  setSpeed: (speed: number) => void;
  setMode: (mode: ReaderMode) => void;
  setShowParagraphView: (show: boolean, wordIndex?: number) => void;
  flagConfusion: (wordIndex: number) => void;
  triggerCheckpoint: () => void;
  rateCheckpoint: (rating: "got_it" | "kinda" | "lost") => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  currentWordIndex: 0,
  currentSentenceIndex: 0,
  playbackPosition: 0,
  speed: 1.0,
  mode: "narration" as ReaderMode,
  showParagraphView: false,
  paragraphViewWordIndex: 0,
  checkpointPending: false,
  checkpointRatings: [] as CheckpointRating[],
  confusionFlags: [] as ConfusionFlag[],
  sessionStartTime: null as number | null,
};

export const useReaderStore = create<ReaderState>((set, get) => ({
  ...initialState,

  play: () =>
    set({
      isPlaying: true,
      sessionStartTime: get().sessionStartTime ?? Date.now(),
    }),

  pause: () => set({ isPlaying: false }),

  togglePlayPause: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  seek: (position) => set({ playbackPosition: position }),

  setCurrentWordIndex: (index) => set({ currentWordIndex: index }),

  setCurrentSentenceIndex: (index) => set({ currentSentenceIndex: index }),

  setSpeed: (speed) => set({ speed: Math.max(0.75, Math.min(2.5, speed)) }),

  setMode: (mode) => set({ mode }),

  setShowParagraphView: (show, wordIndex) =>
    set({
      showParagraphView: show,
      paragraphViewWordIndex: wordIndex ?? get().paragraphViewWordIndex,
    }),

  flagConfusion: (wordIndex) =>
    set((state) => ({
      confusionFlags: [
        ...state.confusionFlags,
        { wordIndex, timestamp: Date.now() },
      ],
    })),

  triggerCheckpoint: () => set({ checkpointPending: true }),

  rateCheckpoint: (rating) =>
    set((state) => {
      const newSpeed =
        rating === "lost" ? Math.max(0.75, state.speed - 0.1) : state.speed;
      return {
        checkpointPending: false,
        speed: newSpeed,
        checkpointRatings: [
          ...state.checkpointRatings,
          {
            rating,
            wordIndex: state.currentWordIndex,
            timestamp: Date.now(),
          },
        ],
      };
    }),

  reset: () => set(initialState),
}));
