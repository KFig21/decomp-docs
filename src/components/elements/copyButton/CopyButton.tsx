import { useState, useEffect } from 'react';
import './styles.scss';

type Props = {
  textToCopy: string;
  label?: string;
  className?: string;
};

export default function CopyButton({ textToCopy, label = 'Copy', className = '' }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    // Reset the copied state after 2 seconds
    const timeoutId = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick events (like collapsibles)
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      className={`copy-button ${isCopied ? 'copied' : ''} ${className}`}
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {isCopied ? 'Copied!' : label}
    </button>
  );
}
