import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from "react-icons/fi";

import AuthShell from "../../components/auth/AuthShell";
import SEO from "../../components/common/SEO";
import { register } from "../../redux/slices/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.phone.trim())
      return toast.error("Phone number is required");
    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { confirm, ...payload } = form;
    const res = await dispatch(register(payload));
    setLoading(false);
    if (register.fulfilled.match(res)) {
      toast.success("Account created! Please check your email to verify.");
      navigate("/");
    } else {
      toast.error(res.payload || "Registration failed");
    }
  };

  const field = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join the MehzHaya family today"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SEO title="Register" />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <FiUser className="pointer-events-none absolute left-3 top-3.5 text-taupe" />
            <input required value={form.name} onChange={field("name")} className="input pl-10" placeholder="Your name" />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3 top-3.5 text-taupe" />
            <input type="email" required value={form.email} onChange={field("email")} className="input pl-10" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="label">Phone Number</label>
          <div className="relative">
            <FiPhone className="pointer-events-none absolute left-3 top-3.5 text-taupe" />
            <input
              type="tel"
              required
              value={form.phone}
              onChange={field("phone")}
              className="input pl-10"
              placeholder="10-digit phone number"
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3 top-3.5 text-taupe" />
            <input
              type={show ? "text" : "password"}
              required
              value={form.password}
              onChange={field("password")}
              className="input px-10"
              placeholder="At least 6 characters"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-3.5 text-taupe hover:text-espresso">
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3 top-3.5 text-taupe" />
            <input
              type={show ? "text" : "password"}
              required
              value={form.confirm}
              onChange={field("confirm")}
              className="input pl-10"
              placeholder="Re-enter password"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;
