import { Link } from "react-router-dom";
import { FiAward, FiHeart, FiTruck, FiUsers } from "react-icons/fi";

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
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1592878849122-facb97520f9e?w=1600&q=80"
          alt="About MehzHaya"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-emerald-950/70" />
        <div className="container-px relative py-24 text-center">
          <h1 className="font-serif text-4xl font-bold text-beige-light sm:text-5xl">
            Our Story
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-beige-light/80">
            {STORE.tagline} — MehzHaya was born from a passion for celebrating
            modesty through timeless, elegant fashion.
          </p>
        </div>
      </section>

      <section className="container-px py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Crafting Elegance, Honouring Modesty</h2>
          <p className="mt-5 leading-relaxed text-gray-600 dark:text-beige-light/80">
            At MehzHaya, we believe that modesty and style go hand in hand. Our
            curated collection of hijabs, niqabs, abayas, khimars and accessories
            is thoughtfully designed to empower women to express their identity
            with grace and confidence. From luxurious silk hijabs to everyday
            jersey essentials, each piece is crafted with care, quality, and a
            deep respect for our heritage.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600 dark:text-beige-light/80">
            Based in {STORE.address.city}, {STORE.address.state}, we proudly serve
            customers across India — delivering premium modest fashion right to
            your doorstep.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ Icon, title, text }) => (
            <div key={title} className="card p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
                <Icon size={26} />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-emerald-900 dark:text-gold">
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-beige-light/70">{text}</p>
            </div>
          ))}
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
