import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiMail } from "react-icons/fi";

import AuthShell from "../../components/auth/AuthShell";
import SEO from "../../components/common/SEO";
import api from "../../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="We'll send you a reset link"
      footer={
        <Link to="/login" className="font-semibold text-gold hover:underline">
          Back to login
        </Link>
      }
    >
      <SEO title="Forgot Password" />
      {sent ? (
        <div className="rounded-xl bg-blush/60 border border-sand p-4 text-sm text-espresso">
          A password reset link has been sent to <strong>{email}</strong>. Please
          check your inbox (and spam folder).
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-3.5 text-taupe" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
