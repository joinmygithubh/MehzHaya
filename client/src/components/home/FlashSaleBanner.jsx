import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiZap } from "react-icons/fi";

// Countdown to end of today
const useCountdown = () => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end - now);
      setTime({
        h: Math.floor(diff / 3.6e6),
        m: Math.floor((diff % 3.6e6) / 6e4),
        s: Math.floor((diff % 6e4) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const Box = ({ value, label }) => (
  <div className="text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ivory border border-sand font-mono text-xl font-bold text-espresso shadow-xs">
      {String(value).padStart(2, "0")}
    </div>
    <span className="mt-1 block text-[10px] uppercase font-medium text-taupe">
      {label}
    </span>
  </div>
);

const FlashSaleBanner = () => {
  const { h, m, s } = useCountdown();
  return (
    <section className="container-px py-8">
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-champagne via-blush to-champagne border border-sand/80 p-8 shadow-soft text-center lg:flex-row lg:text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-ivory px-3.5 py-1 text-xs font-semibold text-gold tracking-wide">
            <FiZap className="text-gold" /> FLASH SALE
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-espresso sm:text-4xl">
            Up to 30% Off — Ends Soon!
          </h2>
          <p className="mt-1 text-taupe">
            Grab your favourite styles before they're gone.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex gap-2">
            <Box value={h} label="Hrs" />
            <Box value={m} label="Min" />
            <Box value={s} label="Sec" />
          </div>
          <Link to="/shop?isFlashSale=true" className="btn-primary">
            Shop Sale
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
