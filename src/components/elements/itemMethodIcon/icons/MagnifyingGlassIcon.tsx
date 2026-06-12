export default function MagnifyingGlassIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        d="M10 2 A8 8 0 1 1 10 18 A8 8 0 1 1 10 2 Z M10 5.5 A4.5 4.5 0 1 1 10 14.5 A4.5 4.5 0 1 1 10 5.5 Z"
      />
      <path d="M14.5 15 L20.5 21 Q21.5 22 20.5 23 Q19.5 24 18.5 23 L12.5 17 Z" />
    </svg>
  );
}
