type Props = {
  className?: string;
  /** Icon size in pixels (default 24). */
  size?: number;
};

/**
 * Floor Plan AI logo (house icon). Use for navbar, visualizer topbar, etc.
 * Matches the favicon shape for consistency.
 */
export default function Logo({ className = "", size = 24 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden
    >
      <path d="M4 14L16 4l12 10v14H4z" />
      <path d="M12 32V18h8v14" />
    </svg>
  );
}
