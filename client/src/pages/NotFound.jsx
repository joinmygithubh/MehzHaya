import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";

const NotFound = () => (
  <div className="container-px flex min-h-[70vh] flex-col items-center justify-center text-center">
    <SEO title="Page Not Found" />
    <p className="font-serif text-8xl font-bold text-gold">404</p>
    <h1 className="mt-4 font-serif text-3xl text-emerald-900 dark:text-gold">
      Page Not Found
    </h1>
    <p className="mt-2 text-gray-500">
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
