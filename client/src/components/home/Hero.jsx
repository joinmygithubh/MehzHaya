import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { STORE } from "../../utils/constants";

const Hero = () => (
  <section className="relative overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1611601322175-ef8ec8c85f01?w=1920&q=80')",
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/60 to-transparent" />

    <div className="container-px relative flex min-h-[70vh] flex-col justify-center py-16 sm:min-h-[78vh] sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-xl"
      >
        <span className="mb-4 inline-block rounded-full border border-gold/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-gold sm:px-4 sm:text-xs sm:tracking-[0.25em]">
          Premium Islamic Fashion
        </span>
        <h1 className="font-serif text-4xl font-bold leading-tight text-beige-light sm:text-6xl lg:text-7xl">
          {STORE.tagline}
        </h1>
        <p className="mt-4 max-w-md text-base text-beige-light/80 sm:mt-5 sm:text-lg">
          Discover our curated collection of luxurious hijabs, abayas, niqabs &
          accessories — designed for the modern, modest woman.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
          <Link to="/shop" className="btn-gold">
            Shop Collection <FiArrowRight />
          </Link>
          <Link
            to="/shop?group=Hijabs"
            className="btn border border-beige-light/60 text-beige-light hover:bg-beige-light hover:text-emerald-950"
          >
            Explore Hijabs
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-6 sm:mt-10 sm:gap-8">
          {[
            { n: "250+", l: "Products" },
            { n: "20+", l: "Categories" },
            { n: "10k+", l: "Happy Customers" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-serif text-2xl font-bold text-gold sm:text-3xl">{s.n}</p>
              <p className="text-xs text-beige-light/70">{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default Hero;
