import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import SEO from "../components/common/SEO";
import Hero from "../components/home/Hero";
import CategoryShowcase from "../components/home/CategoryShowcase";
import ProductSection from "../components/home/ProductSection";
import FlashSaleBanner from "../components/home/FlashSaleBanner";
import Testimonials from "../components/home/Testimonials";
import InstagramGallery from "../components/home/InstagramGallery";
import { fetchHomeSections } from "../redux/slices/productSlice";

import { FiTruck, FiAward, FiShield, FiRotateCcw } from "react-icons/fi";

const FeatureStrip = () => (
  <div className="border-y border-sand/60 bg-champagne/40">
    <div className="container-px grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { Icon: FiTruck, t: "Free Shipping", s: "On orders above ₹999" },
        { Icon: FiAward, t: "Premium Quality", s: "Finest fabric, perfect comfort" },
        { Icon: FiShield, t: "Secure Payments", s: "100% safe & trusted" },
        { Icon: FiRotateCcw, t: "Easy Returns", s: "Hassle free returns" },
      ].map((f) => (
        <div key={f.t} className="flex items-center justify-center gap-3.5 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand bg-ivory text-gold shadow-xs">
            <f.Icon size={18} />
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-espresso">
              {f.t}
            </p>
            <p className="text-xs text-taupe mt-0.5">{f.s}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Home = () => {
  const dispatch = useDispatch();
  const { sections, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchHomeSections());
  }, [dispatch]);

  const isLoading = loading && !sections.featured;

  return (
    <>
      <SEO />
      <Hero />
      <FeatureStrip />
      <CategoryShowcase />
      <ProductSection
        subtitle="Handpicked for you"
        title="Featured Hijabs"
        products={sections.featured || []}
        viewAll="/shop?isFeatured=true"
        loading={isLoading}
      />
      <FlashSaleBanner />
      <ProductSection
        subtitle="Customer favourites"
        title="Best Sellers"
        products={sections.bestSellers || []}
        viewAll="/shop?sort=bestselling"
        loading={isLoading}
      />
      <ProductSection
        subtitle="Fresh in store"
        title="New Arrivals"
        products={sections.newArrivals || []}
        viewAll="/shop?isNewArrival=true"
        loading={isLoading}
      />
      <ProductSection
        subtitle="Trending now"
        title="Trending Products"
        products={sections.trending || []}
        viewAll="/shop?isTrending=true"
        loading={isLoading}
      />
      <Testimonials />
      <InstagramGallery />
    </>
  );
};

export default Home;
