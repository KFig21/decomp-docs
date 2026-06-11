// Half-filled circle representing a status (non-damaging) move.
// Left half is solid; right half is an outline only.
export const statusCategoryIcon = {
  viewBox: '0 0 24 24',
  path: (
    <>
      {/* Left semicircle — always white so it's visible on the gray badge */}
      <path d="M 12 2 A 10 10 0 0 0 12 22 Z" fill="white" />
      {/* Full circle outline — always white */}
      <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.8" />
    </>
  ),
};
