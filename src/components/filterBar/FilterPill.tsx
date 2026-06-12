/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  label: string;
  color?: string;
  onRemove: () => void;
}

export default function FilterPill({ label, color, onRemove }: Props) {
  return (
    <span className="active-pill" style={color ? ({ '--pill-color': color } as any) : {}}>
      {label}
      <button className="active-pill__close" onClick={onRemove}>
        ×
      </button>
    </span>
  );
}
