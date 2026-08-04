import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import { FiX, FiUploadCloud, FiTrash2 } from "react-icons/fi";
import api from "../../api/axios";

const ReviewModal = ({ isOpen, onClose, orderId, item, existingReview, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setTitle(existingReview.title || "");
      setComment(existingReview.comment || "");
      setPreviews(existingReview.images?.map((img) => img.url) || []);
    } else {
      setRating(0);
      setTitle("");
      setComment("");
      setImages([]);
      setPreviews([]);
    }
  }, [existingReview, isOpen]);

  if (!isOpen || !item) return null;

  const productId = item.product?._id || item.product;
  const productName = item.name || item.product?.name || "Product";
  const productImage = item.image || item.product?.images?.[0]?.url || "/placeholder.jpg";

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      return toast.warning("You can upload a maximum of 3 images.");
    }
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length < files.length) {
      toast.warning("Some images exceeded 5MB limit and were skipped.");
    }

    setImages((prev) => [...prev, ...valid]);
    const newPreviews = valid.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      return toast.warning("Please select a star rating (1–5 stars).");
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("rating", rating);
      formData.append("title", title.trim());
      formData.append("comment", comment.trim());
      images.forEach((img) => formData.append("images", img));

      const res = await api.post(`/reviews/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Review submitted successfully!");
      onSuccess?.(res.data.review);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/50 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-ivory rounded-2xl border border-sand/80 shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header (Fixed) */}
        <div className="flex items-center justify-between bg-espresso text-ivory p-5 shrink-0">
          <div>
            <h3 className="font-serif text-lg font-semibold">
              {existingReview ? "Edit Product Review" : "Rate & Review Product"}
            </h3>
            <p className="text-xs text-sand/80">Verified Purchase Review</p>
          </div>
          <button
            onClick={onClose}
            className="text-taupe hover:text-ivory transition-colors p-1"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Form Layout */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {/* Product Snippet */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-champagne/60 border border-sand/70">
              <img
                src={productImage}
                alt={productName}
                className="h-12 w-12 rounded-lg object-cover bg-ivory shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-espresso truncate">{productName}</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-300">
                  ✓ Verified Purchase
                </span>
              </div>
            </div>

            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-taupe mb-2">
                Your Overall Rating <span className="text-terracotta">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110 focus:outline-hidden"
                  >
                    <FaStar
                      size={32}
                      className={
                        star <= (hover || rating) ? "text-gold drop-shadow-xs" : "text-sand/80"
                      }
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-xs font-semibold text-espresso ml-2">
                    {rating === 5
                      ? "Excellent! 🌟"
                      : rating === 4
                      ? "Very Good 👌"
                      : rating === 3
                      ? "Good 👍"
                      : rating === 2
                      ? "Fair 😐"
                      : "Poor 👎"}
                  </span>
                )}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-taupe mb-1">
                Review Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Great quality & perfect size!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input py-2 text-sm"
                maxLength={100}
              />
            </div>

            {/* Review Description */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-taupe mb-1">
                Detailed Review (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share your thoughts about fabric, fit, comfort, or delivery..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input py-2 text-sm resize-none"
                maxLength={1000}
              />
            </div>

            {/* Optional Image Upload */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-taupe mb-2">
                Upload Customer Photos (Optional - Max 3)
              </label>
              {previews.length < 3 && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-sand/80 hover:border-gold rounded-xl p-4 cursor-pointer bg-champagne/30 transition-colors text-center">
                  <FiUploadCloud className="text-gold text-2xl mb-1" />
                  <span className="text-xs font-medium text-espresso">Click to upload photos</span>
                  <span className="text-[10px] text-taupe">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-sand shadow-xs group">
                      <img src={url} alt={`Review photo ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-espresso/80 text-ivory rounded-full hover:bg-terracotta transition-colors"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer (Always Visible) */}
          <div className="shrink-0 bg-champagne/40 border-t border-sand/70 p-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-sand/50 text-espresso text-xs font-semibold hover:bg-sand transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !rating}
              className="btn-primary text-xs py-2.5 px-6 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
