import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

export default function PromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-8 grid gap-4 md:grid-cols-3">
      <Link to="/products?sort=price_asc" className="rounded-2xl bg-gradient-to-br from-[#d8ecc6] to-[#eef6d9] p-6 min-h-[140px] flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold">Best prices</h3>
          <p className="text-2xl font-bold text-primary-700">Up to 30% off</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700">Shop deals <Icon name="arrow" className="w-4 h-4" /></span>
      </Link>
      <Link to="/products" className="rounded-2xl bg-gradient-to-br from-accent-500 to-[#f9a24d] text-white p-6 min-h-[140px] flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold">Daily essentials</h3>
          <p className="text-white/90 text-sm">Everyday picks at better prices.</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold">Shop now <Icon name="arrow" className="w-4 h-4" /></span>
      </Link>
      <Link to="/products" className="rounded-2xl bg-primary-800 text-white p-6 min-h-[140px] flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold">New arrivals</h3>
          <p className="text-white/80 text-sm">Fresh stock added every week.</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold">Explore <Icon name="arrow" className="w-4 h-4" /></span>
      </Link>
    </section>
  );
}
