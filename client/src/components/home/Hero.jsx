import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => (
  <section className="relative w-full overflow-hidden bg-ivory flex items-center min-h-[420px] h-[72vh] sm:h-[82vh] sm:min-h-[520px] lg:h-[90vh] lg:min-h-[600px] max-h-[900px]">
    {/* Full-width edge-to-edge Hero Image */}
    <div className="absolute inset-0 w-full h-full">
      <img
        src="/images/hero-model-ultra.jpg"
        alt="MehzHaya Timeless Hijabs & Islamic Fashion"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        className="h-full w-full object-cover object-[82%_top] sm:object-[78%_top] lg:object-[70%_top] xl:object-[65%_top] pointer-events-none"
      />
    </div>

    {/* Subtle dark text backdrop gradient - Right on Mobile/Tablet, Left on Desktop */}
    <div className="absolute inset-y-0 right-0 lg:right-auto lg:left-0 w-full sm:w-[60%] lg:w-[48%] bg-gradient-to-l from-black/35 via-black/15 to-transparent lg:bg-gradient-to-r lg:from-black/25 lg:via-black/10 lg:to-transparent pointer-events-none" />

    {/* Content Container (Right aligned on Mobile/Tablet, Left aligned on Desktop) */}
    <div className="container-px relative z-10 w-full py-8 sm:py-16 lg:py-20 flex justify-end lg:justify-start">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="ml-auto lg:ml-0 max-w-[280px] sm:max-w-md lg:max-w-xl space-y-4 sm:space-y-5 text-right lg:text-left"
      >
        <h1 className="font-serif text-4xl font-semibold leading-[1.2] text-espresso sm:text-6xl lg:text-7xl">
          Timeless Abaya and Hijab <br className="hidden sm:block" />
          for Modern Muslimah
        </h1>

        <div className="gold-divider my-2.5 ml-auto lg:ml-0" />

        <p className="max-w-md ml-auto lg:ml-0 text-base text-espresso font-medium sm:text-lg leading-relaxed">
          Premium quality. Beautifully designed. <br className="hidden sm:block" />
          Made for every moment of your journey.
        </p>

        <div className="pt-3 flex flex-wrap gap-3.5 sm:gap-4 justify-end lg:justify-start">
          <Link to="/shop" className="inline-flex items-center justify-center bg-espresso text-ivory rounded-[3px] border-2 border-espresso hover:bg-transparent hover:text-espresso px-8 py-3.5 text-sm sm:text-base font-medium transition-all duration-300 ease-in-out shadow-soft">
            Shop Now
          </Link>
          <Link to="/shop" className="inline-flex items-center justify-center bg-transparent border-2 border-espresso text-espresso rounded-[3px] hover:bg-espresso hover:text-ivory px-8 py-3.5 text-sm sm:text-base font-medium transition-all duration-300 ease-in-out shadow-soft">
            Explore Collections
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-7 sm:gap-10 border-t border-ivory/30 pt-5 justify-end lg:justify-start">
          {[
            { n: "250+", l: "Products" },
            { n: "20+", l: "Categories" },
            { n: "10k+", l: "Happy Customers" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-serif text-2xl font-semibold text-ivory sm:text-3xl">{s.n}</p>
              <p className="text-xs font-medium text-ivory/90 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default Hero;
