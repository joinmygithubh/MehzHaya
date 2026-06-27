import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice, finalPrice } from "../../utils/helpers";

const AdminProducts = () => {
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

  const remove = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      setProducts((p) => p.filter((x) => x._id !== id));
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
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 dark:text-gold">
          Products ({products.length})
        </h1>
        <Link to="/admin/products/new" className="btn-primary px-4 py-2 text-sm">
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input pl-10"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-beige/50 text-left dark:border-emerald-800 dark:bg-emerald-900/40">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Sold</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-beige/30 dark:border-emerald-800/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url} alt="" className="h-12 w-10 rounded object-cover" />
                    <span className="line-clamp-1 max-w-[200px] font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-500">{p.categoryName}</td>
                <td className="p-3 font-medium">{formatPrice(finalPrice(p))}</td>
                <td className="p-3">
                  <span className={p.stock < 5 ? "font-semibold text-red-500" : ""}>{p.stock}</span>
                </td>
                <td className="p-3 text-gray-500">{p.sold}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/products/${p._id}/edit`} className="rounded p-2 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-800">
                      <FiEdit2 size={16} />
                    </Link>
                    <button onClick={() => remove(p._id)} className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-emerald-800">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
