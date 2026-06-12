export default function DollarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Vertical bar */}
      <rect x="10.5" y="1" width="3" height="22" rx="1" />
      {/* S-curve */}
      <path
        d="M17 7.5 C17 5 15 4 12 4 C9 4 7 5.5 7 8 C7 10.5 9 11.5 12 12.5 C15 13.5 17 14.5 17 17 C17 19.5 15 20.5 12 20.5 C9 20.5 7 19 7 16.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
