import { Link } from "react-router-dom";
import { STORE } from "../../utils/constants";

/** Shared two-column shell for auth pages. */
const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-[80vh] lg:grid-cols-2">
    {/* Visual side */}
    <div className="relative hidden lg:block">
      <img
        src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=80"
        alt="MehzHaya"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 to-emerald-950/30" />
      <div className="absolute bottom-0 p-12">
        <h2 className="font-serif text-4xl font-bold text-beige-light">
          {STORE.tagline}
        </h2>
        <p className="mt-2 max-w-sm text-beige-light/70">
          Join MehzHaya for an exclusive, premium modest fashion experience.
        </p>
      </div>
    </div>

    {/* Form side */}
    <div className="flex items-center justify-center px-6 py-12 sm:px-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 block text-center font-serif text-3xl font-bold text-emerald-900 dark:text-gold"
        >
          MehzHaya
        </Link>
        <h1 className="font-serif text-3xl font-semibold text-emerald-900 dark:text-gold">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  </div>
);

export default AuthShell;
