import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon.jsx";

const DISTRICTS = ["ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "কুমিল্লা", "রংপুর"];
const FIRST_NAMES = ["রাহাত", "তানভীর", "সুমাইয়া", "নাফিসা", "আরিফ", "মেহজাবিন", "সাকিব", "তাসনিম"];

// Decorative only — not wired to real orders. Cycles a plausible-looking
// "recent purchase" message using real product names but a randomized
// name/district/time, purely for the store's ambient "busy shop" feel.
export default function LiveActivityTicker({ products = [] }) {
  const [visible, setVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  const pool = useMemo(() => {
    if (products.length === 0) return [];
    return Array.from({ length: 10 }, () => {
      const product = products[Math.floor(Math.random() * products.length)];
      const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
      const minsAgo = Math.floor(Math.random() * 40) + 1;
      return { product, name, district, minsAgo };
    });
  }, [products]);

  useEffect(() => {
    if (pool.length === 0) return;
    let i = 0;
    const showNext = () => {
      setMsgIndex(i % pool.length);
      setVisible(true);
      i += 1;
    };
    showNext();
    const cycle = setInterval(showNext, 7000);
    return () => clearInterval(cycle);
  }, [pool.length]);

  if (pool.length === 0 || !visible) return null;
  const m = pool[msgIndex];

  return (
    <div
      key={msgIndex}
      className="fixed bottom-4 left-4 z-30 hidden sm:flex items-center gap-3 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 px-4 py-3 max-w-xs"
      style={{ animation: "ticker-in 7s ease-in-out both" }}
    >
      <img src={m.product.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
      <div className="text-xs leading-snug">
        <p className="font-semibold text-ink flex items-center gap-1">
          <Icon name="cart" className="w-3.5 h-3.5 text-primary-600" />
          {m.name} ({m.district}) কিনেছেন
        </p>
        <p className="text-gray-500 line-clamp-1">{m.product.title}</p>
        <p className="text-gray-400">{m.minsAgo} মিনিট আগে</p>
      </div>
    </div>
  );
}
