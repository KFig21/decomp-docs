import './styles.scss';

type Props = {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
};

export default function CollapseToggle({ isOpen, onClick, className = '' }: Props) {
  return (
    <button
      type="button"
      className={`toggle ${className}`}
      onClick={onClick}
      aria-label={isOpen ? 'Collapse' : 'Expand'}
    >
      [{isOpen ? '-' : '+'}]
    </button>
  );
}
