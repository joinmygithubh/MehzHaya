import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const Breadcrumb = ({ items = [] }) => (
  <nav className="flex flex-wrap items-center gap-1 text-sm text-taupe">
    <Link to="/" className="hover:text-gold transition-colors">
      Home
    </Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        <FiChevronRight size={14} className="text-sand" />
        {item.to ? (
          <Link to={item.to} className="hover:text-gold transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="font-medium text-espresso">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
