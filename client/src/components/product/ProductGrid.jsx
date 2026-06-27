import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";

const ProductGrid = ({ products = [], loading, skeletonCount = 8, view = "grid" }) => {
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-2xl text-emerald-900 dark:text-gold">
          No products found
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        view === "list"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      }
    >
      {products.map((p, i) => (
        <ProductCard key={p._id} product={p} index={i} />
      ))}
    </div>
  );
};

export default ProductGrid;
