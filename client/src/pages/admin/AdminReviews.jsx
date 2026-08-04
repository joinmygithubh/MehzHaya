import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FiStar,
  FiSearch,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiCheckCircle,
  FiImage,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import api from "../../api/axios";
import SEO from "../../components/common/SEO";
import RatingStars from "../../components/common/RatingStars";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = {};
      if (starFilter !== "ALL") params.rating = starFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get("/reviews/admin/all", { params });
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Approved" ? "Hidden" : "Approved";
    setUpdatingId(id);
    try {
      const { data } = await api.patch(`/reviews/admin/${id}/status`, {
        status: nextStatus,
      });
      toast.success(data.message || `Review status updated to ${nextStatus}`);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: nextStatus } : r))
      );
    } catch (err) {
      toast.error(err.message || "Failed to update review status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted successfully");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  return (
    <>
      <SEO title="Admin - Review Management" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-espresso flex items-center gap-2">
              <FiStar className="text-gold" /> Verified Product Reviews ({reviews.length})
            </h1>
            <p className="text-sm text-taupe mt-1">
              Moderate, approve, hide, or filter verified customer ratings and reviews.
            </p>
          </div>
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-champagne border border-sand/70 text-espresso text-sm font-medium hover:bg-gold/20 transition-all duration-300 shadow-xs"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Filters & Search */}
        <div className="card p-4 bg-champagne/50 border border-sand/70 rounded-xl space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          {/* Star & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-taupe font-semibold uppercase tracking-wider">Rating:</span>
            {["ALL", "5", "4", "3", "2", "1"].map((st) => (
              <button
                key={st}
                onClick={() => setStarFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  starFilter === st
                    ? "bg-gold text-espresso shadow-xs"
                    : "bg-ivory text-taupe hover:text-espresso border border-sand/60"
                }`}
              >
                {st === "ALL" ? "All Stars" : `${st}★`}
              </button>
            ))}

            <span className="text-xs text-taupe font-semibold uppercase tracking-wider ml-2">Status:</span>
            {["ALL", "Approved", "Hidden"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  statusFilter === st
                    ? "bg-espresso text-ivory shadow-xs"
                    : "bg-ivory text-taupe hover:text-espresso border border-sand/60"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-xs w-full">
            <div className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-3 top-3 text-taupe" />
              <input
                type="text"
                placeholder="Search reviews or products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 py-2 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary py-2 px-3 text-xs font-medium">
              Search
            </button>
          </form>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="card p-12 text-center text-taupe bg-champagne/40 rounded-xl border border-sand/70">
            <FiRefreshCw className="animate-spin text-gold mx-auto text-2xl mb-2" />
            <p className="text-sm font-medium">Loading customer reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="card p-12 text-center text-taupe bg-champagne/40 rounded-xl border border-sand/70">
            <FiStar className="mx-auto text-3xl text-taupe/60 mb-2" />
            <h3 className="font-serif text-lg font-semibold text-espresso">No Reviews Found</h3>
            <p className="text-sm mt-1">There are no customer reviews matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="card p-5 bg-champagne/40 border border-sand/70 rounded-xl shadow-soft flex flex-wrap md:flex-nowrap justify-between gap-4 items-start"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Product Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={r.product?.images?.[0]?.url || "/placeholder.jpg"}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover bg-ivory border border-sand"
                    />
                    <div className="min-w-0">
                      <p className="font-serif font-semibold text-espresso text-sm truncate">
                        {r.product?.name || "Product"}
                      </p>
                      <span className="text-xs text-taupe">{r.name} ({r.user?.email || "Customer"})</span>
                    </div>
                  </div>

                  {/* Rating + Badges */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <RatingStars value={r.rating} size={14} />
                    {r.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-300">
                        <FiCheckCircle size={11} className="text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        r.status === "Approved"
                          ? "bg-emerald-500/15 text-emerald-700 border-emerald-300"
                          : "bg-terracotta/15 text-terracotta border-terracotta/30"
                      }`}
                    >
                      {r.status || "Approved"}
                    </span>
                  </div>

                  {/* Title & Comment */}
                  <div>
                    {r.title && <h4 className="font-serif text-sm font-semibold text-espresso">{r.title}</h4>}
                    {r.comment && <p className="text-xs text-taupe leading-relaxed mt-0.5">{r.comment}</p>}
                  </div>

                  {/* Customer Photos */}
                  {r.images && r.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-taupe font-medium flex items-center gap-1">
                        <FiImage /> Photos:
                      </span>
                      {r.images.map((img, idx) => (
                        <a key={idx} href={img.url} target="_blank" rel="noreferrer">
                          <img
                            src={img.url}
                            alt="Review photo"
                            className="h-10 w-10 rounded-md object-cover border border-sand hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-taupe pt-1">
                    Submitted: {new Date(r.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-sand/60">
                  <button
                    onClick={() => handleStatusToggle(r._id, r.status || "Approved")}
                    disabled={updatingId === r._id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      r.status === "Approved"
                        ? "bg-amber-500/15 text-amber-900 border-amber-300 hover:bg-amber-500/25"
                        : "bg-emerald-500/15 text-emerald-900 border-emerald-300 hover:bg-emerald-500/25"
                    }`}
                  >
                    {r.status === "Approved" ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    {r.status === "Approved" ? "Hide Review" : "Approve Review"}
                  </button>

                  <button
                    onClick={() => handleDelete(r._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-terracotta/15 text-terracotta border border-terracotta/30 hover:bg-terracotta hover:text-ivory transition-all"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminReviews;
