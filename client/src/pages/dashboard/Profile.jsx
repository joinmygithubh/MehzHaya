import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import api from "../../api/axios";
import { updateProfile } from "../../redux/slices/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await dispatch(updateProfile(form));
    setLoading(false);
    if (updateProfile.fulfilled.match(res)) toast.success("Profile updated");
    else toast.error(res.payload || "Update failed");
  };

  const resendVerification = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-verification");
      toast.success("Verification email sent");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="card p-8">
      <h1 className="font-serif text-2xl font-semibold text-emerald-900 dark:text-gold">
        My Profile
      </h1>
      <p className="mt-1 text-sm text-gray-500">Manage your personal information</p>

      {!user?.isEmailVerified && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-orange-50 p-4 text-sm dark:bg-emerald-900/40">
          <span className="text-orange-700 dark:text-orange-300">
            Please verify your email address.
          </span>
          <button
            onClick={resendVerification}
            disabled={resending}
            className="font-medium text-gold-dark hover:underline"
          >
            {resending ? "Sending..." : "Resend link"}
          </button>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input"
            placeholder="9876543210"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input value={user?.email || ""} disabled className="input opacity-60" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
