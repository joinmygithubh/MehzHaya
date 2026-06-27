import { FiPhone, FiTruck } from "react-icons/fi";
import { STORE } from "../../utils/constants";

const AnnouncementBar = () => (
  <div className="bg-emerald-950 text-beige-light text-xs sm:text-sm">
    <div className="container-px flex items-center justify-between py-2">
      <span className="hidden items-center gap-1.5 sm:flex">
        <FiTruck className="text-gold" /> Free shipping on orders above ₹999
      </span>
      <span className="mx-auto sm:mx-0 font-medium tracking-wide text-gold">
        ✦ {STORE.tagline} ✦
      </span>
      <a
        href={`tel:${STORE.phone}`}
        className="hidden items-center gap-1.5 hover:text-gold sm:flex"
      >
        <FiPhone className="text-gold" /> {STORE.phone}
      </a>
    </div>
  </div>
);

export default AnnouncementBar;
