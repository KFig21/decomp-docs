// Concentric-circle bullseye representing a special (ranged) attack
// Uses evenodd fill: outer ring filled → gap → inner ring filled → center empty
export const specialCategoryIcon = {
  viewBox: '0 0 24 24',
  path: (
    <path
      fillRule="evenodd"
      // Outer circle r=10, middle circle r=6.5, inner circle r=3
      // Drawn as closed subpaths so evenodd produces alternating filled/unfilled bands:
      //   r 6.5–10 → filled (outer ring)
      //   r 3–6.5  → unfilled (gap)
      //   r 0–3    → filled (center dot)
      d={[
        'M 12 2 A 10 10 0 1 1 11.999 2 Z',
        'M 12 5.5 A 6.5 6.5 0 1 1 11.999 5.5 Z',
        'M 12 9 A 3 3 0 1 1 11.999 9 Z',
      ].join(' ')}
    />
  ),
};
