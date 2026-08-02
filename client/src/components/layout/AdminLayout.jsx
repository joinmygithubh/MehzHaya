import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiLayers,
  FiTag,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiMail,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { logout, clearAuth } from "../../redux/slices/authSlice";

const links = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
  { to: "/admin/categories", label: "Categories", icon: FiLayers },
  { to: "/admin/coupons", label: "Coupons", icon: FiTag },
  { to: "/admin/contact-messages", label: "Contact Messages", icon: FiMail },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (err) {
      console.warn("GIS disableAutoSelect error:", err);
    }

    await dispatch(logout());
    dispatch(clearAuth());

    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-ivory text-espresso font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-champagne/80 backdrop-blur-md border-r border-sand/70 text-espresso transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-sand/60 p-5">
          <Link to="/admin" className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="MehzHaya"
              className="h-10 w-10 rounded-xl bg-ivory border border-sand object-contain p-0.5"
            />
            <span className="font-serif text-lg font-semibold text-espresso">MehzHaya</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-taupe hover:text-espresso">
            <FiX size={22} />
          </button>
        </div>
        <nav className="space-y-1 p-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-gold text-espresso font-semibold shadow-xs"
                    : "text-taupe hover:bg-champagne hover:text-espresso"
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 space-y-1 border-t border-sand/60 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-taupe hover:bg-champagne hover:text-espresso transition-colors font-medium"
          >
            <FiHome size={18} /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-terracotta hover:bg-blush/60 transition-colors font-medium"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-espresso/40 backdrop-blur-xs lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sand/60 bg-ivory/90 backdrop-blur-md px-5 py-4 shadow-xs">
          <button onClick={() => setOpen(true)} className="lg:hidden text-espresso">
            <FiMenu size={24} />
          </button>
          <h1 className="font-serif text-xl font-semibold text-espresso">
            Admin Panel
          </h1>
          <span className="text-sm text-taupe font-medium">
            Welcome back 👋
          </span>
        </header>
        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
