import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const TRACK_STEPS = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
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

  if (loading) return <Loader />;
  if (!order) return <p>Order not found</p>;

  const cancelled = order.orderStatus === "Cancelled";
  const currentStep = TRACK_STEPS.indexOf(order.orderStatus);
  const canCancel = !["Shipped", "Out for Delivery", "Delivered", "Cancelled"].includes(
    order.orderStatus
  );

  return (
    <div>
      <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-gold-dark hover:underline">
        <FiArrowLeft /> Back to orders
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-emerald-800">
          <div>
            <p className="font-mono text-lg font-semibold text-emerald-900 dark:text-gold">
              {order.orderId}
            </p>
            <p className="text-xs text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          {canCancel && (
            <button onClick={cancel} disabled={cancelling} className="btn-outline px-4 py-2 text-sm">
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>

        {/* Tracking */}
        {!cancelled ? (
          <div className="my-8 flex items-center justify-between">
            {TRACK_STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                      i <= currentStep ? "bg-emerald-900 text-gold" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i <= currentStep ? <FiCheck /> : i + 1}
                  </div>
                  <span className="mt-1 hidden text-[10px] sm:block">{s}</span>
                </div>
                {i < TRACK_STEPS.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${i < currentStep ? "bg-emerald-900" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="my-6 rounded-lg bg-red-50 p-4 text-center text-sm font-medium text-red-600">
            This order has been cancelled.
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image} alt="" className="h-16 w-14 rounded object-cover" />
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-500">
                  Qty: {item.quantity}
                  {item.color && ` · ${item.color}`}
                  {item.size && ` · ${item.size}`}
                </p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Address + totals */}
        <div className="mt-6 grid gap-6 border-t border-gray-100 pt-6 dark:border-emerald-800 sm:grid-cols-2">
          <div className="text-sm">
            <p className="mb-1 font-semibold text-emerald-900 dark:text-gold">Shipping Address</p>
            <p className="text-gray-600 dark:text-beige-light/70">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.phone}<br />
              {order.shippingAddress.line1}, {order.shippingAddress.line2 && `${order.shippingAddress.line2}, `}
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode}
            </p>
            <p className="mt-3 font-semibold text-emerald-900 dark:text-gold">Payment</p>
            <p className="text-gray-600 dark:text-beige-light/70">
              {order.paymentMethod} · {order.paymentInfo?.status}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(order.itemsPrice)} />
            {order.discountPrice > 0 && <Row label="Discount" value={`- ${formatPrice(order.discountPrice)}`} />}
            <Row label="Shipping" value={order.shippingPrice === 0 ? "FREE" : formatPrice(order.shippingPrice)} />
            <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-emerald-900 dark:border-emerald-800 dark:text-gold">
              <span>Total</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500 dark:text-beige-light/60">{label}</span>
    <span>{value}</span>
  </div>
);

export default OrderDetail;
