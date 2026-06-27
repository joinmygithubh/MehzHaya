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
} from "react-icons/fi";
import { logout } from "../../redux/slices/authSlice";

const links = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
  { to: "/admin/categories", label: "Categories", icon: FiLayers },
  { to: "/admin/coupons", label: "Coupons", icon: FiTag },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-beige-light dark:bg-emerald-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-emerald-950 text-beige-light transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold/20 p-5">
          <Link to="/admin" className="font-serif text-xl font-bold text-gold">
            MehzHaya Admin
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden">
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
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-gold text-emerald-950 font-semibold"
                    : "text-beige-light/80 hover:bg-emerald-900"
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 space-y-1 border-t border-gold/20 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-beige-light/80 hover:bg-emerald-900"
          >
            <FiHome size={18} /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-400 hover:bg-emerald-900"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gold/20 bg-white px-5 py-4 dark:bg-emerald-900">
          <button onClick={() => setOpen(true)} className="lg:hidden">
            <FiMenu size={24} />
          </button>
          <h1 className="font-serif text-lg font-semibold text-emerald-900 dark:text-gold">
            Admin Panel
          </h1>
          <span className="text-sm text-gray-500 dark:text-beige-light/60">
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
