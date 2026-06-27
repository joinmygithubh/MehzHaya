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

const FeatureStrip = () => (
  <div className="border-y border-gold/10 bg-white dark:bg-emerald-900/30">
    <div className="container-px grid grid-cols-2 gap-6 py-8 text-center sm:grid-cols-4">
      {[
        { t: "Free Shipping", s: "On orders above ₹999" },
        { t: "Premium Quality", s: "Handpicked fabrics" },
        { t: "Easy Returns", s: "7-day return policy" },
        { t: "Secure Payments", s: "Razorpay & COD" },
      ].map((f) => (
        <div key={f.t}>
          <p className="font-serif text-lg font-semibold text-emerald-900 dark:text-gold">
            {f.t}
          </p>
          <p className="text-xs text-gray-500 dark:text-beige-light/60">{f.s}</p>
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
