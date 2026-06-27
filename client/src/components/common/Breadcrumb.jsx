import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const Breadcrumb = ({ items = [] }) => (
  <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-beige-light/60">
    <Link to="/" className="hover:text-gold">
      Home
    </Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        <FiChevronRight size={14} />
        {item.to ? (
          <Link to={item.to} className="hover:text-gold">
            {item.label}
          </Link>
        ) : (
          <span className="text-emerald-900 dark:text-gold">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
