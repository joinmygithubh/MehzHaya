import { useState } from "react";
import { Link } from "react-router-dom";
import { STORE } from "../../utils/constants";

/**
 * Brand logo.
 *
 * Renders the image at `/logo.png` (place your file in `client/public/logo.png`).
 * If the image is missing or fails to load, it gracefully falls back to a
 * styled text wordmark so the header never breaks.
 *
 * Props:
 *  - to:        link target (default "/"). Pass null to render without a link.
 *  - className: sizing class for the image height (default "h-12 sm:h-14").
 *  - variant:   "default" (for light backgrounds) | "light" (text wordmark for dark backgrounds)
 *  - showText:  also show the wordmark next to the image (default false)
 */
const Logo = ({ to = "/", className = "h-12 sm:h-14", variant = "default", showText = false }) => {
  const [imgOk, setImgOk] = useState(true);

  const TextMark = (
    <span className="flex flex-col leading-none">
      <span
        className={`font-serif text-2xl font-bold sm:text-3xl ${
          variant === "light" ? "text-gold" : "text-emerald-900 dark:text-gold"
        }`}
      >
        MehzHaya
      </span>
      <span
        className={`text-[10px] tracking-[0.25em] ${
          variant === "light" ? "text-beige-light/70" : "text-gold-dark dark:text-beige-light/70"
        }`}
      >
        {STORE.tagline.toUpperCase()}
      </span>
    </span>
  );

  const content =
    imgOk && variant !== "light" ? (
      <span className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="MehzHaya"
          onError={() => setImgOk(false)}
          className={`${className} w-auto object-contain rounded-md dark:bg-white/90 dark:p-1`}
        />
        {showText && TextMark}
      </span>
    ) : (
      TextMark
    );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex items-center" aria-label="MehzHaya home">
      {content}
    </Link>
  );
};

export default Logo;
