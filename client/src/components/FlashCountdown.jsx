import { useEffect, useState } from "react";

function diff(endsAt) {
  const s = Math.max(0, Math.floor((new Date(endsAt) - new Date()) / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

export default function FlashCountdown({ endsAt }) {
  const [t, setT] = useState(() => diff(endsAt));
  useEffect(() => {
    const id = setInterval(() => setT(diff(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const [d, h, m, s] = t;
  const units = d > 0 ? [[d, "d"], [h, "h"], [m, "m"], [s, "s"]] : [[h, "h"], [m, "m"], [s, "s"]];

  return (
    <span className="flex items-center gap-1" role="timer" aria-label="Time left">
      {units.map(([n, label], i) => (
        <span key={i} className="grid place-items-center rounded-md bg-primary-700 px-1.5 h-7 text-xs font-bold text-white tabular-nums">
          {String(n).padStart(2, "0")}{label}
        </span>
      ))}
    </span>
  );
}
