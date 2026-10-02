import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchSpinStatus, spinWheelApi } from "../services/settingService.js";
import Icon from "./Icon.jsx";

const SLICE_COLORS = ["#1f7a3a", "#2f8f46", "#175f2e", "#2f8f46", "#1f7a3a", "#175f2e"];

export default function SpinWheel() {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (!open || !userInfo) return;
    fetchSpinStatus()
      .then((res) => setStatus(res.data))
      .catch(() => setStatus(null));
  }, [open, userInfo]);

  const openWidget = () => {
    if (!userInfo) {
      navigate("/login?redirect=/");
      return;
    }
    setResult(null);
    setOpen(true);
  };

  const prizes = status?.prizes || [];
  const sliceAngle = prizes.length ? 360 / prizes.length : 60;

  const handleSpin = async () => {
    if (spinning || !status?.canSpin) return;
    setSpinning(true);
    try {
      const res = await spinWheelApi();
      const { prizeIndex, label, coupon } = res.data;
      const targetSliceCenter = prizeIndex * sliceAngle + sliceAngle / 2;
      // Land the pointer (fixed at top, 0deg) on the winning slice, plus a few full turns.
      const finalRotation = rotation + 360 * 5 + (360 - targetSliceCenter);
      setRotation(finalRotation);
      setTimeout(() => {
        setSpinning(false);
        setResult({ label, coupon });
        setStatus((s) => ({ ...s, canSpin: false }));
        if (coupon) toast.success(`You won ${label}! Code: ${coupon.code}`);
      }, 4200);
    } catch (err) {
      setSpinning(false);
      toast.error(err.response?.data?.message || "Could not spin right now");
    }
  };

  return (
    <>
      <button
        onClick={openWidget}
        className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-accent-500 hover:bg-accent-600 text-white shadow-lg px-4 py-3 text-sm font-semibold"
      >
        <Icon name="tag" className="w-5 h-5" /> Spin &amp; Win
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !spinning && setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !spinning && setOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-1">Daily Lucky Spin</h3>
            <p className="text-sm text-gray-500 mb-4">প্রতিদিন একবার স্পিন করে জিতুন ডিসকাউন্ট ভাউচার!</p>

            {!status ? (
              <p className="py-10 text-gray-400 text-sm">Loading…</p>
            ) : !status.enabled ? (
              <p className="py-10 text-gray-400 text-sm">Spin &amp; Win বর্তমানে বন্ধ আছে।</p>
            ) : (
              <>
                <div className="relative mx-auto mb-5" style={{ width: 240, height: 240 }}>
                  <div
                    className="absolute left-1/2 -top-1 -translate-x-1/2 z-10"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "10px solid transparent",
                      borderRight: "10px solid transparent",
                      borderTop: "16px solid #e0670f",
                    }}
                  />
                  <div
                    ref={wheelRef}
                    className="relative rounded-full overflow-hidden shadow-inner"
                    style={{
                      width: 240,
                      height: 240,
                      transform: `rotate(${rotation}deg)`,
                      transition: spinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                      background: `conic-gradient(${prizes
                        .map((_, i) => `${SLICE_COLORS[i % SLICE_COLORS.length]} ${i * sliceAngle}deg ${(i + 1) * sliceAngle}deg`)
                        .join(", ")})`,
                    }}
                  >
                    {prizes.map((label, i) => {
                      const mid = i * sliceAngle + sliceAngle / 2;
                      return (
                        <span
                          key={i}
                          className="absolute left-1/2 top-1/2 text-[10px] font-bold text-white w-16 text-center"
                          style={{
                            transform: `rotate(${mid}deg) translate(0, -92px) rotate(0deg)`,
                            transformOrigin: "0 0",
                          }}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                  <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-primary-600">
                    <Icon name="tag" className="w-5 h-5" />
                  </div>
                </div>

                {result ? (
                  <div className="rounded-xl bg-primary-50 p-4 text-sm">
                    <p className="font-bold text-primary-700 mb-1">
                      {result.coupon ? `🎉 You won: ${result.label}` : "এবার কপাল সহায় হয়নি, আবার আগামীকাল চেষ্টা করুন!"}
                    </p>
                    {result.coupon && (
                      <p className="text-gray-600">
                        Code <b className="text-ink">{result.coupon.code}</b> — checkout-এ ব্যবহার করুন (min order ৳{result.coupon.minOrderAmount})
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleSpin}
                    disabled={spinning || !status.canSpin}
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white font-semibold rounded-xl px-6 py-2.5 w-full"
                  >
                    {spinning ? "Spinning…" : status.canSpin ? "Spin Now" : "আজকে স্পিন করা হয়ে গেছে"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
