import { Link } from "react-router-dom";
import {
  FiPhone,
  FiMapPin,
  FiMail,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";
import { STORE, CATEGORY_GROUPS } from "../../utils/constants";
import Newsletter from "../home/Newsletter";

const Footer = () => (
  <footer className="mt-16 bg-emerald-950 text-beige-light">
    <Newsletter />
    <div className="container-px grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      {/* Brand */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-gold">MehzHaya</h3>
        <p className="mt-1 text-xs tracking-[0.2em] text-beige-light/60">
          {STORE.tagline.toUpperCase()}
        </p>
        <p className="mt-4 text-sm text-beige-light/70">
          Premium Hijabs, Niqabs, Abayas & Islamic fashion — crafted for the
          modern modest wardrobe.
        </p>
        <div className="mt-5 flex gap-3">
          {[
            { Icon: FiInstagram, url: STORE.social.instagram },
            { Icon: FiFacebook, url: STORE.social.facebook },
            { Icon: FiTwitter, url: STORE.social.twitter },
            { Icon: FiYoutube, url: STORE.social.youtube },
          ].map(({ Icon, url }, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-gold/30 p-2 text-gold transition hover:bg-gold hover:text-emerald-950"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div>
        <h4 className="mb-4 font-serif text-lg text-gold">Shop</h4>
        <ul className="space-y-2 text-sm text-beige-light/70">
          {Object.keys(CATEGORY_GROUPS).map((g) => (
            <li key={g}>
              <Link to={`/shop?group=${encodeURIComponent(g)}`} className="hover:text-gold">
                {g}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/shop?isFlashSale=true" className="hover:text-gold">
              Flash Sale
            </Link>
          </li>
        </ul>
      </div>

      {/* Help */}
      <div>
        <h4 className="mb-4 font-serif text-lg text-gold">Help</h4>
        <ul className="space-y-2 text-sm text-beige-light/70">
          <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
          <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          <li><Link to="/account/orders" className="hover:text-gold">Track Order</Link></li>
          <li><Link to="/account" className="hover:text-gold">My Account</Link></li>
          <li><Link to="/wishlist" className="hover:text-gold">Wishlist</Link></li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="mb-4 font-serif text-lg text-gold">Get in Touch</h4>
        <ul className="space-y-3 text-sm text-beige-light/70">
          <li className="flex items-start gap-2">
            <FiMapPin className="mt-0.5 shrink-0 text-gold" />
            <span>
              {STORE.address.line1}, {STORE.address.city}, {STORE.address.state} –{" "}
              {STORE.address.pincode}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FiPhone className="text-gold" />
            <a href={`tel:${STORE.phone}`} className="hover:text-gold">
              {STORE.phone}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <FiMail className="text-gold" />
            <a href={`mailto:${STORE.email}`} className="hover:text-gold">
              {STORE.email}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-gold/10 py-5 text-center text-xs text-beige-light/50">
      © {new Date().getFullYear()} MehzHaya. All rights reserved. · Made with 💚 for modest fashion.
    </div>
  </footer>
);

export default Footer;
