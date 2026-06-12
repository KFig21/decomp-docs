export default function GiftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" />
      <path d="M12 13c-5 0-8 2.5-8 4v1h16v-1c0-1.5-3-4-8-4z" />
    </svg>
  );
}
