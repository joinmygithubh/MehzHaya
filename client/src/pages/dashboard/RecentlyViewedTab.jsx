import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import SEO from "../../components/common/SEO";
import { FiClock } from "react-icons/fi";

const RecentlyViewedTab = () => {
  const { recentlyViewed } = useSelector((s) => s.ui);

  return (
    <div>
      <SEO title="Recently Viewed" />
      <div className="mb-6 flex items-center justify-between border-b border-sand/60 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso flex items-center gap-2">
            <FiClock className="text-gold" /> Recently Viewed
          </h2>
          <p className="text-sm text-taupe mt-1">
            Products you've explored recently across your browsing session.
          </p>
        </div>
      </div>

      {recentlyViewed && recentlyViewed.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {recentlyViewed.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center bg-champagne/40 border border-sand/60 rounded-xl">
          <FiClock className="mx-auto text-5xl text-gold/60 mb-3" />
          <h3 className="font-serif text-lg font-semibold text-espresso">No recently viewed items</h3>
          <p className="text-sm text-taupe mt-1 mb-6">Explore our hijab & modest wear collections to build your browsing history.</p>
          <Link to="/shop" className="btn-primary px-6 py-2.5 text-sm inline-block">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentlyViewedTab;
