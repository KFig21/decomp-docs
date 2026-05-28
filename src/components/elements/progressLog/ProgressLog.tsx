import { useEffect, useRef } from 'react';
import './styles.scss';

type Props = {
  logs: string[];
};

export default function ProgressLog({ logs }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom when new logs are added
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="progress-log-wrapper">
      <div className="terminal-header">
        <div className="dot red" />
        <div className="dot yellow" />
        <div className="dot green" />
        <span className="title">Parser Log</span>
      </div>
      <div className="terminal-body">
        {logs.map((log, index) => (
          <div key={index} className="log-line">
            <span className="prompt">{'>'}</span> {log}
          </div>
        ))}
        {/* Invisible div to scroll to */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
