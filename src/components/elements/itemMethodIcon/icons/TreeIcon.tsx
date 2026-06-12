export default function TreeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="19" width="4" height="4" rx="0.5" />
      <polygon points="12,2 21,15 3,15" />
      <polygon points="12,9 22,21 2,21" />
    </svg>
  );
}
