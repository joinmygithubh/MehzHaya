import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiDownload,
  FiRefreshCw,
  FiPackage,
  FiRotateCcw,
  FiPieChart,
} from "react-icons/fi";
import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [orderStatus, setOrderStatus] = useState("ALL");
  const [downloading, setDownloading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/reports/sales?period=${period}&orderStatus=${orderStatus}`);
      setReport(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, orderStatus]);

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/admin/reports/export?period=${period}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mehzhaya_sales_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Sales report downloaded successfully!");
    } catch (err) {
      toast.error("Failed to export report CSV");
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !report) return <Loader full />;

  const { summary = {}, returnStats = {}, inventory = {}, paymentBreakdown = [], topProducts = [] } = report || {};

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-espresso">
            Sales & Business Reports
          </h1>
          <p className="text-sm text-taupe mt-0.5">Comprehensive real-time analytics, revenue trends, and inventory valuation.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReport} className="btn-outline px-3 py-2 text-sm flex items-center gap-1.5">
            <FiRefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={downloading}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
          >
            <FiDownload size={15} /> {downloading ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 card p-4 bg-champagne/40 border border-sand/70 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-espresso">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-sand bg-ivory px-3 py-1.5 text-xs text-espresso shadow-xs"
          >
            <option value="daily">Today (Daily)</option>
            <option value="weekly">Last 7 Days (Weekly)</option>
            <option value="monthly">Last 30 Days (Monthly)</option>
            <option value="yearly">Last 12 Months (Yearly)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-espresso">Order Status:</span>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="rounded-lg border border-sand bg-ivory px-3 py-1.5 text-xs text-espresso shadow-xs"
          >
            <option value="ALL">All Valid Orders</option>
            <option value="Delivered">Delivered</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
          </select>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">Total Revenue</span>
            <FiDollarSign className="text-gold text-xl" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso">
            {formatPrice(summary.totalRevenue || 0)}
          </p>
          <span className="text-xs text-taupe mt-1 block">Net revenue from valid orders</span>
        </div>

        <div className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">Total Orders</span>
            <FiShoppingBag className="text-gold text-xl" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso">{summary.totalOrders || 0}</p>
          <span className="text-xs text-taupe mt-1 block">Completed & active orders</span>
        </div>

        <div className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">Average Order Value</span>
            <FiTrendingUp className="text-gold text-xl" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso">
            {formatPrice(Math.round(summary.avgOrderValue || 0))}
          </p>
          <span className="text-xs text-taupe mt-1 block">AOV per customer transaction</span>
        </div>

        <div className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">Inventory Value</span>
            <FiPackage className="text-gold text-xl" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso">
            {formatPrice(inventory.totalInventoryValue || 0)}
          </p>
          <span className="text-xs text-taupe mt-1 block">{inventory.lowStockCount || 0} items low stock</span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Methods */}
        <div className="card p-6 bg-ivory border border-sand/80 rounded-xl shadow-soft">
          <h3 className="font-serif text-lg font-semibold text-espresso flex items-center gap-2 mb-4">
            <FiPieChart className="text-gold" /> Payment Method Breakdown
          </h3>
          <div className="space-y-3">
            {paymentBreakdown.length === 0 ? (
              <p className="text-xs text-taupe">No payment data available for period.</p>
            ) : (
              paymentBreakdown.map((pb) => (
                <div key={pb._id} className="flex items-center justify-between border-b border-sand/50 pb-2 text-sm">
                  <span className="font-medium text-espresso">{pb._id}</span>
                  <div className="text-right">
                    <div className="font-semibold text-espresso">{formatPrice(pb.total)}</div>
                    <div className="text-xs text-taupe">{pb.count} transactions</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Returns & Refunds Summary */}
        <div className="card p-6 bg-ivory border border-sand/80 rounded-xl shadow-soft">
          <h3 className="font-serif text-lg font-semibold text-espresso flex items-center gap-2 mb-4">
            <FiRotateCcw className="text-gold" /> Returns & Refunds Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-sand/50 pb-2 text-sm">
              <span className="text-taupe">Total Return Requests</span>
              <span className="font-semibold text-espresso">{returnStats.totalReturns || 0}</span>
            </div>
            <div className="flex justify-between border-b border-sand/50 pb-2 text-sm">
              <span className="text-taupe">Total Refunded Amount</span>
              <span className="font-semibold text-terracotta">{formatPrice(returnStats.totalRefunded || 0)}</span>
            </div>
            <div className="flex justify-between border-b border-sand/50 pb-2 text-sm">
              <span className="text-taupe">Total Discounts Given</span>
              <span className="font-semibold text-espresso">{formatPrice(summary.totalDiscounts || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="mt-8 card overflow-hidden bg-ivory border border-sand/80 rounded-xl shadow-soft p-6">
        <h3 className="font-serif text-lg font-semibold text-espresso mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand bg-champagne/60 text-xs font-semibold uppercase text-taupe">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/50">
              {topProducts.map((p) => (
                <tr key={p._id} className="hover:bg-champagne/20 transition">
                  <td className="p-3 font-medium text-espresso">{p.name}</td>
                  <td className="p-3 text-xs text-taupe">{p.categoryName || "N/A"}</td>
                  <td className="p-3 font-semibold text-espresso">{formatPrice(p.price)}</td>
                  <td className="p-3 font-bold text-gold">{p.sold}</td>
                  <td className="p-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${p.stock <= 5 ? "bg-terracotta/20 text-terracotta" : "bg-emerald-500/15 text-emerald-700"}`}>
                      {p.stock} left
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
