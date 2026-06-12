export default function RockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Large mountain peak (right) */}
      <polygon points="13,5 23,19 3,19" />
      {/* Small mountain peak (left, slightly tilted) */}
      <polygon points="4,10 9,19 1,19" />
    </svg>
  );
}
