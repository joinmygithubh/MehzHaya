import { useState } from "react";
import { Link } from "react-router-dom";
import { STORE } from "../../utils/constants";

/**
 * MehzHaya brand logo (image at /logo.jpg) with a graceful text fallback.
 *
 * Props:
 *  - to:        link target (default "/"). Pass null to render without a link.
 *  - className: image height class (default "h-12").
 *  - plate:     wrap the image on a soft rounded surface (use on dark backgrounds
 *               so the logo's light background blends in cleanly).
 *  - variant:   "default" (dark text fallback) | "light" (light text fallback).
 */
const Logo = ({ to = "/", className = "h-12", plate = false, variant = "default" }) => {
  const [ok, setOk] = useState(true);

  const content = ok ? (
    <img
      src="/logo.jpg"
      alt="MehzHaya — Elegance in Modesty"
      onError={() => setOk(false)}
      className={`${className} w-auto object-contain ${
        plate ? "rounded-xl bg-white p-1.5 shadow-sm" : ""
      }`}
    />
  ) : (
    <span
      className={`font-serif text-2xl font-bold leading-none sm:text-3xl ${
        variant === "light" ? "text-gold" : "text-emerald-900 dark:text-gold"
      }`}
    >
      MehzHaya
      <span className="sr-only">{STORE.tagline}</span>
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex shrink-0 items-center" aria-label="MehzHaya home">
      {content}
    </Link>
  );
};

export default Logo;
