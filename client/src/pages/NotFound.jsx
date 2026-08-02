import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";

const NotFound = () => (
  <div className="container-px flex min-h-[70vh] flex-col items-center justify-center text-center">
    <SEO title="Page Not Found" />
    <span className="eyebrow text-gold">404 Error</span>
    <p className="mt-2 font-serif text-8xl font-semibold text-gold">404</p>
    <div className="gold-divider mx-auto my-3" />
    <h1 className="font-serif text-3xl font-semibold text-espresso">
      Page Not Found
    </h1>
    <p className="mt-2 text-taupe font-sans">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div className="mt-6 flex gap-4">
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
      <Link to="/shop" className="btn-outline">
        Shop Now
      </Link>
    </div>
  </div>
);

export default NotFound;
