import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import AuthShell from "../../components/auth/AuthShell";
import SEO from "../../components/common/SEO";
import { login } from "../../redux/slices/authSlice";
import { fetchCart } from "../../redux/slices/cartSlice";
import { fetchWishlist } from "../../redux/slices/wishlistSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await dispatch(login(form));
    setLoading(false);
    if (login.fulfilled.match(res)) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      toast.success("Welcome back!");
      navigate(res.payload.user.role === "admin" ? "/admin" : from, { replace: true });
    } else {
      toast.error(res.payload || "Login failed");
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue shopping"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-gold-dark hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <SEO title="Login" />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3 top-3.5 text-gray-400" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input pl-10"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3 top-3.5 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input px-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-3.5 text-gray-400"
            >
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-gold-dark hover:underline">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-4 rounded-lg bg-beige p-3 text-xs text-gray-600 dark:bg-emerald-900/40 dark:text-beige-light/70">
        <p className="font-medium">Demo accounts:</p>
        <p>Customer: customer@mehzhaya.com / Customer@123</p>
        <p>Admin: admin@mehzhaya.com / Admin@12345</p>
      </div>
    </AuthShell>
  );
};

export default Login;
