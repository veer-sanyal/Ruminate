"use client";

import { useState, useRef, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Upload, FileText, AlertCircle, ICON_DEFAULTS } from "@/lib/icons";
import { useUploadBook } from "@/hooks/useUploadBook";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_TYPES = [
  "application/epub+zip",
  "application/pdf",
];
const ACCEPTED_EXTENSIONS = [".epub", ".pdf"];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: upload, isPending, progress, isSuccess } = useUploadBook();

  function validateFile(file: File): string | null {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
      return "Please upload an EPUB or PDF file.";
    }
    if (file.size > MAX_SIZE) {
      return "File must be under 100MB.";
    }
    return null;
  }

  function handleFile(file: File) {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError("");
    setSelectedFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  function handleUpload() {
    if (!selectedFile) return;
    upload(selectedFile, {
      onSuccess: () => {
        setTimeout(() => {
          onClose();
          setSelectedFile(null);
        }, 1500);
      },
    });
  }

  function handleClose() {
    if (!isPending) {
      onClose();
      setSelectedFile(null);
      setFileError("");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Upload a book">
      <>
        {!selectedFile ? (
          <div
            className={`drop-zone ${dragOver ? "drop-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
            <p className="drop-text">
              Drag & drop your file here, or click to browse
            </p>
            <p className="drop-hint">EPUB or PDF, up to 100MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".epub,.pdf"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        ) : (
          <div className="file-preview">
            <FileText {...ICON_DEFAULTS} />
            <div className="file-info">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          </div>
        )}

        {fileError && (
          <div className="error-row">
            <AlertCircle size={14} strokeWidth={1.5} />
            {fileError}
          </div>
        )}

        {isPending && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        {isSuccess && (
          <p className="success-text">Upload complete! Processing your book...</p>
        )}

        {selectedFile && !isSuccess && (
          <div className="actions">
            <Button variant="ghost" onClick={() => setSelectedFile(null)} disabled={isPending}>
              Change file
            </Button>
            <Button onClick={handleUpload} loading={isPending}>
              Upload
            </Button>
          </div>
        )}

        <style jsx>{`
          .drop-zone {
            border: 2px dashed var(--border-default);
            border-radius: 12px;
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 150ms ease;
          }
          .drop-zone:hover,
          .drop-active {
            border-color: var(--accent);
            background: var(--bg-accent-subtle);
          }
          .drop-text {
            font-size: 14px;
            color: var(--text-primary);
            text-align: center;
          }
          .drop-hint {
            font-size: 12px;
            color: var(--text-tertiary);
          }
          .file-preview {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            border-radius: 10px;
            background: var(--bg-secondary);
            color: var(--text-primary);
          }
          .file-info {
            display: flex;
            flex-direction: column;
          }
          .file-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary);
          }
          .file-size {
            font-size: 12px;
            color: var(--text-tertiary);
          }
          .error-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 12px;
            font-size: 13px;
            color: var(--error);
          }
          .progress-bar {
            height: 4px;
            border-radius: 2px;
            background: var(--bg-tertiary);
            margin-top: 16px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: var(--accent);
            transition: width 200ms ease;
            border-radius: 2px;
          }
          .success-text {
            margin-top: 12px;
            font-size: 14px;
            color: var(--success);
            text-align: center;
          }
          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 20px;
          }
        `}</style>
      </>
    </Modal>
  );
}
