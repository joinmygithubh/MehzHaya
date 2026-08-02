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
  <section className="bg-champagne/40 py-16 border-y border-sand/50">
    <div className="container-px">
      <div className="mb-10 text-center">
        <p className="eyebrow">
          Loved by thousands
        </p>
        <div className="gold-divider mx-auto my-2" />
        <h2 className="section-title">What Our Customers Say</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 bg-ivory/90 border border-sand/80 shadow-soft"
          >
            <FaQuoteLeft className="mb-4 text-2xl text-gold/60" />
            <p className="text-sm leading-relaxed text-taupe font-sans">
              "{t.text}"
            </p>
            <div className="mt-4 flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <FaStar key={j} className="text-gold" size={14} />
              ))}
            </div>
            <div className="mt-3 border-t border-sand/40 pt-3">
              <p className="font-serif text-base font-semibold text-espresso">
                {t.name}
              </p>
              <p className="text-xs text-taupe">{t.location}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
