import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import api from "../../api/axios";
import RatingStars from "../common/RatingStars";

const Reviews = ({ productId, initialReviews = [], onRatingChange }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setReviews(initialReviews), [initialReviews]);

  const submit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.info("Please log in to write a review");
    if (!rating) return toast.warn("Please select a rating");
    setSubmitting(true);
    try {
      const res = await api.post(`/reviews/${productId}`, { rating, comment });
      setReviews(res.data.reviews);
      onRatingChange?.(res.data.ratings, res.data.numReviews);
      setRating(0);
      setComment("");
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="section-title mb-2 text-2xl">
        Customer Reviews ({reviews.length})
      </h2>
      <div className="gold-divider mb-6" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Write review */}
        <form onSubmit={submit} className="card h-fit p-6 lg:col-span-1 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <h3 className="mb-3 font-serif text-lg font-semibold text-espresso">
            Write a Review
          </h3>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <FaStar
                  size={26}
                  className={
                    star <= (hover || rating) ? "text-gold" : "text-sand"
                  }
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            required
            className="input mb-3 resize-none"
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* List */}
        <div className="space-y-4 lg:col-span-2">
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-taupe font-sans">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((r, i) => (
              <div key={i} className="card p-5 bg-champagne/40 border border-sand/70 rounded-xl shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-serif font-semibold text-espresso shadow-xs">
                      {r.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-serif font-semibold text-espresso">
                        {r.name}
                        {user?.name === r.name && (
                          <span className="ml-2 text-xs text-gold font-sans font-medium">(You)</span>
                        )}
                      </p>
                      <RatingStars value={r.rating} size={12} />
                    </div>
                  </div>
                  {r.createdAt && (
                    <span className="text-xs text-taupe font-sans">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-taupe font-sans leading-relaxed">
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
