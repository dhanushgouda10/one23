/**
 * Icon — a small, consistent stroke-icon set used across the app instead
 * of emoji. Emoji render differently per-OS/browser and read as
 * "unfinished" at this size; a single-weight stroke set keeps every
 * screen visually coherent.
 *
 * Usage: <Icon name="car" size={20} />
 */
const PATHS = {
  car: (
    <>
      <path d="M4 16.5 5.6 11a2 2 0 0 1 1.9-1.4h9a2 2 0 0 1 1.9 1.4L20 16.5" />
      <rect x="3" y="16.5" width="18" height="4" rx="1.4" />
      <circle cx="7.5" cy="20.5" r="1.4" />
      <circle cx="16.5" cy="20.5" r="1.4" />
    </>
  ),
  scooter: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M6 19h8l4-9h2" />
      <path d="M14 10h-3l2-6h3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.2 12.2A4.8 4.8 0 0 1 20.5 17" />
    </>
  ),
  bolt: (
    <path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.8h-5.6L12.5 3Z" />
  ),
  bell: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </>
  ),
  chat: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9Z" />
  ),
  map: (
    <>
      <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6l-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  arrowRight: <path d="M4 12h15M13 6l6 6-6 6" />,
  arrowLeft: <path d="M20 12H5M11 6l-6 6 6 6" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  logout: (
    <>
      <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4.5" width="12" height="16" rx="1.6" />
      <path d="M9 4.5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5" />
      <path d="M9 11h6M9 15h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  close: <path d="m5 5 14 14M19 5 5 19" />,
  shield: (
    <path d="M12 3 4.5 6v6c0 4.6 3.2 7.9 7.5 9 4.3-1.1 7.5-4.4 7.5-9V6L12 3Z" />
  ),
  send: <path d="M4 12 20 4l-6.5 16-2.6-7L4 12Z" />,
  battery: (
    <>
      <rect x="2.5" y="8" width="16" height="8" rx="1.6" />
      <path d="M21.5 10.5v3" />
    </>
  ),
  wave: (
    <path d="M3 12c1.5-4 3.5-4 5 0s3.5 4 5 0 3.5-4 5 0 3.5 4 3 0" />
  ),
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.4" />
      <rect x="13" y="4" width="7" height="7" rx="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" />
      <rect x="13" y="13" width="7" height="7" rx="1.4" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />
};

function Icon({ name, size = 20, strokeWidth = 1.8, className = "", ...rest }) {
  const glyph = PATHS[name];
  if (!glyph) return null;

  return (
    <svg
      className={`icon icon--${name} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {glyph}
    </svg>
  );
}

export default Icon;
