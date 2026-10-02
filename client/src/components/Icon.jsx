const PATHS = {
  shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zm-3 9l2 2 4-4",
  truck: "M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z",
  wallet: "M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 0l13-3v3m3 6h2",
  refresh: "M20 11a8 8 0 00-14-4L4 9m0-5v5h5M4 13a8 8 0 0014 4l2-2m0 5v-5h-5",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.3-4.3",
  arrow: "M5 12h14m-6-6l6 6-6 6",
  tag: "M3 12V4h8l10 10-8 8L3 12zm5-4h.01",
  heart: "M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0",
  cart: "M3 4h2l2.4 11h10.2L20 8H6M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z",
  menu: "M4 6h16M4 12h16M4 18h16",
  pin: "M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11zm0-8a3 3 0 100-6 3 3 0 000 6z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zm0-14v5l3 2",
};

export default function Icon({ name, className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
