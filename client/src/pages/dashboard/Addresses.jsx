import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { loadUser } from "../../redux/slices/authSlice";

const empty = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

const Addresses = () => {
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    try {
      const { data } = await api.get("/users/addresses");
      setAddresses(data.addresses || []);
    } catch (err) {
      toast.error(err.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setEditing(addr._id);
    setForm({
      label: addr.label || "Home",
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      isDefault: Boolean(addr.isDefault),
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        label: form.label || "Home",
        fullName: form.fullName,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2 || "",
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country || "India",
        isDefault: Boolean(form.isDefault),
      };

      let res;
      if (editing) {
        res = await api.put(`/users/addresses/${editing}`, payload);
      } else {
        res = await api.post("/users/addresses", payload);
      }

      if (res.data?.addresses) {
        setAddresses(res.data.addresses);
      }
      toast.success(editing ? "Address updated successfully" : "Address added successfully");
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      dispatch(loadUser());
    } catch (err) {
      toast.error(err.message || "Failed to save address");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      if (res.data?.addresses) {
        setAddresses(res.data.addresses);
      } else {
        await load();
      }
      toast.success("Address removed successfully");
      dispatch(loadUser());
    } catch (err) {
      toast.error(err.message || "Failed to delete address");
    }
  };

  const field = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-espresso">
          Saved Addresses
        </h1>
        <button onClick={openNew} className="btn-primary px-4 py-2 text-sm">
          <FiPlus /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="card p-12 text-center bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <FiMapPin className="mx-auto text-5xl text-gold/60" />
          <p className="mt-4 text-taupe font-sans">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a._id} className="card relative p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
              {a.isDefault && (
                <span className="absolute right-3 top-3 rounded-full border border-gold bg-ivory px-2.5 py-0.5 text-[10px] font-semibold text-gold uppercase tracking-wider">
                  Default
                </span>
              )}
              <p className="font-serif text-base font-semibold text-espresso">{a.label}</p>
              <p className="mt-1 text-sm text-taupe font-sans leading-relaxed">
                {a.fullName} · {a.phone}<br />
                {a.line1}, {a.line2 && `${a.line2}, `}{a.city}<br />
                {a.state} – {a.postalCode}, {a.country}
              </p>
              <div className="mt-3 flex gap-3">
                <button onClick={() => openEdit(a)} className="flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
                  <FiEdit2 size={12} /> Edit
                </button>
                <button onClick={() => remove(a._id)} className="flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline">
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-xs" onClick={() => setShowForm(false)} />
          <div className="card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 bg-ivory border border-sand rounded-2xl shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-espresso">
                {editing ? "Edit Address" : "Add Address"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-taupe hover:text-espresso"><FiX size={22} /></button>
            </div>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <Input label="Label" value={form.label} onChange={field("label")} />
              <Input label="Full Name *" value={form.fullName} onChange={field("fullName")} required />
              <Input label="Phone *" value={form.phone} onChange={field("phone")} required />
              <Input label="Postal Code *" value={form.postalCode} onChange={field("postalCode")} required />
              <div className="sm:col-span-2">
                <Input label="Address Line 1 *" value={form.line1} onChange={field("line1")} required />
              </div>
              <div className="sm:col-span-2">
                <Input label="Address Line 2" value={form.line2} onChange={field("line2")} />
              </div>
              <Input label="City *" value={form.city} onChange={field("city")} required />
              <Input label="State *" value={form.state} onChange={field("state")} required />
              <label className="flex items-center gap-2 text-sm sm:col-span-2 text-espresso">
                <input type="checkbox" checked={form.isDefault} onChange={field("isDefault")} className="accent-[#B8935A]" />
                Set as default address
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary w-full">
                  {editing ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

export default Addresses;
