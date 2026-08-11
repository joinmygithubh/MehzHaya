import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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

import { toast } from "react-toastify";

import { toggleTheme } from "../../redux/slices/uiSlice";
import { logout, clearAuth } from "../../redux/slices/authSlice";
import SearchBar from "./SearchBar";
import Logo from "../common/Logo";

const Header = ({ minimal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { summary } = useSelector((s) => s.cart);
  const { ids } = useSelector((s) => s.wishlist);
  const { theme } = useSelector((s) => s.ui);
  const { grouped: categoryGroups } = useSelector((s) => s.categories);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setUserMenu(false);
    document.body.style.overflow = "auto";
  };

  const openMobileMenu = () => {
    setMobileOpen(true);
  };

  const handleNav = (path) => {
    closeMobileMenu();
    setTimeout(() => {
      if (path) {
        navigate(path);
      }
    }, 0);
  };

  // Automatically close drawer & user menu on route changes
  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
    document.body.style.overflow = "auto";
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen && !minimal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen, minimal]);

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeMobileMenu();

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
    <header className="sticky top-0 z-40 border-b border-sand/80 bg-ivory">
      <div className="container-px flex items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
        {/* Logo */}
        <Logo className="h-12 sm:h-14 lg:h-[64px]" />

        {/* Desktop nav (laptop / desktop ≥1024) */}
        {!minimal && (
          <nav className="hidden items-center gap-4 lg:flex xl:gap-7">
            <NavLink to="/" className={navClass} end>
              Home
            </NavLink>
            {Object.keys(categoryGroups).map((group) => (
              <Dropdown key={group} label={group} items={categoryGroups[group]} />
            ))}
            <NavLink to="/shop" className={navClass}>
              Shop All
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About Us
            </NavLink>
            <NavLink to="/contact" className={navClass}>
              Contact
            </NavLink>
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="icon-btn"
          >
            <FiSearch size={20} />
          </button>

          {/* Wishlist — hidden on the smallest screens (available in the drawer) */}
          {!minimal && (
            <Link
              to="/wishlist"
              className="icon-btn relative hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <FiHeart size={20} />
              {ids.length > 0 && <Badge>{ids.length}</Badge>}
            </Link>
          )}

          {/* Cart — always visible */}
          {!minimal && (
            <Link to="/cart" className="icon-btn relative" aria-label="Cart">
              <FiShoppingBag size={20} />
              {summary.totalItems > 0 && <Badge>{summary.totalItems}</Badge>}
            </Link>
          )}

          {/* User menu — hidden on the smallest screens (available in the drawer) */}
          <div className="relative hidden sm:block">
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
                  key="user-dropdown-menu"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-sand bg-ivory shadow-soft"
                  onMouseLeave={() => setUserMenu(false)}
                >
                  <div className="border-b border-sand/60 px-4 py-3">
                    <p className="truncate font-medium text-espresso">{user?.name}</p>
                    <p className="truncate text-xs text-taupe">
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
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-terracotta hover:bg-blush/40"
                  >
                    <FiLogOut /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger — mobile & tablet only (<1024) */}
          {!minimal && (
            <button
              className="icon-btn lg:hidden"
              onClick={openMobileMenu}
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Search overlay */}
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile / tablet drawer — only when open on non-minimal layout */}
      {!minimal && mobileOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-xs lg:hidden"
            onClick={closeMobileMenu}
          />

          {/* Drawer sidebar */}
          <aside className="fixed right-0 top-0 z-[60] flex h-full w-80 max-w-[85%] flex-col overflow-y-auto bg-ivory p-6 shadow-soft lg:hidden">
            <div className="mb-4 flex items-center justify-between border-b border-sand/40 pb-3">
              <Link to="/" onClick={(e) => { e.preventDefault(); handleNav("/"); }}>
                <Logo className="h-8" />
              </Link>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="relative z-[70] icon-btn"
                aria-label="Close menu"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Account / quick actions */}
            <div className="mb-4 border-b border-sand pb-4">
              {isAuthenticated ? (
                <>
                  <p className="text-sm font-medium text-espresso">
                    Hello, {user?.name?.split(" ")[0]} 👋
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link to="/account" onClick={(e) => { e.preventDefault(); handleNav("/account"); }} className="drawer-chip">
                      <FiUser size={15} /> Account
                    </Link>
                    <Link to="/account/orders" onClick={(e) => { e.preventDefault(); handleNav("/account/orders"); }} className="drawer-chip">
                      <FiShoppingBag size={15} /> Orders
                    </Link>
                    <Link to="/wishlist" onClick={(e) => { e.preventDefault(); handleNav("/wishlist"); }} className="drawer-chip">
                      <FiHeart size={15} /> Wishlist {ids.length > 0 && `(${ids.length})`}
                    </Link>
                    {user?.role === "admin" && (
                      <Link to="/admin" onClick={(e) => { e.preventDefault(); handleNav("/admin"); }} className="drawer-chip">
                        <FiGrid size={15} /> Admin
                      </Link>
                    )}
                    <button onClick={handleLogout} className="drawer-chip text-terracotta hover:bg-blush/40">
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNav("/login")}
                    className="btn-primary flex items-center justify-center px-3 py-2 text-sm text-center cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav("/register")}
                    className="btn-outline flex items-center justify-center px-3 py-2 text-sm text-center cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <Link to="/" onClick={(e) => { e.preventDefault(); handleNav("/"); }} className="mobile-link">
              Home
            </Link>
            {Object.entries(categoryGroups).map(([group, items]) => (
              <div key={group} className="mb-3">
                <Link
                  to={`/shop?group=${encodeURIComponent(group)}`}
                  onClick={(e) => { e.preventDefault(); handleNav(`/shop?group=${encodeURIComponent(group)}`); }}
                  className="mb-1 mt-3 block font-serif text-lg font-semibold text-espresso hover:text-gold hover:underline hover:underline-offset-4 hover:decoration-gold/80"
                >
                  {group}
                </Link>
                {items.map((item) => (
                  <Link
                    key={item}
                    to={`/shop?category=${encodeURIComponent(item)}`}
                    onClick={(e) => { e.preventDefault(); handleNav(`/shop?category=${encodeURIComponent(item)}`); }}
                    className="block py-1.5 pl-3 text-sm text-taupe hover:text-gold hover:underline hover:underline-offset-4 hover:decoration-gold/80"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            ))}
            <Link to="/shop" onClick={(e) => { e.preventDefault(); handleNav("/shop"); }} className="mobile-link">
              Shop All
            </Link>
            <Link to="/about" onClick={(e) => { e.preventDefault(); handleNav("/about"); }} className="mobile-link">
              About Us
            </Link>
            <Link to="/contact" onClick={(e) => { e.preventDefault(); handleNav("/contact"); }} className="mobile-link">
              Contact
            </Link>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-2 py-2 text-sm font-medium text-terracotta hover:underline hover:underline-offset-4"
              >
                <FiLogOut size={16} /> Logout
              </button>
            )}
          </aside>
        </>
      )}
    </header>
  );
};

