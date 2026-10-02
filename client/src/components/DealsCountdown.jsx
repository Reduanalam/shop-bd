import { useEffect, useState } from "react";

function timeLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end - now) / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
}

export default function DealsCountdown() {
  const [t, setT] = useState(timeLeft);
  useEffect(() => {
    const id = setInterval(() => setT(timeLeft()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="flex items-center gap-1" role="timer" aria-label="Time left today">
      {t.map((n, i) => (
        <span key={i} className="grid h-7 w-8 place-items-center rounded-md bg-primary-700 text-xs font-bold text-white tabular-nums">
          {String(n).padStart(2, "0")}
        </span>
      ))}
    </span>
  );
}
