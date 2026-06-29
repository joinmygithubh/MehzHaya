import { useState } from "react";
import { Link } from "react-router-dom";
import { STORE } from "../../utils/constants";

/**
 * Brand logo with graceful image fallbacks.
 *
 * Image assets (place in `client/public/`):
 *   - logo.png       → full logo (emblem + wordmark). Used on auth pages.
 *   - logo-icon.png  → emblem only (crescent + figure), ideally transparent PNG.
 *                      Used in the header beside the "MehzHaya" wordmark.
 *
 * If an image is missing/fails to load, it gracefully falls back to a styled
 * text wordmark so the UI never breaks.
 *
 * Props:
 *  - to:        link target (default "/"). Pass null to render without a link.
 *  - className: image height class (default "h-12 sm:h-14").
 *  - variant:   "default" (light bg) | "light" (text wordmark for dark bg).
 *  - icon:      use the emblem-only image (/logo-icon.png) instead of /logo.png.
 *  - showText:  render the "MehzHaya" wordmark beside the image (default false).
 */
const Logo = ({
  to = "/",
  className = "h-12 sm:h-14",
  variant = "default",
  icon = false,
  showText = false,
}) => {
  const src = icon ? "/logo-icon.png" : "/logo.png";
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
          variant === "light"
            ? "text-beige-light/70"
            : "text-gold-dark dark:text-beige-light/70"
        }`}
      >
        {STORE.tagline.toUpperCase()}
      </span>
    </span>
  );

  let content;
  if (variant === "light") {
    // dark backgrounds → always use the text wordmark
    content = TextMark;
  } else if (imgOk) {
    content = (
      <span className="flex items-center gap-2.5">
        <img
          src={src}
          alt="MehzHaya"
          onError={() => setImgOk(false)}
          className={`${className} w-auto object-contain ${
            icon ? "" : "rounded-md dark:bg-white/90 dark:p-1"
          }`}
        />
        {showText && TextMark}
      </span>
    );
  } else {
    // image missing → fall back to the wordmark
    content = TextMark;
  }

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex items-center" aria-label="MehzHaya home">
      {content}
    </Link>
  );
};

export default Logo;
