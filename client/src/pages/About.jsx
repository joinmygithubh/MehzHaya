import { Link } from "react-router-dom";
import { FiAward, FiHeart, FiTruck, FiUsers, FiShield } from "react-icons/fi";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import { STORE } from "../utils/constants";

const About = () => {
  const values = [
    { Icon: FiAward, title: "Premium Quality", text: "Handpicked fabrics and meticulous craftsmanship in every piece." },
    { Icon: FiHeart, title: "Made with Love", text: "Designed for the modern, modest woman who values elegance." },
    { Icon: FiTruck, title: "Fast Delivery", text: "Quick, reliable shipping across India with careful packaging." },
    { Icon: FiUsers, title: "Community First", text: "Thousands of happy customers trust MehzHaya for modest fashion." },
  ];

  return (
    <>
      <SEO title="About Us" />
      <div className="container-px py-6">
        <Breadcrumb items={[{ label: "About" }]} />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ivory min-h-[380px] sm:min-h-[460px] lg:min-h-[540px]">
        <img
          src="/images/about-hero-ultra.jpg"
          srcSet="/images/about-hero-ultra.jpg 1920w"
          sizes="(max-width: 768px) 100vw, 100vw"
          alt="About MehzHaya Modest Atelier"
          className="absolute inset-0 h-full w-full object-cover object-[center_18%] pointer-events-none"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/65 to-espresso/35" />
        <div className="container-px relative py-24 sm:py-32 lg:py-36 text-center">
          <p className="eyebrow text-gold uppercase tracking-widest font-semibold text-xs">
            About MehzHaya
          </p>
          <div className="gold-divider mx-auto my-3.5 w-16" />
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-ivory drop-shadow-sm">
            Our Story
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-champagne/95 text-sm sm:text-base leading-relaxed font-sans">
            {STORE.tagline} — MehzHaya was born from a passion for celebrating
            modesty through timeless, elegant fashion.
          </p>
        </div>
      </section>

      <section className="container-px py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Our Philosophy</p>
          <div className="gold-divider mx-auto my-2" />
          <h2 className="section-title">Crafting Elegance, Honouring Modesty</h2>
          <p className="mt-5 leading-relaxed text-taupe font-sans">
            At MehzHaya, we believe that modesty and style go hand in hand. Our
            curated collection of hijabs, niqabs, abayas, khimars and accessories
            is thoughtfully designed to empower women to express their identity
            with grace and confidence. From luxurious silk hijabs to everyday
            jersey essentials, each piece is crafted with care, quality, and a
            deep respect for our heritage.
          </p>
          <p className="mt-4 leading-relaxed text-taupe font-sans">
            Based in {STORE.address.city}, {STORE.address.state}, we proudly serve
            customers across India — delivering premium modest fashion right to
            your doorstep.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ Icon, title, text }) => (
            <div key={title} className="card p-6 text-center bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-gold shadow-xs">
                <Icon size={26} />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-espresso">
                {title}
              </h3>
              <p className="mt-2 text-sm text-taupe leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Business Information */}
        <div className="mt-14 max-w-3xl mx-auto card p-6 sm:p-8 bg-champagne/60 border border-sand/70 rounded-2xl shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-sand/60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
              <FiShield size={20} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-espresso">
                Business Information
              </h3>
              <p className="text-xs text-taupe">Verified Registered Business Details</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 rounded-xl bg-ivory/80 border border-sand/50">
              <span className="text-xs font-medium text-taupe uppercase tracking-wider block">
                Business Name
              </span>
              <p className="mt-1 font-serif text-base font-semibold text-espresso">
                Mehzabee
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ivory/80 border border-sand/50">
              <span className="text-xs font-medium text-taupe uppercase tracking-wider block">
                GSTIN
              </span>
              <p className="mt-1 font-mono text-base font-bold text-gold tracking-wide">
                06GMOPM8141Q1Z3
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ivory/80 border border-sand/50">
              <span className="text-xs font-medium text-taupe uppercase tracking-wider block">
                Business Type
              </span>
              <p className="mt-1 font-serif text-base font-semibold text-espresso">
                Proprietorship
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link to="/shop" className="btn-primary">
            Explore Our Collection
          </Link>
        </div>
      </section>
    </>
  );
};

export default About;
