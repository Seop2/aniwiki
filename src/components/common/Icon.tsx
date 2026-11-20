import type { ReactNode } from "react";

export default function Icon({
  size = 14,
  strokeWidth = 2,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  children: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden
    >
      {children}
    </svg>
  );
}
