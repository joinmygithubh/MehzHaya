import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const blank = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minPurchase: 0,
  maxDiscount: 0,
  expiresAt: "",
  usageLimit: 0,
  isActive: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);

  const load = async () => {
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data.coupons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/coupons", form);
      toast.success("Coupon created");
      setShowForm(false);
      setForm(blank);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const field = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  if (loading) return <Loader full />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 dark:text-gold">
          Coupons ({coupons.length})
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-sm">
          <FiPlus /> Add Coupon
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => {
          const expired = new Date(c.expiresAt) < new Date();
          return (
            <div key={c._id} className="card relative overflow-hidden p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-lg font-bold text-emerald-900 dark:text-gold">{c.code}</p>
                  <p className="text-xs text-gray-500">{c.description}</p>
                </div>
                <button onClick={() => remove(c._id)} className="text-red-500"><FiTrash2 size={16} /></button>
              </div>
              <p className="mt-3 text-2xl font-bold text-gold-dark">
                {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} OFF`}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Min purchase: {formatPrice(c.minPurchase)} · Used: {c.usedCount}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${expired || !c.isActive ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                  {expired ? "Expired" : c.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-[10px] text-gray-400">
                  Exp: {new Date(c.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="card relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-emerald-900 dark:text-gold">Add Coupon</h2>
              <button onClick={() => setShowForm(false)}><FiX size={22} /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="label">Code *</label>
                <input className="input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" value={form.description} onChange={field("description")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.discountType} onChange={field("discountType")}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Value *</label>
                  <input type="number" className="input" value={form.discountValue} onChange={field("discountValue")} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Min Purchase (₹)</label>
                  <input type="number" className="input" value={form.minPurchase} onChange={field("minPurchase")} />
                </div>
                <div>
                  <label className="label">Max Discount (₹)</label>
                  <input type="number" className="input" value={form.maxDiscount} onChange={field("maxDiscount")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Expires At *</label>
                  <input type="date" className="input" value={form.expiresAt} onChange={field("expiresAt")} required />
                </div>
                <div>
                  <label className="label">Usage Limit (0=∞)</label>
                  <input type="number" className="input" value={form.usageLimit} onChange={field("usageLimit")} />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Create Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
