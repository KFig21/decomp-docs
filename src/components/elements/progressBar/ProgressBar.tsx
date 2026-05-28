import './styles.scss';

type Props = {
  progress: number;
  text?: string;
};

export default function ProgressBar({ progress, text }: Props) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const percentText = `${Math.round(clampedProgress)}%`;

  return (
    <div className="progress-wrapper">
      <div className="progress-header">
        {text && <div className="progress-text">{text}</div>}
        <div className="progress-percentage">{percentText}</div>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${clampedProgress}%` }} />
      </div>
    </div>
  );
}
