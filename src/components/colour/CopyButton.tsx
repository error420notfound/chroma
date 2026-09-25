import { useState } from 'react';

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  };
  return (
    <button className="copy" onClick={copy} aria-label={`${label}: ${value}`}>
      {copied ? 'Copied' : label}
    </button>
  );
}
