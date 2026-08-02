import { FiPhone, FiTruck } from "react-icons/fi";
import { STORE } from "../../utils/constants";

const AnnouncementBar = () => (
  <div className="bg-champagne border-b border-sand/60 text-espresso text-xs sm:text-sm">
    <div className="container-px flex items-center justify-between py-2">
      <span className="hidden items-center gap-1.5 sm:flex font-medium text-taupe">
        <FiTruck className="text-gold" /> Free shipping on orders above ₹999
      </span>
      <span className="mx-auto sm:mx-0 font-medium tracking-wide text-gold">
        ✦ {STORE.tagline} ✦
      </span>
      <a
        href={`tel:${STORE.phone}`}
        className="hidden items-center gap-1.5 text-taupe hover:text-gold sm:flex font-medium"
      >
        <FiPhone className="text-gold" /> {STORE.phone}
      </a>
    </div>
  </div>
);

export default AnnouncementBar;
