import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiRotateCcw, FiSearch, FiAlertTriangle } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice, finalPrice } from "../../utils/helpers";
import { fetchCategories } from "../../redux/slices/categorySlice";
import {
  deleteProduct,
  restoreProduct,
  permanentDeleteProduct,
  fetchHomeSections,
} from "../../redux/slices/productSlice";

const AdminProducts = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/products/admin/all");
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Hide/Soft-delete this product from store? (Cloudinary images will be kept so it can be restored)"))
      return;
    try {
      const res = await dispatch(deleteProduct(id));
      if (deleteProduct.fulfilled.match(res)) {
        toast.success("Product soft-deleted");
        setProducts((list) =>
          list.map((x) =>
            x._id === id ? { ...x, isDeleted: true, isActive: false } : x
          )
        );
        dispatch(fetchCategories());
        dispatch(fetchHomeSections());
      } else {
        toast.error(res.payload || "Could not soft-delete product");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await dispatch(restoreProduct(id));
      if (restoreProduct.fulfilled.match(res)) {
        toast.success("Product restored to store!");
        setProducts((list) =>
          list.map((x) =>
            x._id === id ? { ...x, isDeleted: false, isActive: true } : x
          )
        );
        dispatch(fetchCategories());
        dispatch(fetchHomeSections());
      } else {
        toast.error(res.payload || "Could not restore product");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePermanentDelete = async (id, name) => {
    if (
      !window.confirm(
        `PERMANENT DELETION WARNING:\n\nAre you sure you want to PERMANENTLY delete "${name}"?\nThis will remove the product document and delete its Cloudinary images forever.`
      )
    )
      return;

    try {
      const res = await dispatch(permanentDeleteProduct(id));
      if (permanentDeleteProduct.fulfilled.match(res)) {
        toast.success("Product permanently deleted");
        setProducts((list) => list.filter((x) => x._id !== id));
        dispatch(fetchCategories());
        dispatch(fetchHomeSections());
      } else {
        toast.error(res.payload || "Could not permanently delete product");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader full />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-espresso">
          Products ({products.length})
        </h1>
        <Link to="/admin/products/new" className="btn-primary px-4 py-2 text-sm">
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3 top-3 text-taupe" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input pl-10"
        />
      </div>

      <div className="card overflow-x-auto bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="border-b border-sand/60 bg-champagne/80 text-left font-serif text-espresso">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p._id}
                className={`border-b border-sand/40 transition-colors ${
                  p.isDeleted
                    ? "bg-blush/30 text-taupe"
                    : "hover:bg-champagne/40 text-espresso"
                }`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images?.[0]?.url}
                      alt=""
                      className="h-12 w-10 rounded-lg object-cover bg-champagne border border-sand/60"
                    />
                    <div>
                      <span className="line-clamp-1 max-w-[200px] font-medium font-serif">
                        {p.name}
                      </span>
                      <span className="text-xs text-taupe block font-sans">
                        {p.images?.length || 0} images
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-taupe">{p.categoryName}</td>
                <td className="p-3 font-semibold text-espresso">
                  {formatPrice(finalPrice(p))}
                </td>
                <td className="p-3">
                  {p.isDeleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-terracotta/20 text-terracotta border border-terracotta/30">
                      Soft-Deleted
                    </span>
                  ) : p.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage/20 text-sage border border-sage/30">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sand/40 text-taupe border border-sand">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={
                      p.stock < 5 ? "font-semibold text-terracotta" : "text-espresso"
                    }
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end items-center gap-1.5">
                    <Link
                      to={`/admin/products/${p._id}/edit`}
                      title="Edit Product"
                      className="rounded-lg p-2 text-gold hover:bg-gold/15 transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </Link>

                    {p.isDeleted ? (
                      <button
                        type="button"
                        onClick={() => handleRestore(p._id)}
                        title="Restore Product to Store"
                        className="rounded-lg p-2 text-sage hover:bg-sage/20 transition-colors"
                      >
                        <FiRotateCcw size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSoftDelete(p._id)}
                        title="Soft Delete Product"
                        className="rounded-lg p-2 text-taupe hover:bg-sand/40 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePermanentDelete(p._id, p.name)}
                      title="Permanently Delete Product & Cloudinary Images"
                      className="rounded-lg p-2 text-terracotta hover:bg-blush/60 transition-colors"
                    >
                      <FiAlertTriangle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-taupe">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
