import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiAlertTriangle,
} from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4 p-5">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-emerald-900 dark:text-gold">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data.stats);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader full />;
  if (!stats) return <p>Failed to load dashboard.</p>;

  const maxSale = Math.max(...stats.monthlySales.map((m) => m.total), 1);
  const monthName = (m) =>
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-emerald-900 dark:text-gold">
        Dashboard Overview
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiDollarSign} label="Total Revenue" value={formatPrice(stats.totalRevenue)} color="bg-emerald-700" />
        <StatCard icon={FiShoppingCart} label="Total Orders" value={stats.totalOrders} color="bg-blue-600" />
        <StatCard icon={FiBox} label="Products" value={stats.totalProducts} color="bg-gold-dark" />
        <StatCard icon={FiUsers} label="Customers" value={stats.totalUsers} color="bg-purple-600" />
      </div>

      {stats.lowStock > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-orange-50 p-4 text-sm text-orange-700 dark:bg-emerald-900/40">
          <FiAlertTriangle /> {stats.lowStock} products are low on stock (less than 5 units).
          <Link to="/admin/products" className="font-medium underline">Review</Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Sales chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-emerald-900 dark:text-gold">
            Sales (Last 6 Months)
          </h2>
          {stats.monthlySales.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No sales data yet.</p>
          ) : (
            <div className="flex h-48 items-end justify-around gap-2">
              {stats.monthlySales.map((m, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-end justify-center" style={{ height: "150px" }}>
                    <div
                      className="w-8 rounded-t-md bg-emerald-700 transition-all hover:bg-gold"
                      style={{ height: `${(m.total / maxSale) * 100}%` }}
                      title={formatPrice(m.total)}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{monthName(m._id.month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by status */}
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-emerald-900 dark:text-gold">Orders by Status</h2>
          <div className="space-y-3">
            {stats.ordersByStatus.map((s) => (
              <div key={s._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-beige-light/70">{s._id}</span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders + top products */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-emerald-900 dark:text-gold">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders.map((o) => (
              <Link key={o._id} to="/admin/orders" className="flex items-center justify-between text-sm hover:text-gold">
                <div>
                  <p className="font-mono font-medium">{o.orderId}</p>
                  <p className="text-xs text-gray-400">{o.user?.name}</p>
                </div>
                <span className="font-semibold">{formatPrice(o.totalPrice)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-emerald-900 dark:text-gold">Top Products</h2>
          <div className="space-y-3">
            {stats.topProducts.map((p) => (
              <div key={p._id} className="flex items-center gap-3 text-sm">
                <img src={p.images?.[0]?.url} alt="" className="h-10 w-10 rounded object-cover" />
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-xs text-gray-400">{p.sold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
