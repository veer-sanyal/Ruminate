"use client";

import { useEffect } from "react";
import { useReaderStore } from "@/stores/readerStore";

export default function CheckpointCard() {
  const { checkpointPending, rateCheckpoint } = useReaderStore();

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!checkpointPending) return;
    const timer = setTimeout(() => {
      rateCheckpoint("got_it");
    }, 5000);
    return () => clearTimeout(timer);
  }, [checkpointPending, rateCheckpoint]);

  if (!checkpointPending) return null;

  return (
    <>
      <div className="checkpoint-card">
        <p className="checkpoint-title">How are you feeling?</p>
        <div className="checkpoint-buttons">
          <button
            className="cp-btn cp-got-it"
            onClick={() => rateCheckpoint("got_it")}
          >
            Got it
          </button>
          <button
            className="cp-btn cp-kinda"
            onClick={() => rateCheckpoint("kinda")}
          >
            Kinda
          </button>
          <button
            className="cp-btn cp-lost"
            onClick={() => rateCheckpoint("lost")}
          >
            Lost
          </button>
        </div>
      </div>

      <style jsx>{`
        .checkpoint-card {
          position: fixed;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 60;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          animation: slide-up 300ms ease;
          text-align: center;
        }
        .checkpoint-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 14px;
        }
        .checkpoint-buttons {
          display: flex;
          gap: 10px;
        }
        .cp-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: transform 100ms ease;
        }
        .cp-btn:hover {
          transform: scale(1.03);
        }
        .cp-got-it {
          background: var(--success);
          color: white;
        }
        .cp-kinda {
          background: var(--warning);
          color: white;
        }
        .cp-lost {
          background: var(--error);
          color: white;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
