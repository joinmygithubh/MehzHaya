import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiUser, FiPackage, FiMapPin, FiLock, FiHeart, FiLogOut } from "react-icons/fi";

import SEO from "../../components/common/SEO";
import { logout } from "../../redux/slices/authSlice";

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

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  return (
    <div className="container-px py-8">
      <SEO title="My Account" />
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-900 text-2xl font-bold text-gold">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="mt-3 font-serif text-lg font-semibold text-emerald-900 dark:text-gold">
              {user?.name}
            </h3>
            <p className="text-xs text-gray-500">{user?.email}</p>
            {!user?.isEmailVerified && (
              <span className="mt-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                Email not verified
              </span>
            )}
          </div>

          <nav className="card mt-4 overflow-hidden p-2">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-emerald-900 text-gold"
                      : "text-gray-600 hover:bg-beige dark:text-beige-light/70 dark:hover:bg-emerald-800"
                  }`
                }
              >
                <Icon size={18} /> {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-emerald-800"
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
