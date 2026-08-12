import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiCheck, FiUploadCloud, FiX } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import ReviewModal from "../../components/review/ReviewModal";
import { formatPrice } from "../../utils/helpers";

const TRACK_STEPS = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("Defective / Wrong Item");
  const [returnComments, setReturnComments] = useState("");
  const [returnFiles, setReturnFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [fileError, setFileError] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [cancellingReturn, setCancellingReturn] = useState(false);

  // Exchange state
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeProduct, setExchangeProduct] = useState(null);
  const [availableSizes, setAvailableSizes] = useState(["S", "M", "L", "XL"]);
  const [requestedSize, setRequestedSize] = useState("L");
  const [exchangeReason, setExchangeReason] = useState("Size is too small");
  const [exchangeComments, setExchangeComments] = useState("");
  const [submittingExchange, setSubmittingExchange] = useState(false);
  const [cancellingExchange, setCancellingExchange] = useState(false);

  // Review state
  const [userReviews, setUserReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [activeExistingReview, setActiveExistingReview] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
      try {
        const revRes = await api.get("/reviews/my");
        setUserReviews(revRes.data.reviews || []);
      } catch (err) {
        console.error("Error loading user reviews:", err);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data.order);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelReturn = async () => {
    if (!window.confirm("Are you sure you want to cancel this return request?")) return;
    setCancellingReturn(true);
    try {
      const returnId = order.returnRequestId || order._id;
      await api.put(`/returns/${returnId}/cancel`, { reason: "Cancelled by customer" });
      toast.success("Return request cancelled successfully");
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to cancel return request");
    } finally {
      setCancellingReturn(false);
    }
  };

  const handleOpenExchange = async (item) => {
    const targetItem = item || order.items[0];
    setExchangeProduct(targetItem);
    try {
      const { data } = await api.get(`/products/${targetItem.product}`);
      const prodSizes = data.product?.sizes && data.product.sizes.length > 0
        ? data.product.sizes
        : ["S", "M", "L", "XL"];
      const current = targetItem.size || "M";
      const otherSizes = prodSizes.filter((s) => s !== current);
      setAvailableSizes(otherSizes.length > 0 ? otherSizes : prodSizes);
      setRequestedSize(otherSizes[0] || "L");
    } catch {
      setAvailableSizes(["S", "M", "L", "XL"]);
      setRequestedSize("L");
    }
    setShowExchangeModal(true);
  };

  const handleRequestExchange = async (e) => {
    e.preventDefault();
    if (!requestedSize) {
      toast.error("Please select a new size");
      return;
    }
    setSubmittingExchange(true);
    try {
      await api.post("/exchanges", {
        orderId: order._id,
        productId: exchangeProduct?.product || order.items[0]?.product,
        currentSize: exchangeProduct?.size || "M",
        requestedSize,
        reason: exchangeReason,
        comments: exchangeComments,
      });
      toast.success("Size exchange request submitted successfully");
      setShowExchangeModal(false);
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to submit exchange request");
    } finally {
      setSubmittingExchange(false);
    }
  };

  const handleCancelExchange = async () => {
    if (!window.confirm("Are you sure you want to cancel this size exchange request?")) return;
    setCancellingExchange(true);
    try {
      const exchangeId = order.exchangeRequestId || order._id;
      await api.put(`/exchanges/${exchangeId}/cancel`, { reason: "Cancelled by customer" });
      toast.success("Size exchange request cancelled successfully");
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to cancel exchange request");
    } finally {
      setCancellingExchange(false);
    }
  };

  if (loading) return <Loader />;
  if (!order) return <p>Order not found</p>;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFileError("");

    if (returnFiles.length + files.length > 5) {
      setFileError("Maximum 5 images allowed for return verification.");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validFiles = [];
    const newPreviews = [];

    for (const f of files) {
      if (!validTypes.includes(f.type)) {
        setFileError("Only JPEG, PNG, and WEBP image formats are supported.");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setFileError("Each image file size must not exceed 5MB.");
        return;
      }
      validFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));
    }

    setReturnFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(filePreviews[index]);
    setReturnFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    if (returnFiles.length - 1 === 0) {
      setFileError("Please upload at least one image for return verification.");
    } else {
      setFileError("");
    }
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    if (!returnFiles || returnFiles.length === 0) {
      setFileError("Please upload at least one image for return verification.");
      return;
    }

    setSubmittingReturn(true);
    setFileError("");

    try {
      const formData = new FormData();
      formData.append("orderId", order._id);
      formData.append("reason", returnReason);
      formData.append("comments", returnComments);
      returnFiles.forEach((f) => formData.append("images", f));

      await api.post("/returns", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Return request submitted successfully");
      setShowReturnModal(false);
      setReturnFiles([]);
      setFilePreviews([]);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReturn(false);
    }
  };

  const cancelled = order.orderStatus === "Cancelled";
  const currentStep = TRACK_STEPS.indexOf(order.orderStatus);
  const canCancel = !["Shipped", "Out for Delivery", "Delivered", "Cancelled"].includes(
    order.orderStatus
  );
  const isReturnRequested = order.isReturnRequested || (order.returnStatus && order.returnStatus !== "None");
  const canReturn = order.orderStatus === "Delivered" && !isReturnRequested;

  return (
    <div>
      <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
        <FiArrowLeft /> Back to orders
      </Link>

      <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand/60 pb-4">
          <div>
            <p className="font-mono text-lg font-semibold text-espresso">
              {order.orderId}
            </p>
            <p className="text-xs text-taupe">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            {canCancel && (
              <button onClick={cancel} disabled={cancelling} className="btn-outline px-4 py-2 text-sm">
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
            {/* Return status */}
            {order.returnStatus === "Requested" || order.returnStatus === "Pending Review" ? (
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-gold/15 px-3 py-1.5 text-xs font-semibold text-espresso border border-gold/40 flex items-center gap-1">
                  <FiCheck className="text-gold" /> Return Requested
                </span>
                <button
                  onClick={handleCancelReturn}
                  disabled={cancellingReturn}
                  className="btn-outline px-3.5 py-1.5 text-xs border-terracotta/40 text-terracotta hover:bg-blush"
                >
                  {cancellingReturn ? "Cancelling..." : "Cancel Return Request"}
                </button>
              </div>
            ) : order.returnStatus === "Cancelled" ? (
              <span className="rounded-lg bg-sand/30 px-3 py-1.5 text-xs font-semibold text-taupe border border-sand/60">
                Return Cancelled
              </span>
            ) : isReturnRequested ? (
              <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-300">
                Return {order.returnStatus}
              </span>
            ) : null}

            {/* Exchange status */}
            {order.exchangeStatus === "EXCHANGE_REQUESTED" || order.exchangeStatus === "PRODUCT_PICKUP_PENDING" ? (
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-900 border border-indigo-300 flex items-center gap-1">
                  <FiCheck className="text-indigo-600" /> Exchange Requested ({order.exchangeStatus})
                </span>
                <button
                  onClick={handleCancelExchange}
                  disabled={cancellingExchange}
                  className="btn-outline px-3.5 py-1.5 text-xs border-terracotta/40 text-terracotta hover:bg-blush"
                >
                  {cancellingExchange ? "Cancelling..." : "Cancel Exchange"}
                </button>
              </div>
            ) : order.exchangeStatus === "EXCHANGE_CANCELLED" ? (
              <span className="rounded-lg bg-sand/30 px-3 py-1.5 text-xs font-semibold text-taupe border border-sand/60">
                Exchange Cancelled
              </span>
            ) : order.exchangeStatus === "EXCHANGE_COMPLETED" ? (
              <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-300">
                Exchange Completed
              </span>
            ) : null}

            {/* Initial Buttons when delivered and no active return/exchange */}
            {canReturn && !isReturnRequested && !order.isExchangeRequested && (
              <div className="flex gap-2">
                <button onClick={() => setShowReturnModal(true)} className="btn-outline px-4 py-2 text-sm">
                  Request Return
                </button>
                <button onClick={() => handleOpenExchange(order.items[0])} className="btn-primary px-4 py-2 text-sm">
                  Exchange Size
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracking */}
        {!cancelled ? (
          <div className="my-8 flex items-center justify-between">
            {TRACK_STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      i <= currentStep ? "bg-gold text-espresso shadow-xs" : "bg-sand/40 text-taupe"
                    }`}
                  >
                    {i <= currentStep ? <FiCheck /> : i + 1}
                  </div>
                  <span className={`mt-1 hidden text-[10px] sm:block ${i <= currentStep ? "text-espresso font-semibold" : "text-taupe"}`}>{s}</span>
                </div>
                {i < TRACK_STEPS.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${i < currentStep ? "bg-gold" : "bg-sand/40"}`} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="my-6 rounded-xl bg-blush/60 border border-terracotta/40 p-4 text-center text-sm font-semibold text-terracotta">
            This order has been cancelled.
          </div>
        )}

        {/* Items */}
        <div className="space-y-4">
          {order.items.map((item, i) => {
            const pId = item.product?._id || item.product;
            const prodSlugOrId = item.product?.slug || pId;
            const productLink = prodSlugOrId ? `/product/${prodSlugOrId}` : null;
            const existingReview = item.review || userReviews.find(
              (r) => (r.product?._id || r.product)?.toString() === pId?.toString() && r.order?.toString() === order._id?.toString()
            );

            return (
              <div key={i} className="p-4 rounded-xl bg-champagne/40 border border-sand/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {productLink ? (
                      <Link to={productLink} className="shrink-0" title={`View ${item.name}`}>
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                          className="h-16 w-14 rounded-lg object-cover bg-champagne hover:opacity-90 transition cursor-pointer"
                        />
                      </Link>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name || "Product"}
                        className="h-16 w-14 rounded-lg object-cover bg-champagne shrink-0"
                      />
                    )}
                    <div className="min-w-0 text-sm">
                      {productLink ? (
                        <Link
                          to={productLink}
                          className="font-serif font-semibold text-espresso hover:text-gold hover:underline transition truncate block"
                          title={`View ${item.name}`}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="font-serif font-semibold text-espresso truncate">{item.name}</p>
                      )}
                      <p className="text-taupe text-xs">
                        Qty: {item.quantity}
                        {item.color && ` · ${item.color}`}
                        {item.size && ` · ${item.size}`}
                      </p>
                      <p className="text-xs font-semibold text-espresso mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>

                  {/* Rating Action */}
                  {order.orderStatus === "Delivered" && !existingReview && (
                    <button
                      onClick={() => {
                        setReviewItem(item);
                        setActiveExistingReview(null);
                        setShowReviewModal(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-espresso text-xs font-semibold hover:bg-[#8C6B3F] hover:text-ivory transition-all shadow-xs shrink-0"
                    >
                      <FaStar /> Rate Product
                    </button>
                  )}
                </div>

                {/* Submitted Rating Card */}
                {order.orderStatus === "Delivered" && existingReview && (
                  <div className="p-3.5 rounded-xl bg-ivory/80 border border-sand/80 text-xs space-y-1.5 mt-2 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/50 pb-2">
                      <span className="font-semibold text-espresso uppercase tracking-wider text-[11px]">
                        Your Rating
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex text-gold">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FaStar
                              key={s}
                              size={13}
                              className={s <= existingReview.rating ? "text-gold" : "text-sand/60"}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-espresso">{existingReview.rating}/5</span>
                      </div>
                    </div>

                    {existingReview.title && (
                      <p className="font-serif font-semibold text-espresso text-sm pt-0.5">
                        {existingReview.title}
                      </p>
                    )}

                    {existingReview.comment && (
                      <p className="text-taupe text-xs leading-relaxed italic">
                        "{existingReview.comment}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      {existingReview.createdAt && (
                        <span className="text-taupe">
                          Reviewed on {new Date(existingReview.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setReviewItem(item);
                          setActiveExistingReview(existingReview);
                          setShowReviewModal(true);
                        }}
                        className="font-semibold text-gold hover:underline flex items-center gap-1 ml-auto"
                      >
                        Edit Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Address + totals */}
        <div className="mt-6 grid gap-6 border-t border-sand/60 pt-6 sm:grid-cols-2">
          <div className="text-sm">
            <p className="mb-1 font-serif text-base font-semibold text-espresso">Shipping Address</p>
            <p className="text-taupe">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.phone}<br />
              {order.shippingAddress.line1}, {order.shippingAddress.line2 && `${order.shippingAddress.line2}, `}
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode}
            </p>
            <p className="mt-3 font-serif text-base font-semibold text-espresso">Payment</p>
            <p className="text-taupe">
              {order.paymentMethod} · {order.paymentInfo?.status}
            </p>
          </div>
          <div className="space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatPrice(order.itemsPrice)} />
            {order.discountPrice > 0 && <Row label="Discount" value={`- ${formatPrice(order.discountPrice)}`} />}
            <Row label="Shipping" value={order.shippingPrice === 0 ? "FREE" : formatPrice(order.shippingPrice)} />
            <div className="flex justify-between border-t border-sand/60 pt-2 text-lg font-bold text-espresso">
              <span>Total</span>
              <span className="text-gold">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-xs" onClick={() => setShowReturnModal(false)} />
          <div className="card relative z-10 w-full max-w-md p-6 bg-ivory border border-sand rounded-2xl shadow-soft">
            <h3 className="font-serif text-xl font-semibold text-espresso mb-2">Request Return</h3>
            <p className="text-xs text-taupe mb-4">Please select a reason and describe the issue with your item.</p>
            <form onSubmit={handleRequestReturn} className="space-y-4">
              <div>
                <label className="label text-xs">Reason for Return *</label>
                <select className="input text-sm" value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
                  <option value="Defective / Wrong Item">Defective / Wrong Item</option>
                  <option value="Size / Fit Issue">Size / Fit Issue</option>
                  <option value="Quality Not as Expected">Quality Not as Expected</option>
                  <option value="Changed Mind">Changed Mind</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">Comments & Details</label>
                <textarea
                  className="input resize-none text-sm"
                  rows={2}
                  placeholder="Provide additional details..."
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                />
              </div>

              {/* Upload Images (Mandatory) */}
              <div>
                <label className="label text-xs font-semibold text-espresso">
                  Upload Return Images * <span className="text-[10px] text-taupe font-normal">(Required, 1-5 images: JPG, PNG, WEBP)</span>
                </label>
                
                <label className="mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sand hover:border-gold bg-champagne/30 hover:bg-champagne/60 p-4 text-center cursor-pointer transition">
                  <FiUploadCloud size={24} className="text-gold mb-1" />
                  <span className="text-xs font-semibold text-espresso">Click to upload return images</span>
                  <span className="text-[10px] text-taupe mt-0.5">JPEG, PNG, WEBP up to 5MB each (Max 5 images)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {/* Validation Error Message */}
                {fileError && (
                  <p className="mt-1.5 text-xs font-medium text-terracotta bg-blush/60 p-2 rounded-lg border border-terracotta/30">
                    {fileError}
                  </p>
                )}

                {/* Previews */}
                {filePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {filePreviews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg border border-sand/80 overflow-hidden group">
                        <img src={src} alt="preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute top-1 right-1 rounded-full bg-espresso/80 text-ivory p-1 hover:bg-terracotta transition"
                        >
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowReturnModal(false)} className="btn-outline flex-1 py-2 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submittingReturn} className="btn-primary flex-1 py-2 text-sm">
                  {submittingReturn ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Exchange Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-xs" onClick={() => setShowExchangeModal(false)} />
          <div className="card relative z-10 w-full max-w-md p-6 bg-ivory border border-sand rounded-2xl shadow-soft">
            <h3 className="font-serif text-xl font-semibold text-espresso mb-1">Exchange Size</h3>
            <p className="text-xs text-taupe mb-4">Select the replacement size for your item.</p>

            {exchangeProduct && (
              <div className="flex items-center gap-3 p-3 bg-champagne/40 rounded-xl border border-sand/60 mb-4">
                <img src={exchangeProduct.image} alt="" className="h-12 w-12 rounded-lg object-cover bg-champagne" />
                <div className="text-xs">
                  <p className="font-semibold text-espresso">{exchangeProduct.name}</p>
                  <p className="text-taupe">Current Size: <span className="font-bold text-espresso">{exchangeProduct.size || "M"}</span></p>
                </div>
              </div>
            )}

            <form onSubmit={handleRequestExchange} className="space-y-4">
              <div>
                <label className="label text-xs font-semibold text-espresso">Select New Size *</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setRequestedSize(sz)}
                      className={`h-9 min-w-9 px-3 rounded-lg text-xs font-bold border transition ${
                        requestedSize === sz
                          ? "bg-gold text-espresso border-gold shadow-xs"
                          : "bg-champagne/40 border-sand text-espresso hover:bg-gold/20"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label text-xs">Reason for Exchange *</label>
                <select className="input text-sm" value={exchangeReason} onChange={(e) => setExchangeReason(e.target.value)}>
                  <option value="Size is too small">Size is too small</option>
                  <option value="Size is too large">Size is too large</option>
                  <option value="Fit / Cut issue">Fit / Cut issue</option>
                  <option value="Want a different size">Want a different size</option>
                </select>
              </div>

              <div>
                <label className="label text-xs">Comments & Notes</label>
                <textarea
                  className="input resize-none text-sm"
                  rows={2}
                  placeholder="Additional notes for exchange..."
                  value={exchangeComments}
                  onChange={(e) => setExchangeComments(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowExchangeModal(false)} className="btn-outline flex-1 py-2 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submittingExchange} className="btn-primary flex-1 py-2 text-sm">
                  {submittingExchange ? "Submitting..." : "Submit Exchange"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        orderId={order._id}
        item={reviewItem}
        existingReview={activeExistingReview}
        onSuccess={() => load()}
      />
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-taupe">{label}</span>
    <span className="text-espresso font-medium">{value}</span>
  </div>
);

export default OrderDetail;