const navClass = ({ isActive }) =>
  `font-sans text-[15px] font-normal leading-[1.45] tracking-[0.4px] transition-colors duration-300 ease-in-out hover:text-gold ${
    isActive
      ? "text-gold underline decoration-2 underline-offset-4 decoration-gold font-normal"
      : "text-[#1F1F1F]"
  }`;

const Badge = ({ children }) => (
  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-espresso">
    {children}
  </span>
);

const MenuLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 font-sans text-[14px] font-normal tracking-[0.3px] text-[#1F1F1F] transition-colors duration-300 ease-in-out hover:bg-champagne/60 hover:text-gold"
  >
    {children}
  </Link>
);

const Dropdown = ({ label, items }) => (
  <div className="group relative">
    <button className="flex items-center font-sans text-[15px] font-normal leading-[1.45] tracking-[0.4px] text-[#1F1F1F] transition-colors duration-300 ease-in-out hover:text-gold">
      {label}
    </button>
    <div className="invisible absolute left-1/2 top-full z-30 w-56 -translate-x-1/2 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
      <div className="overflow-hidden rounded-xl border border-sand bg-ivory shadow-soft">
        {items.map((item) => (
          <Link
            key={item}
            to={`/shop?category=${encodeURIComponent(item)}`}
            className="block px-4 py-2.5 font-sans text-[14px] font-normal tracking-[0.3px] text-[#1F1F1F] transition-colors duration-300 ease-in-out hover:bg-champagne/60 hover:text-gold"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default Header;
