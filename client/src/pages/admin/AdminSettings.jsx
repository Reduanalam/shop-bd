import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminFetchSettings, adminUpdateSettings } from "../../services/adminService.js";

const SECTION_LABELS = {
  categories: "Shop by Category",
  trending: "Trending Products",
  offers: "Deals You Can't Miss",
  spin: "Spin & Win widget",
  liveActivity: "Live activity ticker",
};

export default function AdminSettings() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetchSettings().then((res) => setS(res.data));
  }, []);

  if (!s) return <p>Loading…</p>;

  const save = async (patch) => {
    setSaving(true);
    try {
      const res = await adminUpdateSettings(patch);
      setS(res.data);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const field = (path, value) => {
    const [group, key] = path.split(".");
    setS({ ...s, [group]: { ...s[group], [key]: value } });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold">Site Settings</h1>

      <section className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-3">Announcement Bar</h2>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input type="checkbox" checked={s.announcement.enabled} onChange={(e) => field("announcement.enabled", e.target.checked)} />
          Enabled
        </label>
        <input
          className="border rounded-lg px-3 py-2 w-full"
          value={s.announcement.text}
          onChange={(e) => field("announcement.text", e.target.value)}
        />
        <button disabled={saving} onClick={() => save({ announcement: s.announcement })} className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
          Save
        </button>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-3">Flash Sale Countdown</h2>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input type="checkbox" checked={s.flashSale.enabled} onChange={(e) => field("flashSale.enabled", e.target.checked)} />
          Enabled
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Title"
            className="border rounded-lg px-3 py-2"
            value={s.flashSale.title}
            onChange={(e) => field("flashSale.title", e.target.value)}
          />
          <input
            type="datetime-local"
            className="border rounded-lg px-3 py-2"
            value={s.flashSale.endsAt ? new Date(s.flashSale.endsAt).toISOString().slice(0, 16) : ""}
            onChange={(e) => field("flashSale.endsAt", new Date(e.target.value).toISOString())}
          />
        </div>
        <button disabled={saving} onClick={() => save({ flashSale: s.flashSale })} className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
          Save
        </button>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-3">Delivery Fees</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <label>Dhaka fee (৳)
            <input type="number" className="border rounded-lg px-3 py-2 w-full mt-1"
              value={s.delivery.dhakaFee} onChange={(e) => field("delivery.dhakaFee", Number(e.target.value))} />
          </label>
          <label>Outside Dhaka fee (৳)
            <input type="number" className="border rounded-lg px-3 py-2 w-full mt-1"
              value={s.delivery.outsideFee} onChange={(e) => field("delivery.outsideFee", Number(e.target.value))} />
          </label>
          <label>Free delivery above (৳)
            <input type="number" className="border rounded-lg px-3 py-2 w-full mt-1"
              value={s.delivery.freeAbove} onChange={(e) => field("delivery.freeAbove", Number(e.target.value))} />
          </label>
        </div>
        <button disabled={saving} onClick={() => save({ delivery: s.delivery })} className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
          Save
        </button>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-3">Loyalty Coins</h2>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input type="checkbox" checked={s.coins.enabled} onChange={(e) => field("coins.enabled", e.target.checked)} />
          Enabled
        </label>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <label>Earn per ৳100
            <input type="number" className="border rounded-lg px-3 py-2 w-full mt-1"
              value={s.coins.earnPer100} onChange={(e) => field("coins.earnPer100", Number(e.target.value))} />
          </label>
          <label>৳ per coin
            <input type="number" className="border rounded-lg px-3 py-2 w-full mt-1"
              value={s.coins.redeemRate} onChange={(e) => field("coins.redeemRate", Number(e.target.value))} />
          </label>
          <label>Max % of order
            <input type="number" className="border rounded-lg px-3 py-2 w-full mt-1"
              value={s.coins.maxRedeemPercent} onChange={(e) => field("coins.maxRedeemPercent", Number(e.target.value))} />
          </label>
        </div>
        <button disabled={saving} onClick={() => save({ coins: s.coins })} className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
          Save
        </button>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-3">Homepage Sections</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {Object.entries(SECTION_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.sections[key] !== false}
                onChange={(e) => field(`sections.${key}`, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
        <button disabled={saving} onClick={() => save({ sections: s.sections })} className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
          Save
        </button>
      </section>
    </div>
  );
}
