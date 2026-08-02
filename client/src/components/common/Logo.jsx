import { useState } from "react";
import { Link } from "react-router-dom";
import { STORE } from "../../utils/constants";

/**
 * MehzHaya brand logo (image at /logo.jpg) side-by-side with brand title and tagline.
 *
 * Props:
 *  - to:        link target (default "/"). Pass null to render without a link.
 *  - className: image height class (default "h-12").
 *  - plate:     wrap the image on a soft rounded surface.
 *  - variant:   "default" (espresso text) | "light" (ivory text).
 *  - showText:  whether to render "MehzHaya" text next to logo (default true).
 */
const Logo = ({ to = "/", className = "h-12", plate = false, variant = "default", showText = true }) => {
  const [ok, setOk] = useState(true);

  const content = (
    <div className="inline-flex items-center gap-2.5 sm:gap-3">
      {ok && (
        <img
          src="/logo.jpg"
          alt="MehzHaya"
          onError={() => setOk(false)}
          className={`${className} w-auto object-contain ${
            plate ? "rounded-xl bg-ivory border border-sand p-1.5 shadow-soft" : ""
          }`}
        />
      )}
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <span
            className={`font-serif text-2xl font-semibold tracking-[0.5px] sm:text-3xl lg:text-[34px] ${
              variant === "light" ? "text-ivory" : "text-espresso"
            }`}
          >
            MehzHaya
          </span>
          <span
            className={`font-sans text-[8.5px] sm:text-[9.5px] font-normal tracking-[1.8px] uppercase ${
              variant === "light" ? "text-gold/90" : "text-taupe"
            }`}
          >
            Elegance in modesty
          </span>
        </div>
      )}
    </div>
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex shrink-0 items-center group" aria-label="MehzHaya home">
      {content}
    </Link>
  );
};

export default Logo;
