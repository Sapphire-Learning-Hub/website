type IconProps = {
  /** Defaults to 1em so icons track the surrounding font size. */
  size?: string | number;
  className?: string;
};

function SvgBase({
  children,
  filled = false,
  size = "1em",
  className,
}: IconProps & { children: React.ReactNode; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className ? `icon ${className}` : "icon"}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={2.4}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M6.5 17.5 17 7" />
      <path d="M8.5 6.5H17.5V15.5" />
    </SvgBase>
  );
}

export function ArrowDownRight(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M6.5 6.5 17 17" />
      <path d="M17.5 8.5V17.5H8.5" />
    </SvgBase>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M20 12H5" />
      <path d="m10.5 6-6 6 6 6" />
    </SvgBase>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M4 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </SvgBase>
  );
}

export function Check(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M4 12.5 9.5 18 20 6" />
    </SvgBase>
  );
}

export function Star(props: IconProps) {
  return (
    <SvgBase {...props} filled>
      <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9Z" />
    </SvgBase>
  );
}

export function GitFork(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="6" cy="5.5" r="2.5" />
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="12" cy="18.5" r="2.5" />
      <path d="M6 8v1.5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
      <path d="M12 11.5V16" />
    </SvgBase>
  );
}
