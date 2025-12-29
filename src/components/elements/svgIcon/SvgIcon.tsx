// src/components/elements/svgIcon/SvgIcon.tsx
import './styles.scss';

type SvgIconProps = {
  height?: number;
  width?: number;
  color?: string;
  viewBox: string; // Made this more explicit
  children: React.ReactNode;
};

export default function SvgIcon({
  height = 16,
  width = 16,
  color = 'currentColor',
  viewBox,
  children,
}: SvgIconProps) {
  return (
    <div className="svg-container" style={{ width: width, height: height }}>
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
  );
}
