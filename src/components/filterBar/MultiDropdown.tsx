/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react';

export interface MultiDropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface Props {
  label: string;
  options: MultiDropdownOption[];
  selected: string[];
  onToggle: (v: string) => void;
  accentColor?: string;
  maxHeight?: number;
}

export default function MultiDropdown({
  label,
  options,
  selected,
  onToggle,
  accentColor,
  maxHeight,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className={`ms-dropdown ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button
        className={`ms-dropdown__trigger ${selected.length > 0 ? 'ms-dropdown__trigger--active' : ''}`}
        style={selected.length > 0 && accentColor ? ({ '--trigger-color': accentColor } as any) : {}}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        {selected.length > 0 && <span className="ms-dropdown__count">{selected.length}</span>}
        <span className="ms-dropdown__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown__menu" style={maxHeight ? { maxHeight } : {}}>
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            const color = opt.color ?? accentColor;
            return (
              <button
                key={opt.value}
                className={`ms-dropdown__option ${isSelected ? 'ms-dropdown__option--selected' : ''}`}
                style={isSelected && color ? ({ '--opt-color': color } as any) : {}}
                onClick={() => onToggle(opt.value)}
              >
                <span className="ms-dropdown__checkbox">{isSelected ? '✓' : ''}</span>
                {opt.icon && <span className="ms-dropdown__icon">{opt.icon}</span>}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
