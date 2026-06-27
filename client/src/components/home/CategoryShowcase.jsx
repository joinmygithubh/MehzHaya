import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Hijabs",
    group: "Hijabs",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  },
  {
    name: "Abayas",
    category: "Abaya",
    img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
  },
  {
    name: "Niqabs",
    category: "Niqab",
    img: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80",
  },
  {
    name: "Accessories",
    group: "Accessories",
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
  },
];

const CategoryShowcase = () => (
  <section className="container-px py-14">
    <div className="mb-8 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">
        Browse Collections
      </p>
      <h2 className="section-title mt-1">Shop by Category</h2>
    </div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {categories.map((c, i) => {
        const to = c.group
          ? `/shop?group=${encodeURIComponent(c.group)}`
          : `/shop?category=${encodeURIComponent(c.category)}`;
        return (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={to}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                <h3 className="font-serif text-2xl font-semibold text-beige-light">
                  {c.name}
                </h3>
                <span className="mt-1 inline-block text-xs uppercase tracking-widest text-gold opacity-0 transition group-hover:opacity-100">
                  Shop Now →
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  </section>
);

export default CategoryShowcase;
