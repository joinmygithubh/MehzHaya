import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const STATUSES = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", { params: filter ? { status: filter } : {} });
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      toast.success("Status updated");
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      if (selected?._id === orderId) setSelected(data.order);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-espresso">
          Orders ({orders.length})
        </h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto py-2 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-sand/60 bg-champagne/80 text-left font-serif text-espresso">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} onClick={() => setSelected(o)} className="cursor-pointer border-b border-sand/40 hover:bg-champagne/40 text-espresso transition-colors">
                  <td className="p-3 font-mono font-semibold">{o.orderId}</td>
                  <td className="p-3 font-medium">{o.user?.name || "—"}</td>
                  <td className="p-3 text-taupe">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-semibold">{formatPrice(o.totalPrice)}</td>
                  <td className="p-3 text-xs text-taupe">{o.paymentMethod}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.orderStatus}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="rounded-lg border border-sand bg-ivory text-espresso px-2 py-1 text-xs font-medium"
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="py-10 text-center text-sm text-taupe">No orders found.</p>}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-xs" onClick={() => setSelected(null)} />
          <div className="card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 bg-ivory border border-sand rounded-2xl shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-lg font-semibold text-espresso">{selected.orderId}</h2>
              <button onClick={() => setSelected(null)} className="text-taupe hover:text-espresso"><FiX size={22} /></button>
            </div>
            <div className="space-y-3">
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <img src={item.image} alt="" className="h-12 w-10 rounded-lg object-cover bg-champagne" />
                  <div className="flex-1">
                    <p className="font-serif font-semibold text-espresso">{item.name}</p>
                    <p className="text-taupe text-xs">Qty: {item.quantity} {item.color && `· ${item.color}`}</p>
                  </div>
                  <span className="font-semibold text-espresso">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-sand/60 pt-4 text-sm">
              <p className="font-serif font-semibold text-espresso">Ship to:</p>
              <p className="text-taupe mt-1">
                {selected.shippingAddress.fullName}, {selected.shippingAddress.phone}<br />
                {selected.shippingAddress.line1}, {selected.shippingAddress.city}, {selected.shippingAddress.state} – {selected.shippingAddress.postalCode}
              </p>
              <div className="mt-3 flex justify-between text-lg font-bold text-espresso">
                <span>Total</span>
                <span className="text-gold">{formatPrice(selected.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
