import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import { FiCheckCircle, FiImage, FiX } from "react-icons/fi";
import api from "../../api/axios";
import RatingStars from "../common/RatingStars";

const Reviews = ({ productId, initialReviews = [], onRatingChange }) => {
  const { user } = useSelector((s) => s.auth);
  const [reviews, setReviews] = useState(initialReviews);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [avgRatings, setAvgRatings] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Lightbox modal state
  const [previewImage, setPreviewImage] = useState(null);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${productId}`);
      setReviews(data.reviews || []);
      setBreakdown(data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      setAvgRatings(data.ratings || 0);
      setTotalCount(data.numReviews || 0);
      onRatingChange?.(data.ratings, data.numReviews);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <div className="mt-12">
      <h2 className="section-title mb-2 text-2xl">
        Customer Ratings & Reviews ({totalCount})
      </h2>
      <div className="gold-divider mb-6" />

      {/* Breakdown Header & Summary Card */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Rating Score */}
        <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-2xl flex flex-col items-center justify-center text-center shadow-soft">
          <span className="text-5xl font-bold font-serif text-espresso">{avgRatings.toFixed(1)}</span>
          <div className="my-2">
            <RatingStars value={avgRatings} size={20} />
          </div>
          <p className="text-xs text-taupe font-medium">Based on {totalCount} verified reviews</p>
        </div>

        {/* Rating Bars Distribution */}
        <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-2xl md:col-span-2 space-y-2 shadow-soft flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-semibold text-espresso flex items-center gap-0.5">
                  {star} <FaStar className="text-gold text-[10px]" />
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-sand/50 overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-medium text-taupe">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="card p-8 text-center bg-champagne/30 border border-sand/60 rounded-xl">
            <p className="text-sm text-taupe">
              No verified purchase reviews yet. Customers who purchase and receive this product can leave a verified review from My Orders.
            </p>
          </div>
        ) : (
          reviews.map((r, i) => (
            <div key={r._id || i} className="card p-5 bg-champagne/40 border border-sand/70 rounded-xl shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/50 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-serif font-semibold text-espresso shadow-xs">
                    {r.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-serif font-semibold text-espresso">{r.name}</p>
                      {r.isVerifiedPurchase !== false && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-300">
                          <FiCheckCircle size={10} className="text-emerald-600" /> Verified Purchase
                        </span>
                      )}
                      {user?._id === r.user && (
                        <span className="text-xs text-gold font-sans font-medium">(You)</span>
                      )}
                    </div>
                    <RatingStars value={r.rating} size={12} />
                  </div>
                </div>
                {r.createdAt && (
                  <span className="text-xs text-taupe font-sans">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Review Title & Content */}
              <div className="mt-3">
                {r.title && (
                  <h4 className="font-serif font-semibold text-espresso text-base mb-1">
                    {r.title}
                  </h4>
                )}
                {r.comment && (
                  <p className="text-sm text-taupe font-sans leading-relaxed whitespace-pre-line">
                    {r.comment}
                  </p>
                )}
              </div>

              {/* Uploaded Customer Photos */}
              {r.images && r.images.length > 0 && (
                <div className="mt-3">
                  <span className="text-[11px] font-medium text-taupe flex items-center gap-1 mb-1">
                    <FiImage /> Customer Uploaded Photos ({r.images.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {r.images.map((img, imgIdx) => (
                      <img
                        key={img.public_id || imgIdx}
                        src={img.url}
                        alt="Customer review photo"
                        onClick={() => setPreviewImage(img.url)}
                        className="h-16 w-16 rounded-lg object-cover border border-sand cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/80 backdrop-blur-xs">
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-sand bg-ivory shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-espresso/80 text-ivory hover:bg-terracotta transition-colors"
            >
              <FiX size={20} />
            </button>
            <img src={previewImage} alt="Review zoom" className="max-h-[80vh] w-auto object-contain rounded-2xl p-2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
