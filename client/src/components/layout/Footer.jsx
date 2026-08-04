import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiPhone,
  FiMapPin,
  FiMail,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { STORE } from "../../utils/constants";
import { whatsappLink } from "../../utils/helpers";
import Newsletter from "../home/Newsletter";
import Logo from "../common/Logo";

const Footer = () => {
  const { grouped: categoryGroups } = useSelector((s) => s.categories);

  return (
    <footer className="mt-16 bg-champagne border-t border-sand text-espresso">
      <Newsletter />
      <div className="container-px grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Logo to={null} className="h-16" plate />
          <p className="mt-3 text-xs tracking-[0.2em] text-taupe font-semibold">
            {STORE.tagline.toUpperCase()}
          </p>
          <p className="mt-4 text-sm text-taupe leading-relaxed">
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
                className="rounded-full border border-sand bg-ivory p-2 text-gold transition hover:bg-gold hover:text-espresso"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="mb-4 font-serif text-lg font-semibold text-gold">Shop</h4>
          <ul className="space-y-2 text-sm text-taupe">
            {Object.keys(categoryGroups).map((g) => (
              <li key={g}>
                <Link to={`/shop?group=${encodeURIComponent(g)}`} className="hover:text-gold transition-colors">
                  {g}
                </Link>
              </li>
            ))}
          <li>
            <Link to="/shop?isFlashSale=true" className="hover:text-gold transition-colors">
              Flash Sale
            </Link>
          </li>
        </ul>
      </div>

      {/* Help */}
      <div>
        <h4 className="mb-4 font-serif text-lg font-semibold text-gold">Help</h4>
        <ul className="space-y-2 text-sm text-taupe">
          <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
          <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
          <li><Link to="/account/orders" className="hover:text-gold transition-colors">Track Order</Link></li>
          <li><Link to="/account" className="hover:text-gold transition-colors">My Account</Link></li>
          <li><Link to="/wishlist" className="hover:text-gold transition-colors">Wishlist</Link></li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="mb-4 font-serif text-lg font-semibold text-gold">Get in Touch</h4>
        <ul className="space-y-3 text-sm text-taupe">
          <li className="flex items-start gap-2">
            <FiMapPin className="mt-0.5 shrink-0 text-gold" />
            <span>
              {STORE.address.line1}, {STORE.address.city}, {STORE.address.state} –{" "}
              {STORE.address.pincode}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FiPhone className="text-gold" />
            <a href={`tel:${STORE.phone}`} className="hover:text-gold transition-colors">
              {STORE.phone}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <FaWhatsapp className="text-gold" />
            <a
              href={whatsappLink("Hello MehzHaya! 🌸 I'd like to book / enquire about your products.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Book on WhatsApp
            </a>
          </li>
          <li className="flex items-center gap-2">
            <FiMail className="text-gold" />
            <a href={`mailto:${STORE.email}`} className="hover:text-gold transition-colors">
              {STORE.email}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-sand/70 py-5 text-center text-xs text-taupe">
      © {new Date().getFullYear()} MehzHaya. All rights reserved. · Crafted with ✦ for modest fashion.
    </div>
  </footer>
  );
};

export default Footer;
