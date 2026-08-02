import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiChevronRight } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const statusColor = {
  Pending: "border border-gold/40 bg-champagne text-espresso font-semibold",
  Processing: "border border-gold bg-champagne text-espresso font-semibold",
  Shipped: "border border-gold bg-gold/20 text-espresso font-semibold",
  "Out for Delivery": "border border-gold bg-gold/30 text-espresso font-semibold",
  Delivered: "border border-sage bg-ivory text-sage font-semibold",
  Cancelled: "border border-terracotta bg-blush/60 text-terracotta font-semibold",
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
      <div className="card p-12 text-center bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
        <FiPackage className="mx-auto text-5xl text-gold/60" />
        <h2 className="mt-4 font-serif text-2xl font-semibold text-espresso">
          No orders yet
        </h2>
        <p className="mt-1 text-sm text-taupe">Start shopping to see your orders here.</p>
        <Link to="/shop" className="btn-primary mt-6">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-espresso">
        My Orders ({orders.length})
      </h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order._id} to={`/account/orders/${order._id}`} className="card block p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft hover:shadow-soft transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-espresso">
                  {order.orderId}
                </p>
                <p className="text-xs text-taupe">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider ${statusColor[order.orderStatus]}`}>
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
                    className="h-12 w-12 rounded-full border-2 border-ivory object-cover bg-champagne"
                  />
                ))}
                {order.items.length > 4 && (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ivory bg-champagne text-xs font-semibold text-espresso">
                    +{order.items.length - 4}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-espresso">
                  {formatPrice(order.totalPrice)}
                </span>
                <FiChevronRight className="text-taupe" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
