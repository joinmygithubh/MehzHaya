import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const defaultCategories = [
  {
    name: "Jersey Hijabs",
    count: "Items available",
    category: "Jersey Hijab",
    img: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&q=80",
  },
  {
    name: "Modal Hijabs",
    count: "Items available",
    category: "Modal Hijab",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
  },
  {
    name: "Chiffon Hijabs",
    count: "Items available",
    category: "Chiffon Hijab",
    img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80",
  },
  {
    name: "Islamic Wear",
    count: "Abayas & Niqabs",
    group: "Islamic Wear",
    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80",
  },
  {
    name: "Silk Hijabs",
    count: "Items available",
    category: "Silk Hijab",
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
  },
  {
    name: "Accessories",
    count: "Pins & Undercaps",
    group: "Accessories",
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
  },
];

const fallbackImages = [
  "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80",
  "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
];

const CategoryShowcase = () => {
  const { list: apiCategories } = useSelector((s) => s.categories);

  const displayItems =
    apiCategories && apiCategories.length > 0
      ? apiCategories.slice(0, 6).map((c, idx) => ({
          name: c.name,
          count: c.productCount !== undefined ? `${c.productCount} Products` : "Collection",
          category: c.name,
          group: c.group,
          img: c.image?.url || fallbackImages[idx % fallbackImages.length],
        }))
      : defaultCategories;

  return (
    <section className="container-px py-14 sm:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso sm:text-3xl">
            Shop By Category
          </h2>
        </div>
        <Link
          to="/shop"
          className="group inline-flex items-center gap-1 text-sm font-medium text-espresso hover:text-gold hover:underline transition-colors"
        >
          View All <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {displayItems.map((c, i) => {
          const to = c.group
            ? `/shop?group=${encodeURIComponent(c.group)}`
            : `/shop?category=${encodeURIComponent(c.category || c.name)}`;
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={to} className="group block text-center">
                <div className="relative mx-auto aspect-square w-28 sm:w-36 overflow-hidden rounded-full border-2 border-sand/80 bg-champagne shadow-soft transition-all duration-300 group-hover:border-gold group-hover:scale-105 group-hover:shadow-md">
                  <img
                    src={c.img}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-3 font-serif text-base sm:text-lg font-semibold text-espresso transition-colors group-hover:text-gold">
                  {c.name}
                </h3>
                <p className="mt-0.5 text-xs text-taupe">{c.count}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryShowcase;
