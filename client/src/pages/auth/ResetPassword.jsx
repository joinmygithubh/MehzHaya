import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import AuthShell from "../../components/auth/AuthShell";
import SEO from "../../components/common/SEO";
import api from "../../api/axios";
import { setUser } from "../../redux/slices/authSlice";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");
    setLoading(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, {
        password: form.password,
      });
      localStorage.setItem("mehzhaya_token", res.data.token);
      localStorage.setItem("mehzhaya_user", JSON.stringify(res.data.user));
      dispatch(setUser(res.data.user));
      toast.success("Password reset successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your new password"
      footer={
        <Link to="/login" className="font-medium text-gold-dark hover:underline">
          Back to login
        </Link>
      }
    >
      <SEO title="Reset Password" />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3 top-3.5 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input px-10"
              placeholder="At least 6 characters"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-3.5 text-gray-400">
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3 top-3.5 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              required
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="input pl-10"
              placeholder="Re-enter password"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
