import { useRef, useState, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export default function SortDropdown({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const currentLabel = options.find((o) => o.value === value)?.label ?? 'Sort';

  return (
    <div className={`ms-dropdown ms-dropdown--sort ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button className="ms-dropdown__trigger" onClick={() => setOpen((v) => !v)}>
        <span>↕ {currentLabel}</span>
        <span className="ms-dropdown__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown__menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`ms-dropdown__option ${value === opt.value ? 'ms-dropdown__option--selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className="ms-dropdown__checkbox">{value === opt.value ? '✓' : ''}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
