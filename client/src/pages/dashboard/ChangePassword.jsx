import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm)
      return toast.error("New passwords do not match");
    if (form.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="card max-w-lg p-8">
      <h1 className="font-serif text-2xl font-semibold text-emerald-900 dark:text-gold">
        Change Password
      </h1>
      <p className="mt-1 text-sm text-gray-500">Keep your account secure</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Current Password</label>
          <input type="password" required value={form.currentPassword} onChange={field("currentPassword")} className="input" />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" required value={form.newPassword} onChange={field("newPassword")} className="input" />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input type="password" required value={form.confirm} onChange={field("confirm")} className="input" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
