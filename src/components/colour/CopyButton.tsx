import { useEffect, useRef, useState } from 'react';

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setStatus('idle'), 1800);
  };
  return (
    <button
      type="button"
      className="copy"
      onClick={copy}
      aria-live="polite"
      aria-label={
        status === 'copied'
          ? 'Copied to clipboard'
          : status === 'failed'
            ? 'Copy failed. Try again.'
            : label.startsWith('Copy')
              ? label
              : `Copy ${label}`
      }
    >
      {status === 'copied' ? 'Copied' : status === 'failed' ? 'Try again' : label}
    </button>
  );
}
