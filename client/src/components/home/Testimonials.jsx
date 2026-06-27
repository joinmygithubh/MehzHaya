import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Fatima R.",
    location: "Delhi",
    text: "The quality of these hijabs is unmatched! The modal fabric is so soft and the colors are exactly as shown. MehzHaya is now my go-to store.",
    rating: 5,
  },
  {
    name: "Ayesha M.",
    location: "Mumbai",
    text: "Beautiful abayas and super fast delivery. The packaging felt so premium. Truly elegance in every fold!",
    rating: 5,
  },
  {
    name: "Zainab K.",
    location: "Hyderabad",
    text: "I ordered the instant hijabs and they are perfect for busy mornings. Excellent customer service too. Highly recommend!",
    rating: 5,
  },
];

const Testimonials = () => (
  <section className="bg-beige py-16 dark:bg-emerald-900/40">
    <div className="container-px">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">
          Loved by thousands
        </p>
        <h2 className="section-title mt-1">What Our Customers Say</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-6"
          >
            <FaQuoteLeft className="mb-4 text-2xl text-gold/50" />
            <p className="text-sm leading-relaxed text-gray-600 dark:text-beige-light/80">
              {t.text}
            </p>
            <div className="mt-4 flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <FaStar key={j} className="text-gold" size={14} />
              ))}
            </div>
            <div className="mt-3">
              <p className="font-semibold text-emerald-900 dark:text-gold">
                {t.name}
              </p>
              <p className="text-xs text-gray-400">{t.location}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
