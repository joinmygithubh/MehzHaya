import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiChevronRight } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  "Out for Delivery": "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data.orders);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader />;

  if (orders.length === 0) {
    return (
      <div className="card p-12 text-center">
        <FiPackage className="mx-auto text-5xl text-gold/40" />
        <h2 className="mt-4 font-serif text-2xl text-emerald-900 dark:text-gold">
          No orders yet
        </h2>
        <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here.</p>
        <Link to="/shop" className="btn-primary mt-6">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-emerald-900 dark:text-gold">
        My Orders ({orders.length})
      </h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order._id} to={`/account/orders/${order._id}`} className="card block p-5 transition hover:shadow-gold">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-emerald-900 dark:text-gold">
                  {order.orderId}
                </p>
                <p className="text-xs text-gray-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-3">
                {order.items.slice(0, 4).map((item, i) => (
                  <img
                    key={i}
                    src={item.image}
                    alt=""
                    className="h-12 w-12 rounded-full border-2 border-white object-cover dark:border-emerald-900"
                  />
                ))}
                {order.items.length > 4 && (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-beige text-xs font-medium dark:border-emerald-900">
                    +{order.items.length - 4}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-emerald-900 dark:text-gold">
                  {formatPrice(order.totalPrice)}
                </span>
                <FiChevronRight className="text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
