"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export default function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}: ToggleProps) {
  return (
    <>
      <label className={`toggle-wrapper ${disabled ? "toggle-disabled" : ""}`} htmlFor={id}>
        <button
          id={id}
          role="switch"
          type="button"
          aria-checked={checked}
          disabled={disabled}
          className={`toggle-track ${checked ? "toggle-on" : ""}`}
          onClick={() => onChange(!checked)}
        >
          <span className="toggle-thumb" />
        </button>
        {label && <span className="toggle-label">{label}</span>}
      </label>

      <style jsx>{`
        .toggle-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .toggle-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .toggle-track {
          position: relative;
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: var(--bg-tertiary);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 200ms ease;
        }
        .toggle-on {
          background: var(--accent);
        }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 10px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 200ms ease;
        }
        .toggle-on .toggle-thumb {
          transform: translateX(20px);
        }
        .toggle-label {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--text-primary);
          user-select: none;
        }
      `}</style>
    </>
  );
}
