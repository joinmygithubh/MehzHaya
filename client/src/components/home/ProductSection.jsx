import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "../product/ProductCard";
import SkeletonCard from "../product/SkeletonCard";

const ProductSection = ({ title, subtitle, products = [], viewAll, loading }) => {
  if (!loading && products.length === 0) return null;

  return (
    <section className="container-px py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          {subtitle && (
            <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">
              {subtitle}
            </p>
          )}
          <h2 className="section-title mt-1">{title}</h2>
        </div>
        {viewAll && (
          <Link
            to={viewAll}
            className="flex items-center gap-1 text-sm font-medium text-emerald-900 hover:text-gold dark:text-gold"
          >
            View All <FiArrowRight />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : products.slice(0, 8).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
      </div>
    </section>
  );
};

export default ProductSection;
