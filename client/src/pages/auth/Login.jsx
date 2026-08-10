import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

import AuthShell from "../../components/auth/AuthShell";
import SEO from "../../components/common/SEO";
import { login, googleLogin } from "../../redux/slices/authSlice";
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
  const tokenClientRef = useRef(null);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "531694371899-278oi1b70rcojr5mqa9vqibnmqlen069.apps.googleusercontent.com";

  useEffect(() => {
    // Initialize Google OAuth Token Client for custom button trigger
    const initTokenClient = () => {
      if (window.google?.accounts?.oauth2) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "email profile openid",
            callback: async (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                setLoading(true);
                try {
                  const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  }).then((r) => r.json());

                  if (!userInfo.email) {
                    throw new Error("Could not retrieve email from Google account");
                  }

                  const res = await dispatch(
                    googleLogin({
                      email: userInfo.email,
                      name: userInfo.name,
                      picture: userInfo.picture,
                      googleId: userInfo.sub,
                      token: tokenResponse.access_token,
                    })
                  );
                  setLoading(false);

                  if (googleLogin.fulfilled.match(res)) {
                    dispatch(fetchCart());
                    dispatch(fetchWishlist());
                    navigate(res.payload.user?.role === "admin" ? "/admin" : from, { replace: true });
                  } else {
                    toast.error(res.payload || "Google sign in failed");
                  }
                } catch (err) {
                  setLoading(false);
                  toast.error(err.message || "Google verification failed");
                }
              } else if (tokenResponse?.error) {
                toast.error(`Google Login: ${tokenResponse.error}`);
              }
            },
          });
        } catch (e) {
          console.warn("GIS TokenClient Init Error:", e);
        }
      }
    };

    if (window.google?.accounts?.oauth2) {
      initTokenClient();
    } else {
      const timer = setTimeout(initTokenClient, 800);
      return () => clearTimeout(timer);
    }
  }, [clientId, dispatch, navigate, from]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await dispatch(login(form));
    setLoading(false);
    if (login.fulfilled.match(res)) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      navigate(res.payload.user.role === "admin" ? "/admin" : from, { replace: true });
    } else {
      toast.error(res.payload || "Login failed");
    }
  };

  const handleGoogleSignIn = () => {
    // 1. If GIS Token Client is ready, request access token popup
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
      return;
    }

    // 2. If GIS `oauth2` initialized directly
    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile openid",
        callback: async (tokenResponse) => {
          if (tokenResponse?.access_token) {
            setLoading(true);
            try {
              const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              }).then((r) => r.json());

              const res = await dispatch(
                googleLogin({
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture,
                  googleId: userInfo.sub,
                  token: tokenResponse.access_token,
                })
              );
              setLoading(false);
              if (googleLogin.fulfilled.match(res)) {
                dispatch(fetchCart());
                dispatch(fetchWishlist());
                navigate(res.payload.user?.role === "admin" ? "/admin" : from, { replace: true });
              } else {
                toast.error(res.payload || "Google login failed");
              }
            } catch (err) {
              setLoading(false);
              toast.error(err.message || "Failed to authenticate with Google");
            }
          }
        },
      });
      client.requestAccessToken();
      return;
    }

    // 3. One-tap fallback prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    // 4. Fallback if GIS script is not yet loaded
    toast.error("Google Sign-In is initializing. Please try again in a moment.");
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue shopping"
      imageSrc="/images/login-auth-ultra.jpg"
      imageAlt="MehzHaya Luxury Hijab Atelier"
      imageSrcSet="/images/login-auth-ultra.jpg 1920w"
      imageSizes="(max-width: 768px) 100vw, 50vw"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-gold hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <SEO title="Login" />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative flex items-center">
            <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
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
          <div className="relative flex items-center">
            <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-espresso flex items-center justify-center p-1 focus:outline-none transition-colors"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-gold hover:underline">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-sand/70" />
          <span className="absolute bg-champagne/80 px-3 text-xs font-medium text-taupe uppercase tracking-wider">
            or
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-espresso font-medium text-sm rounded-xl border border-gray-200 shadow-xs hover:bg-ivory hover:shadow-soft transition-all duration-300 active:scale-[0.99]"
        >
          <FcGoogle size={20} />
          <span>Continue with Google</span>
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
