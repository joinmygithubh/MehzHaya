import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiArrowLeft, FiX, FiUploadCloud } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { COLORS, MATERIALS } from "../../utils/constants";
import { fetchCategories } from "../../redux/slices/categorySlice";

const SIZES = ["XS", "S", "M", "L", "XL", "Free Size"];

const blank = {
  name: "",
  sku: "",
  description: "",
  shortDescription: "",
  price: "",
  discount: 0,
  category: "",
  material: "",
  stock: 0,
  isFeatured: false,
  isNewArrival: false,
  isTrending: false,
  isBestSeller: false,
  isFlashSale: false,
  isActive: true,
};

const AdminProductForm = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(blank);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [imageUrls, setImageUrls] = useState([]); // existing/url-based images
  const [files, setFiles] = useState([]); // new uploads
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/categories");
      setCategories(data.categories);
      if (isEdit) {
        try {
          const res = await api.get(`/products/${id}`);
          const p = res.data.product;
          setForm({
            name: p.name,
            sku: p.sku,
            description: p.description,
            shortDescription: p.shortDescription || "",
            price: p.price,
            discount: p.discount,
            category: p.category?._id || p.category,
            material: p.material,
            stock: p.stock,
            isFeatured: p.isFeatured,
            isNewArrival: p.isNewArrival,
            isTrending: p.isTrending,
            isBestSeller: p.isBestSeller,
            isFlashSale: p.isFlashSale,
            isActive: p.isActive,
          });
          setColors(p.colors || []);
          setSizes(p.sizes || []);
          setImageUrls(p.images.map((img) => img.url));
        } catch (err) {
          toast.error(err.message);
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const field = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const addUrl = () => {
    if (urlInput.trim()) {
      setImageUrls([...imageUrls, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category) return toast.error("Please select a category");
    if (imageUrls.length === 0 && files.length === 0)
      return toast.error("Please add at least one image");

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("colors", JSON.stringify(colors));
      fd.append("sizes", JSON.stringify(sizes));
      if (imageUrls.length) fd.append("images", JSON.stringify(imageUrls));
      files.forEach((f) => fd.append("images", f));

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isEdit) await api.put(`/products/${id}`, fd, config);
      else await api.post("/products", fd, config);

      dispatch(fetchCategories());
      toast.success(isEdit ? "Product updated" : "Product created");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
        <FiArrowLeft /> Back to products
      </Link>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-espresso">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card space-y-4 p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
            <Input label="Product Name *" value={form.name} onChange={field("name")} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="SKU *" value={form.sku} onChange={field("sku")} required placeholder="MH-HJ-001" />
              <div>
                <label className="label">Category *</label>
                <select value={form.category} onChange={field("category")} className="input" required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.group})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Short Description</label>
              <input className="input" value={form.shortDescription} onChange={field("shortDescription")} />
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea rows={4} className="input resize-none" value={form.description} onChange={field("description")} required />
            </div>
          </div>

          {/* Images */}
          <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
            <label className="label">Product Images</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative h-24 w-20">
                  <img src={url} alt="" className="h-full w-full rounded-xl object-cover bg-champagne border border-sand/60" />
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-terracotta p-1 text-ivory">
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              {files.map((f, i) => (
                <div key={i} className="relative h-24 w-20">
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full rounded-xl object-cover bg-champagne border border-sand/60" />
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-terracotta p-1 text-ivory">
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste image URL"
                className="input"
              />
              <button type="button" onClick={addUrl} className="btn-outline whitespace-nowrap px-4 py-2 text-sm">
                Add URL
              </button>
            </div>

            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sand/80 bg-ivory/50 py-4 text-sm text-taupe hover:border-gold hover:text-espresso transition-all">
              <FiUploadCloud /> Upload images (Cloudinary)
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
              />
            </label>
          </div>
        </div>

        {/* Side */}
        <div className="space-y-4">
          <div className="card space-y-4 p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (₹) *" type="number" value={form.price} onChange={field("price")} required />
              <Input label="Discount (%)" type="number" value={form.discount} onChange={field("discount")} />
            </div>
            <Input label="Stock *" type="number" value={form.stock} onChange={field("stock")} required />
            <div>
              <label className="label">Material</label>
              <select value={form.material} onChange={field("material")} className="input">
                <option value="">Select</option>
                {MATERIALS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
            <label className="label">Colors</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => toggle(colors, setColors, c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${colors.includes(c) ? "border-gold bg-gold text-espresso font-semibold shadow-xs" : "border-sand text-taupe hover:border-gold hover:text-espresso"}`}>
                  {c}
                </button>
              ))}
            </div>
            <label className="label mt-4">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button key={s} type="button" onClick={() => toggle(sizes, setSizes, s)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${sizes.includes(s) ? "border-gold bg-gold text-espresso font-semibold shadow-xs" : "border-sand text-taupe hover:border-gold hover:text-espresso"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-2 p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
            <label className="label">Marketing Flags</label>
            {[
              ["isFeatured", "Featured"],
              ["isNewArrival", "New Arrival"],
              ["isTrending", "Trending"],
              ["isBestSeller", "Best Seller"],
              ["isFlashSale", "Flash Sale"],
              ["isActive", "Active (visible)"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-espresso">
                <input type="checkbox" checked={form[key]} onChange={field(key)} className="accent-[#B8935A]" />
                {label}
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

export default AdminProductForm;
