import { STORE } from "../../utils/constants";
import Logo from "../common/Logo";

/** Shared two-column shell for auth pages with responsive image support. */
const AuthShell = ({
  title,
  subtitle,
  children,
  footer,
  imageSrc = "/images/login-auth-ultra.jpg",
  imageAlt = "MehzHaya Modest Fashion",
  imageSrcSet,
  imageSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw",
}) => (
  <div className="grid min-h-[85vh] lg:grid-cols-2 bg-ivory">
    {/* Visual side for Desktop & 4K+ (≥1024px, 1280px, 1440px, 1920px, 2560px, 3840px) */}
    <div className="relative hidden lg:block overflow-hidden">
      <img
        src={imageSrc}
        srcSet={imageSrcSet}
        sizes={imageSizes}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-[center_20%] transition-transform duration-700 ease-out hover:scale-105"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-transparent" />
      <div className="absolute bottom-0 p-8 xl:p-12 z-10 w-full">
        <div className="rounded-2xl border border-gold/40 bg-espresso/80 p-6 xl:p-8 shadow-lg max-w-lg">
          <span className="eyebrow text-gold tracking-widest uppercase text-xs font-bold">
            Boutique Atelier
          </span>
          <div className="gold-divider my-2.5 w-16 bg-gold" />
          <h2 className="font-serif text-2xl xl:text-3xl font-semibold text-ivory leading-tight drop-shadow-sm">
            {STORE.tagline}
          </h2>
          <p className="mt-2.5 text-champagne text-sm leading-relaxed font-sans opacity-95">
            Join MehzHaya for an exclusive, premium modest fashion experience.
          </p>
        </div>
      </div>
    </div>

    {/* Form side with mobile/tablet responsive image banner */}
    <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <div className="w-full max-w-md card overflow-hidden p-6 sm:p-8 bg-champagne/50 border border-sand/70 rounded-2xl shadow-soft">
        {/* Mobile & Tablet image banner (<1024px) */}
        <div className="relative mb-6 h-40 sm:h-48 w-full overflow-hidden rounded-xl lg:hidden">
          <img
            src={imageSrc}
            srcSet={imageSrcSet}
            sizes={imageSizes}
            alt={imageAlt}
            className="h-full w-full object-cover object-[center_20%]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/50 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 text-center">
            <span className="text-[11px] font-serif tracking-widest text-gold uppercase font-semibold drop-shadow-sm">
              Boutique Atelier
            </span>
            <p className="text-xs font-serif text-ivory font-medium truncate">
              {STORE.tagline}
            </p>
          </div>
        </div>

        <div className="mb-5 flex justify-center">
          <Logo className="h-14 sm:h-18" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-espresso text-center">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm text-taupe text-center">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-taupe">{footer}</div>}
      </div>
    </div>
  </div>
);

export default AuthShell;
