import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiPackage, FiEye } from "react-icons/fi";
import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const STATUSES = ["Requested", "Pending Review", "Approved", "Rejected", "Received", "Refunded", "Completed"];

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadReturns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/returns/admin/all");
      setReturns(data.returns || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleUpdate = async (id, status, notes) => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/returns/admin/${id}`, { status, adminNotes: notes });
      toast.success("Return status updated");
      setReturns((prev) => prev.map((r) => (r._id === id ? data.returnRequest : r)));
      if (selectedReturn?._id === id) setSelectedReturn(data.returnRequest);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader full />;

  const filtered = returns.filter((r) => (statusFilter === "ALL" ? true : r.status === statusFilter));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-espresso">
            Return Management ({returns.length})
          </h1>
          <p className="text-sm text-taupe mt-0.5">Manage customer return requests, photo proof, and refund workflows.</p>
        </div>
        <button onClick={loadReturns} className="btn-outline px-3 py-2 text-sm flex items-center gap-1.5">
          <FiRefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-sand pb-3">
        {["ALL", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
              statusFilter === s
                ? "bg-gold text-espresso font-semibold shadow-xs"
                : "bg-ivory border border-sand text-taupe hover:text-espresso"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center bg-champagne/40 border border-sand">
          <FiPackage className="mx-auto text-5xl text-gold/60 mb-2" />
          <p className="font-serif text-lg text-espresso">No return requests found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r._id} className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-espresso bg-sand/40 px-2 py-0.5 rounded">
                    Order ID: {r.order?.orderId || r.order?._id || "N/A"}
                  </span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold text-gold border border-gold/30">
                    {r.status}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-espresso">Customer: {r.user?.name || "N/A"}</p>
                <p className="text-xs text-taupe">{r.user?.email || "No email"} {r.user?.phone ? `· ${r.user.phone}` : ""}</p>
                
                {/* Product Items Summary */}
                {((r.items && r.items.length > 0) || (r.order?.items && r.order.items.length > 0)) && (
                  <div className="mt-2 text-xs text-espresso bg-ivory/80 p-2 rounded border border-sand/50">
                    <p className="font-semibold text-taupe text-[11px] mb-1">Products:</p>
                    {((r.items && r.items.length > 0) ? r.items : r.order.items).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="truncate max-w-[180px] font-medium">{item.name}</span>
                        <span className="text-taupe">x{item.quantity} ({formatPrice(item.price)})</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="my-3 border-t border-sand/50 pt-2 space-y-1">
                  <p className="text-xs font-semibold text-espresso">Reason: <span className="font-normal text-taupe">{r.reason}</span></p>
                  {r.comments && <p className="text-xs text-taupe italic">"{r.comments}"</p>}
                  <p className="text-[11px] text-taupe/80 pt-1">
                    Requested: {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="text-taupe">Refund Amount:</span>
                  <span className="font-semibold text-espresso">{formatPrice(r.refundAmount || 0)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedReturn(r)}
                    className="btn-outline flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
                  >
                    <FiEye size={14} /> Details
                  </button>
                  {r.status === "Requested" && (
                    <button
                      onClick={() => handleUpdate(r._id, "Approved", "Approved by Admin")}
                      className="btn-primary flex-1 py-1.5 text-xs"
                      disabled={updating}
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Detail Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/50 backdrop-blur-xs" onClick={() => setSelectedReturn(null)} />
          <div className="card relative z-10 w-full max-w-lg p-6 bg-ivory border border-sand rounded-2xl shadow-soft max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-semibold text-espresso mb-1">Return Details</h2>
            <p className="text-xs text-taupe mb-4">Request ID: {selectedReturn._id}</p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Order ID:</span>
                <span className="font-mono font-bold text-espresso">{selectedReturn.order?.orderId || selectedReturn.order?._id || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Customer Name:</span>
                <span className="font-semibold text-espresso">{selectedReturn.user?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Customer Email:</span>
                <span className="font-medium text-espresso">{selectedReturn.user?.email || "N/A"}</span>
              </div>
              {selectedReturn.user?.phone && (
                <div className="flex justify-between border-b border-sand pb-2">
                  <span className="text-taupe font-medium">Customer Phone:</span>
                  <span className="font-medium text-espresso">{selectedReturn.user.phone}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Status:</span>
                <span className="font-semibold text-gold">{selectedReturn.status}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Return Reason:</span>
                <span className="font-medium text-espresso">{selectedReturn.reason}</span>
              </div>
              {selectedReturn.comments && (
                <div className="border-b border-sand pb-2">
                  <span className="text-taupe font-medium block mb-0.5">Comments:</span>
                  <p className="text-xs text-espresso italic bg-sand/30 p-2 rounded">{selectedReturn.comments}</p>
                </div>
              )}
              <div className="flex justify-between border-b border-sand pb-2 text-xs">
                <span className="text-taupe font-medium">Created Date:</span>
                <span className="text-espresso font-medium">{selectedReturn.createdAt ? new Date(selectedReturn.createdAt).toLocaleString() : "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2 text-xs">
                <span className="text-taupe font-medium">Updated Date:</span>
                <span className="text-espresso font-medium">{selectedReturn.updatedAt ? new Date(selectedReturn.updatedAt).toLocaleString() : "N/A"}</span>
              </div>

              {/* Product Details Section */}
              {((selectedReturn.items && selectedReturn.items.length > 0) || (selectedReturn.order?.items && selectedReturn.order.items.length > 0)) && (
                <div className="border-b border-sand pb-3">
                  <p className="text-xs font-semibold text-espresso mb-2">Product Details:</p>
                  <div className="space-y-2">
                    {((selectedReturn.items && selectedReturn.items.length > 0) ? selectedReturn.items : selectedReturn.order.items).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-champagne/40 rounded-xl border border-sand/60 text-xs">
                        <div>
                          <p className="font-semibold text-espresso">{item.name}</p>
                          <p className="text-[11px] text-taupe">Qty: {item.quantity} · Reason: {item.reason || selectedReturn.reason}</p>
                        </div>
                        <span className="font-semibold text-espresso">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReturn.images?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-espresso mb-2">Customer Proof Photos (Click to Zoom):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReturn.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewImage(img.url)}
                        className="h-20 w-20 overflow-hidden rounded-xl border border-sand hover:border-gold transition scale-95 hover:scale-100 shadow-xs"
                      >
                        <img src={img.url} alt="proof" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedReturn.status === "Cancelled" && (
                <div className="rounded-xl bg-blush/60 p-3.5 border border-terracotta/40 text-xs text-espresso space-y-1">
                  <p className="font-semibold text-terracotta">Return Cancelled</p>
                  <p><span className="text-taupe">Cancelled by:</span> {selectedReturn.cancelledBy || "Customer"}</p>
                  <p><span className="text-taupe">Cancelled date:</span> {selectedReturn.cancelledAt ? new Date(selectedReturn.cancelledAt).toLocaleString() : "N/A"}</p>
                  <p><span className="text-taupe">Reason:</span> {selectedReturn.cancellationReason || "Cancelled by customer"}</p>
                </div>
              )}

              <div>
                <label className="label text-xs">Update Status</label>
                {selectedReturn.status === "Cancelled" ? (
                  <p className="text-xs text-taupe italic">Cancelled return requests cannot be modified.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdate(selectedReturn._id, st, selectedReturn.adminNotes)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition border ${
                          selectedReturn.status === st
                            ? "bg-gold text-espresso border-gold"
                            : "bg-champagne/40 border-sand text-espresso hover:bg-gold/20"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setSelectedReturn(null)} className="btn-outline w-full mt-6 py-2 text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Proof Photo Zoom Lightbox */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/90 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Full Proof" className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
