import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiLogOut,
  FiGrid,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import { CATEGORY_GROUPS } from "../../utils/constants";
import { toggleTheme } from "../../redux/slices/uiSlice";
import { logout } from "../../redux/slices/authSlice";
import SearchBar from "./SearchBar";
import Logo from "../common/Logo";

const Header = ({ minimal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { summary } = useSelector((s) => s.cart);
  const { ids } = useSelector((s) => s.wishlist);
  const { theme } = useSelector((s) => s.ui);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    setUserMenu(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-white/90 backdrop-blur-md dark:bg-emerald-950/90">
      <div className="container-px flex items-center justify-between gap-4 py-4">
        {/* Logo */}
        <Logo className="h-11 sm:h-14" />

        {/* Desktop nav */}
        {!minimal && (
          <nav className="hidden items-center gap-7 lg:flex">
            <NavLink to="/" className={navClass} end>
              Home
            </NavLink>
            {Object.keys(CATEGORY_GROUPS).map((group) => (
              <Dropdown key={group} label={group} items={CATEGORY_GROUPS[group]} />
            ))}
            <NavLink to="/shop" className={navClass}>
              Shop All
            </NavLink>
            <NavLink to="/contact" className={navClass}>
              Contact
            </NavLink>
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="icon-btn"
          >
            <FiSearch size={20} />
          </button>

          <button
            aria-label="Toggle theme"
            onClick={() => dispatch(toggleTheme())}
            className="icon-btn"
          >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          {!minimal && (
            <Link to="/wishlist" className="icon-btn relative" aria-label="Wishlist">
              <FiHeart size={20} />
              {ids.length > 0 && <Badge>{ids.length}</Badge>}
            </Link>
          )}

          {!minimal && (
            <Link to="/cart" className="icon-btn relative" aria-label="Cart">
              <FiShoppingBag size={20} />
              {summary.totalItems > 0 && <Badge>{summary.totalItems}</Badge>}
            </Link>
          )}

          {/* User */}
          <div className="relative">
            <button
              onClick={() =>
                isAuthenticated ? setUserMenu((o) => !o) : navigate("/login")
              }
              className="icon-btn"
              aria-label="Account"
            >
              <FiUser size={20} />
            </button>
            <AnimatePresence>
              {userMenu && isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gold/20 bg-white shadow-soft dark:bg-emerald-900"
                  onMouseLeave={() => setUserMenu(false)}
                >
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-emerald-800">
                    <p className="truncate font-medium">{user?.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-beige-light/60">
                      {user?.email}
                    </p>
                  </div>
                  <MenuLink to="/account" onClick={() => setUserMenu(false)}>
                    My Account
                  </MenuLink>
                  <MenuLink to="/account/orders" onClick={() => setUserMenu(false)}>
                    My Orders
                  </MenuLink>
                  {user?.role === "admin" && (
                    <MenuLink to="/admin" onClick={() => setUserMenu(false)}>
                      <FiGrid /> Admin Panel
                    </MenuLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-emerald-800"
                  >
                    <FiLogOut /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!minimal && (
            <button
              className="icon-btn lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <FiMenu size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Search overlay */}
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
              className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-6 dark:bg-emerald-950 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-serif text-xl font-bold text-emerald-900 dark:text-gold">
                  Menu
                </span>
                <button onClick={() => setMobileOpen(false)} className="icon-btn">
                  <FiX size={22} />
                </button>
              </div>
              <Link to="/" onClick={() => setMobileOpen(false)} className="mobile-link">
                Home
              </Link>
              {Object.entries(CATEGORY_GROUPS).map(([group, items]) => (
                <div key={group} className="mb-3">
                  <p className="mb-1 mt-3 font-serif text-lg font-semibold text-emerald-900 dark:text-gold">
                    {group}
                  </p>
                  {items.map((item) => (
                    <Link
                      key={item}
                      to={`/shop?category=${encodeURIComponent(item)}`}
                      onClick={() => setMobileOpen(false)}
                      className="block py-1.5 pl-3 text-sm text-gray-600 dark:text-beige-light/70"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              ))}
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="mobile-link">
                Shop All
              </Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="mobile-link">
                Contact
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .icon-btn { position: relative; padding: 0.4rem; border-radius: 9999px; transition: all .2s; }
        .icon-btn:hover { color: #d4af37; background: rgba(6,78,59,0.06); }
        .mobile-link { display:block; padding:0.6rem 0; font-weight:500; border-bottom:1px solid rgba(0,0,0,0.06); }
      `}</style>
    </header>
  );
};

const navClass = ({ isActive }) =>
  `text-sm font-medium transition-colors hover:text-gold ${
    isActive ? "text-gold" : "text-emerald-900 dark:text-beige-light"
  }`;

const Badge = ({ children }) => (
  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-emerald-950">
    {children}
  </span>
);

const MenuLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-beige-light dark:hover:bg-emerald-800"
  >
    {children}
  </Link>
);

const Dropdown = ({ label, items }) => (
  <div className="group relative">
    <button className="flex items-center text-sm font-medium text-emerald-900 transition-colors hover:text-gold dark:text-beige-light">
      {label}
    </button>
    <div className="invisible absolute left-1/2 top-full z-30 w-56 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
      <div className="overflow-hidden rounded-xl border border-gold/20 bg-white shadow-soft dark:bg-emerald-900">
        {items.map((item) => (
          <Link
            key={item}
            to={`/shop?category=${encodeURIComponent(item)}`}
            className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-beige-light hover:text-emerald-900 dark:text-beige-light/80 dark:hover:bg-emerald-800"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default Header;
