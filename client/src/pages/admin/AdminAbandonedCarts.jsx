import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiShoppingCart, FiRefreshCw, FiDollarSign, FiPercent, FiClock, FiCheckCircle } from "react-icons/fi";
import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const AdminAbandonedCarts = () => {
  const [data, setData] = useState({ stats: {}, carts: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart/admin/abandoned");
      setData(res.data || { stats: {}, carts: [] });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader full />;

  const { stats, carts } = data;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-espresso">
            Abandoned Cart Recovery
          </h1>
          <p className="text-sm text-taupe mt-0.5">Track inactive shopping carts and automated recovery campaigns.</p>
        </div>
        <button onClick={loadData} className="btn-outline px-3 py-2 text-sm flex items-center gap-1.5">
          <FiRefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">Abandoned Carts</span>
            <FiShoppingCart className="text-gold text-xl" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso">{stats.totalAbandoned || 0}</p>
        </div>

        <div className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">Recovered Rate</span>
            <FiPercent className="text-gold text-xl" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso">{stats.recoveryRate || 0}%</p>
        </div>

        <div className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">Recovered Orders</span>
            <FiCheckCircle className="text-gold text-xl" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso">{stats.recoveredCount || 0}</p>
        </div>

        <div className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">Recovered Revenue</span>
            <FiDollarSign className="text-gold text-xl" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso">{formatPrice(stats.recoveredRevenue || 0)}</p>
        </div>
      </div>

      {/* Carts Table */}
      {carts.length === 0 ? (
        <div className="card p-12 text-center bg-champagne/40 border border-sand">
          <FiShoppingCart className="mx-auto text-5xl text-gold/60 mb-2" />
          <p className="font-serif text-lg text-espresso">No abandoned carts detected.</p>
        </div>
      ) : (
        <div className="card overflow-hidden bg-ivory border border-sand/80 rounded-xl shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand bg-champagne/60 text-xs font-semibold uppercase text-taupe">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">Abandoned At</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/50">
              {carts.map((c) => {
                const total = c.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
                return (
                  <tr key={c._id} className="hover:bg-champagne/30 transition">
                    <td className="p-4 font-medium text-espresso">
                      <div>{c.user?.name || "Guest User"}</div>
                      <div className="text-xs text-taupe">{c.user?.email || "N/A"}</div>
                    </td>
                    <td className="p-4 text-xs text-espresso">
                      {c.items?.map((it, idx) => (
                        <div key={idx}>{it.name} (x{it.quantity})</div>
                      ))}
                    </td>
                    <td className="p-4 font-semibold text-espresso">{formatPrice(total)}</td>
                    <td className="p-4 text-xs text-taupe">
                      {c.abandonedAt ? new Date(c.abandonedAt).toLocaleString() : "N/A"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.recoveryStatus === "Recovered"
                          ? "bg-emerald-500/15 text-emerald-700 border border-emerald-300"
                          : "bg-gold/15 text-espresso border border-gold/40"
                      }`}>
                        {c.recoveryStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAbandonedCarts;
