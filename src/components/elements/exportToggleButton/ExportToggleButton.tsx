import './styles.scss';

type Props = {
  active: boolean;
  onToggle: () => void;
  className?: string;
};

export default function ExportToggleButton({ active, onToggle, className = '' }: Props) {
  return (
    <button
      className={`export-toggle-btn ${active ? 'export-toggle-btn--active' : ''} ${className}`.trim()}
      onClick={onToggle}
      title="Toggle Showdown export view"
    >
      {active ? 'Normal' : 'Export'}
    </button>
  );
}
