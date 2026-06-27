import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";

const GROUPS = ["Hijabs", "Islamic Wear", "Accessories"];

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", group: "Hijabs", description: "", image: "" });

  const load = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.categories);
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
      await api.post("/categories", form);
      toast.success("Category created");
      setShowForm(false);
      setForm({ name: "", group: "Hijabs", description: "", image: "" });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader full />;

  const grouped = categories.reduce((acc, c) => {
    (acc[c.group] = acc[c.group] || []).push(c);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 dark:text-gold">
          Categories ({categories.length})
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-sm">
          <FiPlus /> Add Category
        </button>
      </div>

      {GROUPS.map((group) => (
        <div key={group} className="mb-6">
          <h2 className="mb-3 font-serif text-lg font-semibold text-gold-dark">{group}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(grouped[group] || []).map((c) => (
              <div key={c._id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-emerald-900 dark:text-gold">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.productCount} products</p>
                </div>
                <button onClick={() => remove(c._id)} className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-emerald-800">
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="card relative z-10 w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-emerald-900 dark:text-gold">Add Category</h2>
              <button onClick={() => setShowForm(false)}><FiX size={22} /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Group *</label>
                <select className="input" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                  {GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full">Create Category</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
