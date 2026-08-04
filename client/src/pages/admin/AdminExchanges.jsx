import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import SEO from "../../components/common/SEO";

const STATUSES = [
  "EXCHANGE_REQUESTED",
  "EXCHANGE_APPROVED",
  "PRODUCT_PICKUP_PENDING",
  "PRODUCT_RECEIVED",
  "NEW_PRODUCT_SHIPPED",
  "EXCHANGE_COMPLETED",
  "EXCHANGE_REJECTED",
  "EXCHANGE_CANCELLED",
];

const AdminExchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExchange, setSelectedExchange] = useState(null);

  const fetchExchanges = async () => {
    try {
      const { data } = await api.get("/exchanges/admin/all");
      setExchanges(data.exchanges);
    } catch (err) {
      toast.error(err.message || "Failed to load exchange requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/exchanges/admin/${id}`, { status });
      toast.success(`Exchange status updated to ${status}`);
      fetchExchanges();
      if (selectedExchange?._id === id) {
        setSelectedExchange((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update exchange status");
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <SEO title="Admin Size Exchanges" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-espresso">Size Exchange Management</h1>
          <p className="text-xs text-taupe">Review, approve, and manage customer size exchange requests.</p>
        </div>
        <span className="rounded-full bg-champagne px-3 py-1 text-xs font-semibold text-espresso border border-sand">
          Total Exchanges: {exchanges.length}
        </span>
      </div>

      {exchanges.length === 0 ? (
        <div className="card p-12 text-center text-taupe bg-champagne/30 rounded-2xl border border-sand">
          No size exchange requests found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exchanges.map((ex) => (
            <div
              key={ex._id}
              className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-espresso bg-sand/40 px-2 py-0.5 rounded">
                    Order ID: {ex.order?.orderId || ex.order?._id || "N/A"}
                  </span>
                  <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-900 border border-indigo-300">
                    {ex.status}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-espresso">Customer: {ex.user?.name || "N/A"}</p>
                <p className="text-xs text-taupe">{ex.user?.email || "No email"} {ex.user?.phone ? `· ${ex.user.phone}` : ""}</p>

                <div className="mt-2 text-xs bg-ivory/80 p-2.5 rounded-xl border border-sand/50 space-y-1">
                  <p className="font-semibold text-espresso">{ex.productName}</p>
                  <div className="flex gap-4 text-taupe text-[11px]">
                    <span>Current Size: <strong className="text-espresso">{ex.currentSize || "M"}</strong></span>
                    <span>Requested Size: <strong className="text-gold">{ex.requestedSize}</strong></span>
                  </div>
                </div>

                <div className="my-3 border-t border-sand/50 pt-2 space-y-1">
                  <p className="text-xs font-semibold text-espresso">Reason: <span className="font-normal text-taupe">{ex.reason}</span></p>
                  {ex.comments && <p className="text-xs text-taupe italic">"{ex.comments}"</p>}
                  <p className="text-[11px] text-taupe/80 pt-1">
                    Requested: {ex.createdAt ? new Date(ex.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-sand/60 flex gap-2">
                <button
                  onClick={() => setSelectedExchange(ex)}
                  className="btn-outline flex-1 py-1.5 text-xs"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedExchange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-xs" onClick={() => setSelectedExchange(null)} />
          <div className="card relative z-10 w-full max-w-lg p-6 bg-ivory border border-sand rounded-2xl shadow-soft max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-semibold text-espresso mb-4">Exchange Request Details</h3>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Order ID:</span>
                <span className="font-mono font-bold text-espresso">{selectedExchange.order?.orderId || selectedExchange.order?._id || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Customer:</span>
                <span className="font-semibold text-espresso">{selectedExchange.user?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Email / Phone:</span>
                <span className="font-medium text-espresso">{selectedExchange.user?.email} {selectedExchange.user?.phone ? `· ${selectedExchange.user.phone}` : ""}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Status:</span>
                <span className="font-bold text-indigo-700">{selectedExchange.status}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Product:</span>
                <span className="font-semibold text-espresso">{selectedExchange.productName}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Size Swap:</span>
                <span className="font-semibold text-espresso">{selectedExchange.currentSize || "M"} ➔ <span className="text-gold font-bold">{selectedExchange.requestedSize}</span></span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Reason:</span>
                <span className="font-medium text-espresso">{selectedExchange.reason}</span>
              </div>

              {selectedExchange.status === "EXCHANGE_CANCELLED" && (
                <div className="rounded-xl bg-blush/60 p-3.5 border border-terracotta/40 text-xs text-espresso space-y-1">
                  <p className="font-semibold text-terracotta">Exchange Cancelled</p>
                  <p><span className="text-taupe">Cancelled by:</span> {selectedExchange.cancelledBy || "Customer"}</p>
                  <p><span className="text-taupe">Date:</span> {selectedExchange.cancelledAt ? new Date(selectedExchange.cancelledAt).toLocaleString() : "N/A"}</p>
                  <p><span className="text-taupe">Reason:</span> {selectedExchange.cancellationReason || "Cancelled by customer"}</p>
                </div>
              )}

              <div>
                <label className="label text-xs font-semibold text-espresso mb-1 block">Update Exchange Status</label>
                {selectedExchange.status === "EXCHANGE_CANCELLED" ? (
                  <p className="text-xs text-taupe italic">Cancelled exchange requests cannot be modified.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedExchange._id, st)}
                        className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition border ${
                          selectedExchange.status === st
                            ? "bg-gold text-espresso border-gold shadow-xs"
                            : "bg-champagne/40 border-sand text-espresso hover:bg-gold/20"
                        }`}
                      >
                        {st.replace("EXCHANGE_", "").replace("_", " ")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setSelectedExchange(null)} className="btn-outline w-full py-2 text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExchanges;
