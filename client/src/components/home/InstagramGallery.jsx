import { FiInstagram } from "react-icons/fi";
import { STORE } from "../../utils/constants";

const images = [
  "https://images.unsplash.com/photo-1611601322175-ef8ec8c85f01?w=400&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
  "https://images.unsplash.com/photo-1592878849122-facb97520f9e?w=400&q=80",
  "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80",
  "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&q=80",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80",
];

const InstagramGallery = () => (
  <section className="container-px py-14">
    <div className="mb-8 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">@mehzhaya</p>
      <h2 className="section-title mt-1">Follow Us on Instagram</h2>
    </div>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {images.map((img, i) => (
        <a
          key={i}
          href={STORE.social.instagram}
          target="_blank"
          rel="noreferrer"
          className="group relative aspect-square overflow-hidden rounded-xl"
        >
          <img
            src={img}
            alt="Instagram post"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/0 transition group-hover:bg-emerald-950/50">
            <FiInstagram className="text-2xl text-beige-light opacity-0 transition group-hover:opacity-100" />
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default InstagramGallery;
