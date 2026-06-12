interface Props {
  minBst: string;
  setMinBst: (v: string) => void;
  maxBst: string;
  setMaxBst: (v: string) => void;
}

export default function BstRange({ minBst, setMinBst, maxBst, setMaxBst }: Props) {
  return (
    <div className="bst-range">
      <span className="bst-range__label">BST</span>
      <input
        type="number"
        placeholder="Min"
        value={minBst}
        onChange={(e) => setMinBst(e.target.value)}
        className="bst-range__input"
      />
      <span className="bst-range__sep">–</span>
      <input
        type="number"
        placeholder="Max"
        value={maxBst}
        onChange={(e) => setMaxBst(e.target.value)}
        className="bst-range__input"
      />
    </div>
  );
}
