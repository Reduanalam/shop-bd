import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk } from "../redux/slices/productSlice.js";
import { fetchProducts } from "../services/productService.js";
import { fetchSettings } from "../services/settingService.js";
import ProductCard from "../components/ProductCard.jsx";
import OfferProductCard from "../components/OfferProductCard.jsx";
import HeroSlider from "../components/HeroSlider.jsx";
import CategoryStrip from "../components/CategoryStrip.jsx";
import PromoBanners from "../components/PromoBanners.jsx";
import FeatureCards from "../components/FeatureCards.jsx";
import FlashCountdown from "../components/FlashCountdown.jsx";
import LiveActivityTicker from "../components/LiveActivityTicker.jsx";
import Icon from "../components/Icon.jsx";

export default function Home() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.products);
  const [tab, setTab] = useState("all");
  const [trending, setTrending] = useState([]);
  const [offers, setOffers] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    dispatch(fetchProductsThunk({ limit: 12 }));
    fetchProducts({ section: "trending", limit: 8 }).then((res) => setTrending(res.data || [])).catch(() => {});
    fetchProducts({ section: "offers", limit: 8 }).then((res) => setOffers(res.data || [])).catch(() => {});
    fetchSettings().then((res) => setSettings(res.data || res)).catch(() => {});
  }, [dispatch]);

  const sections = settings?.sections || {};

  const tabs = useMemo(() => {
    const seen = new Map();
    list.forEach((p) => p.category?._id && seen.set(p.category._id, p.category.name));
    return [["all", "All"], ...seen.entries()];
  }, [list]);

  const popular = tab === "all" ? list : list.filter((p) => p.category?._id === tab);

  return (
    <div>
      <HeroSlider />
      {sections.categories !== false && <CategoryStrip />}
      <PromoBanners />

      {sections.trending !== false && trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="tag" className="w-5 h-5 text-primary-600" /> Trending Products
            </h2>
            <Link to="/products?sort=rating" className="text-primary-600 text-sm font-medium">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trending.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {sections.offers !== false && offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold">Deals You Can't Miss</h2>
              {settings?.flashSale?.enabled && settings.flashSale.endsAt && (
                <FlashCountdown endsAt={settings.flashSale.endsAt} />
              )}
            </div>
            <Link to="/products?sort=price_asc" className="text-primary-600 text-sm font-medium">View all deals →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {offers.map((p) => (
              <OfferProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <FeatureCards />

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Popular Products</h2>
          <div className="flex flex-wrap gap-2">
            {tabs.map(([id, name]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-pressed={tab === id}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === id ? "bg-primary-600 text-white" : "bg-white text-gray-600 ring-1 ring-black/10 hover:bg-primary-50"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : popular.length === 0 ? (
          <p className="text-gray-500">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popular.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary-800 text-white pl-6 pr-28 py-8 sm:pl-10 sm:pr-36 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Daily deals, every day</h2>
            <p className="text-white/75 text-sm mt-1">Save more on the products you love.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-50">
            View deals <Icon name="arrow" className="w-4 h-4" />
          </Link>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 grid h-24 w-24 place-items-center rounded-full bg-accent-500 text-center font-bold leading-tight rotate-12">
            <span className="text-xs">Up to<br /><span className="text-xl">50%</span><br />off</span>
          </span>
        </div>
      </section>

      <LiveActivityTicker products={list} />
    </div>
  );
}
