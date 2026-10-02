import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import { fetchBanners } from "../services/settingService.js";

const FALLBACK_SLIDES = [
  {
    title: "সেরা দামে\nসেরা প্রোডাক্ট,\nআপনার দোরগোড়ায়",
    subtitle: "Fashion, Electronics, Beauty, Home — সব এক জায়গায়। মানে ভরসা, দামে সাশ্রয়।",
    tag: "Shop smart, live better",
    image: "/images/hero1.webp",
    video: "", // video URL thakle ekhane diben (.mp4)
    link: "/products",
  },
  {
    title: "নতুন Collection\nএসেছে, দেখে নিন\nপ্রিয় ব্র্যান্ড",
    subtitle: "সীমিত সময়ের জন্য বিশেষ ছাড়ে কিনুন আপনার পছন্দের বিউটি ও লাইফস্টাইল প্রোডাক্ট।",
    tag: "New season, new you",
    image: "/images/hero2.webp",
    video: "",
    link: "/products",
  },
  {
    title: "ক্যাশ অন ডেলিভারি,\nসারা বাংলাদেশে\nনিশ্চিন্তে কিনুন",
    subtitle: "হাতে পেয়ে টাকা দিন, অথবা bKash / Nagad-এ পেমেন্ট করুন — যেটা সুবিধা।",
    tag: "Pay when it arrives",
    image: "/images/hero3.webp",
    video: "",
    link: "/products",
  },
];

const TRUST = [
  { icon: "shield", title: "Genuine products", sub: "Checked before dispatch" },
  { icon: "truck", title: "Fast delivery", sub: "All over Bangladesh" },
  { icon: "wallet", title: "COD, bKash, Nagad", sub: "Pay your way" },
  { icon: "refresh", title: "Easy returns", sub: "7-day return window" },
];

const AUTOPLAY_MS = 4000; // Video er jonne time standard 4s kora hoyeche

function normalize(banner) {
  const title = [banner.title, banner.highlight].filter(Boolean).join("\n");
  return {
    title,
    subtitle: banner.subtitle || "",
    tag: banner.tag || "",
    image: banner.image || "",
    video: banner.video || "", // API theke video field support
    link: banner.link || "/products",
    buttonText: banner.buttonText || "Shop Now",
  };
}

// Utility Function: Check link/path is video
function isVideoUrl(url) {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i);
}

export default function HeroSlider() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [index, setIndex] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const navigate = useNavigate();
  const touchStartX = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetchBanners()
      .then((res) => {
        const banners = Array.isArray(res) ? res : res.data || [];
        if (banners.length > 0) setSlides(banners.map(normalize));
      })
      .catch(() => {});
  }, []);

  // Autoplay and video handling
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
      setProgressKey((k) => k + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  // Video play/pause handling on slide change
  useEffect(() => {
    videoRefs.current.forEach((videoEl, i) => {
      if (videoEl) {
        if (i === index) {
          videoEl.currentTime = 0;
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      }
    });
  }, [index]);

  const goTo = (i) => {
    setIndex((i + slides.length) % slides.length);
    setProgressKey((k) => k + 1);
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) goTo(index + (delta < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  const slide = slides[index];

  const onSearch = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/products?keyword=${encodeURIComponent(keyword.trim())}` : "/products");
  };

  const titleLines = slide.title.split("\n");

  return (
    <section
      className="max-w-7xl mx-auto px-4 pt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e6f1dc] via-[#f2f7e9] to-[#fbf6e8] border border-primary-100 shadow-xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] items-center gap-6 p-6 sm:p-10 lg:p-12">
          {/* Left Text & Search */}
          <div className="min-w-0 relative" style={{ minHeight: "1px" }}>
            <div key={index} className="transition-all duration-500 ease-out animate-fadeIn">
              <p className="flex items-center gap-2 text-xs sm:text-sm font-medium text-primary-600">
                <span>Fashion</span><span className="w-1 h-1 rounded-full bg-primary-500" />
                <span>Electronics</span><span className="w-1 h-1 rounded-full bg-primary-500" />
                <span>Home &amp; Beauty</span>
              </p>

              <h1 className="mt-3 text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.15] text-ink">
                {titleLines.map((line, i) => (
                  <span key={i} className={i === titleLines.length - 1 ? "text-primary-600" : ""}>
                    {line}
                    {i < titleLines.length - 1 && <br />}
                  </span>
                ))}
              </h1>

              {slide.subtitle && <p className="mt-4 max-w-md text-gray-600 leading-relaxed text-sm sm:text-base">{slide.subtitle}</p>}

              <form onSubmit={onSearch} className="mt-6 flex max-w-lg items-center gap-2 rounded-2xl bg-white p-1.5 shadow-md ring-1 ring-black/5 hover:shadow-lg transition-shadow duration-300">
                <Icon name="search" className="w-5 h-5 ml-3 text-gray-400 shrink-0" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="flex-1 min-w-0 bg-transparent px-1 py-2 text-sm outline-none"
                />
                <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md shadow-primary-600/20">
                  {slide.buttonText || "Shop Now"} <Icon name="arrow" className="w-4 h-4" />
                </button>
              </form>
            </div>

            <ul className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {TRUST.map((t) => (
                <li key={t.title} className="flex items-start gap-2.5 group">
                  <span className="mt-0.5 text-primary-600 transition-transform duration-300 group-hover:scale-110"><Icon name={t.icon} className="w-6 h-6" /></span>
                  <span className="text-xs leading-snug">
                    <b className="block text-ink font-semibold">{t.title}</b>
                    <span className="text-gray-500">{t.sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Media Display (Video + Image Support) */}
          <div className="relative min-w-0">
            {slide.tag && (
              <span className="absolute -top-1 right-2 sm:right-8 z-10 rotate-3 font-script text-xl sm:text-3xl text-primary-700 drop-shadow-sm">
                {slide.tag}
              </span>
            )}
            
            {/* Smooth Display Container */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] rounded-tr-[5rem] shadow-2xl ring-8 ring-white/80 mt-6 bg-gray-100">
              {slides.map((s, i) => {
                const hasVideo = Boolean(s.video) || isVideoUrl(s.image);
                const videoSrc = s.video || s.image;

                return (
                  <div
                    key={i}
                    className={`absolute inset-0 h-full w-full transition-all duration-700 ease-in-out ${
                      i === index ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                    }`}
                  >
                    {hasVideo ? (
                      <video
                        ref={(el) => (videoRefs.current[i] = el)}
                        src={videoSrc}
                        muted
                        loop
                        playsInline
                        poster={s.image}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={s.image}
                        alt=""
                        loading={i === 0 ? "eager" : "lazy"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="float-y absolute -left-2 sm:-left-6 bottom-8 flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl border border-white/40 transition-transform duration-300 hover:scale-105 z-10">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-500 text-white shadow-md"><Icon name="tag" /></span>
              <span className="text-sm leading-tight"><b className="block font-semibold">Up to 30% off</b><span className="text-gray-500 text-xs">on selected items</span></span>
            </div>

            {/* Slider Navigation Dots */}
            <div className="mt-5 flex items-center justify-center lg:justify-end gap-2.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index}
                  className={`relative h-2 rounded-full overflow-hidden transition-all duration-500 ${
                    i === index ? "w-8 bg-primary-600/30" : "w-2.5 bg-primary-600/20 hover:bg-primary-600/40"
                  }`}
                >
                  {i === index && (
                    <span
                      key={progressKey}
                      className="absolute inset-y-0 left-0 bg-primary-600 rounded-full hero-progress"
                      style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}