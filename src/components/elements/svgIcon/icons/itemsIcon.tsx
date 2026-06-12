export const itemsIcon = {
  viewBox: '0 0 24 24',
  path: (
    // Main body + handle arch + side strap tabs + front pocket cutout
    // fillRule evenodd makes the pocket rectangle appear as a transparent hole
    <path
      fillRule="evenodd"
      d="
        M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z
        M9.5 6V4.5a2.5 2.5 0 0 1 5 0V6z
        M2 10h2v5H2z
        M20 10h2v5h-2z
        M8 15h8v5H8z
      "
    />
  ),
};
