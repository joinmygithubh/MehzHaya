import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheckCircle, FiPackage, FiArrowRight } from "react-icons/fi";
import confetti from "../utils/confetti";

import SEO from "../components/common/SEO";
import Loader from "../components/common/Loader";
import api from "../api/axios";
import { formatPrice } from "../utils/helpers";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
        confetti();
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader full />;

  return (
    <div className="container-px py-12">
      <SEO title="Order Confirmed" />
      <div className="mx-auto max-w-xl text-center">
        <FiCheckCircle className="mx-auto text-7xl text-green-500" />
        <h1 className="mt-4 font-serif text-4xl font-bold text-emerald-900 dark:text-gold">
          Thank You!
        </h1>
        <p className="mt-2 text-gray-500">
          Your order has been placed successfully. A confirmation email is on its way.
        </p>

        {order && (
          <div className="card mt-8 p-6 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-emerald-800">
              <div>
                <p className="text-xs text-gray-400">Order ID</p>
                <p className="font-mono font-semibold text-emerald-900 dark:text-gold">
                  {order.orderId}
                </p>
              </div>
              <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-medium text-gold">
                {order.orderStatus}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="h-14 w-12 rounded object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-lg font-bold text-emerald-900 dark:border-emerald-800 dark:text-gold">
              <span>Total Paid</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Payment method: {order.paymentMethod} · Status: {order.paymentInfo?.status}
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/account/orders" className="btn-primary">
            <FiPackage /> Track Order
          </Link>
          <Link to="/shop" className="btn-outline">
            Continue Shopping <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
