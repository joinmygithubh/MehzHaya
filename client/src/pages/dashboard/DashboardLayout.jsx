import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiUser, FiPackage, FiMapPin, FiLock, FiHeart, FiLogOut } from "react-icons/fi";

import { toast } from "react-toastify";
import SEO from "../../components/common/SEO";
import { logout, clearAuth } from "../../redux/slices/authSlice";

const links = [
  { to: "/account", label: "Profile", icon: FiUser, end: true },
  { to: "/account/orders", label: "My Orders", icon: FiPackage },
  { to: "/account/addresses", label: "Addresses", icon: FiMapPin },
  { to: "/wishlist", label: "Wishlist", icon: FiHeart },
  { to: "/account/password", label: "Change Password", icon: FiLock },
];

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

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
    <div className="container-px py-8">
      <SEO title="My Account" />
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-6 text-center bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold text-2xl font-semibold font-serif text-espresso shadow-xs">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="mt-3 font-serif text-lg font-semibold text-espresso">
              {user?.name}
            </h3>
            <p className="text-xs text-taupe">{user?.email}</p>
            {!user?.isEmailVerified && (
              <span className="mt-2 inline-block rounded-full border border-terracotta/40 bg-blush px-2.5 py-0.5 text-[10px] font-semibold text-terracotta uppercase tracking-wider">
                Email not verified
              </span>
            )}
          </div>

          <nav className="card mt-4 overflow-hidden p-2 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft space-y-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-gold text-espresso font-semibold shadow-xs"
                      : "text-taupe hover:bg-champagne/80 hover:text-espresso"
                  }`
                }
              >
                <Icon size={18} /> {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-terracotta hover:bg-blush/60 transition-colors"
            >
              <FiLogOut size={18} /> Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
