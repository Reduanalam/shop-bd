import Icon from "./Icon.jsx";

// Each card looks like the thing it promises: a parcel label, a payment chip pair,
// a tear-off calendar, and a delivery route.
export default function FeatureCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-xl font-bold mb-5">Why shop with ShopBD</h2>
      <div className="grid gap-4 md:grid-cols-6">
        {/* Cash on delivery — shipping label */}
        <article className="md:col-span-3 relative overflow-hidden rounded-3xl bg-primary-800 text-white p-6 min-h-[180px]">
          <div className="absolute right-5 top-5 rotate-[-8deg] rounded-md border-2 border-dashed border-white/50 px-3 py-1 text-sm font-bold tracking-wide">
            COD ✓
          </div>
          <h3 className="text-2xl font-bold max-w-[16ch] leading-tight">দেখে নিন, তারপর টাকা দিন</h3>
          <p className="mt-2 text-white/75 max-w-sm text-sm">Cash on delivery সারা বাংলাদেশে। প্রোডাক্ট হাতে পেয়ে পেমেন্ট করুন।</p>
          <div className="mt-5 flex items-center gap-3 text-xs text-white/70">
            <span className="h-px flex-1 border-t border-dashed border-white/30" />
            <span>ORDER · PACK · PAY AT DOOR</span>
          </div>
        </article>

        {/* bKash / Nagad — payment chips */}
        <article className="md:col-span-3 rounded-[2.5rem] rounded-bl-md bg-[#fdf1e6] p-6">
          <h3 className="text-xl font-bold">Mobile payment, সহজে</h3>
          <p className="mt-1 text-sm text-gray-600 max-w-sm">Send money, submit your transaction ID, and we verify it.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#e2136e] px-5 py-2 text-white font-bold shadow-sm">bKash</span>
            <span className="-ml-6 rounded-full bg-[#f6821f] px-5 py-2 text-white font-bold shadow-sm ring-4 ring-[#fdf1e6]">Nagad</span>
            <span className="text-xs text-gray-500">Verified by our team</span>
          </div>
        </article>

        {/* Returns — tear-off calendar */}
        <article className="md:col-span-2 rounded-3xl bg-white border border-primary-100 p-6 flex items-center gap-4">
          <div className="w-20 shrink-0 overflow-hidden rounded-xl border border-primary-100 text-center shadow-sm">
            <div className="bg-accent-500 text-white text-[10px] font-semibold py-0.5">RETURN</div>
            <div className="text-4xl font-bold leading-none pt-2 text-ink">7</div>
            <div className="text-[11px] text-gray-500 pb-2">days</div>
          </div>
          <div>
            <h3 className="font-bold">Easy returns</h3>
            <p className="text-sm text-gray-600 mt-1">Not right? Return it within 7 days.</p>
          </div>
        </article>

        {/* Delivery — route */}
        <article className="md:col-span-4 rounded-3xl bg-gradient-to-r from-primary-50 to-[#fbf6e8] p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Icon name="truck" className="w-5 h-5 text-primary-600" />Delivery across Bangladesh</h3>
              <p className="text-sm text-gray-600 mt-1">Dhaka fast, districts on time.</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span><b className="text-primary-700 text-lg">1–2</b> days<br /><span className="text-xs text-gray-500">Dhaka</span></span>
              <span><b className="text-primary-700 text-lg">3–5</b> days<br /><span className="text-xs text-gray-500">Outside Dhaka</span></span>
            </div>
          </div>
          <div className="mt-5 flex items-center" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-primary-600" />
            <span className="h-0 flex-1 border-t-2 border-dashed border-primary-500/50" />
            <span className="mx-1 text-primary-600"><Icon name="truck" className="w-5 h-5" /></span>
            <span className="h-0 flex-1 border-t-2 border-dashed border-primary-500/50" />
            <span className="h-3 w-3 rounded-full ring-2 ring-primary-600 bg-white" />
          </div>
        </article>
      </div>
    </section>
  );
}
