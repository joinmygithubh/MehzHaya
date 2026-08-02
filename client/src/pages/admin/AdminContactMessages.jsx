import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FiMail,
  FiSearch,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiX,
  FiUser,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import api from "../../api/axios";
import SEO from "../../components/common/SEO";

const STATUS_OPTIONS = ["ALL", "NEW", "READ", "REPLIED", "RESOLVED"];

const statusBadgeClass = (status) => {
  switch (status) {
    case "NEW":
      return "bg-terracotta/15 text-terracotta border-terracotta/30";
    case "READ":
      return "bg-gold/15 text-espresso border-gold/40";
    case "REPLIED":
      return "bg-sky-500/15 text-sky-700 border-sky-300";
    case "RESOLVED":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-300";
    default:
      return "bg-sand text-taupe border-sand";
  }
};

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== "ALL") params.status = status;
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/contact/admin", { params });
      setMessages(res.data?.messages || []);
    } catch (err) {
      toast.error(err.message || "Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.patch(`/contact/admin/${id}`, { status: newStatus });
      toast.success(res.data?.message || "Status updated");
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m))
      );
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact message?")) return;
    try {
      await api.delete(`/contact/admin/${id}`);
      toast.success("Contact message deleted");
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete message");
    }
  };

  const handleOpenDetail = async (msg) => {
    setSelectedMessage(msg);
    if (msg.status === "NEW") {
      // Auto-update to READ on backend
      try {
        await api.get(`/contact/admin/${msg._id}`);
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, status: "READ" } : m))
        );
        setSelectedMessage({ ...msg, status: "READ" });
      } catch (err) {
        console.error("Error reading message:", err);
      }
    }
  };

  return (
    <>
      <SEO title="Admin - Contact Messages" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-espresso flex items-center gap-2">
              <FiMail className="text-gold" /> Customer Contact Messages
            </h1>
            <p className="text-sm text-taupe mt-1">
              Manage and respond to customer inquiries submitted through the store.
            </p>
          </div>
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-champagne border border-sand/70 text-espresso text-sm font-medium hover:bg-gold/20 transition-all duration-300 shadow-xs"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Filters & Search */}
        <div className="card p-4 bg-champagne/50 border border-sand/70 rounded-xl space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          {/* Status Pills */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
                  status === st
                    ? "bg-gold text-espresso shadow-xs"
                    : "bg-ivory text-taupe hover:text-espresso hover:bg-sand/40 border border-sand/60"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-3 top-3 text-taupe" />
              <input
                type="text"
                placeholder="Search name, email, message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 py-2 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary py-2 px-4 text-xs font-medium">
              Search
            </button>
          </form>
        </div>

        {/* Messages List / Table */}
        {loading ? (
          <div className="card p-12 text-center text-taupe bg-champagne/40 rounded-xl border border-sand/70">
            <FiRefreshCw className="animate-spin text-gold mx-auto text-2xl mb-2" />
            <p className="text-sm font-medium">Loading customer messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="card p-12 text-center text-taupe bg-champagne/40 rounded-xl border border-sand/70">
            <FiMail className="mx-auto text-3xl text-taupe/60 mb-2" />
            <h3 className="font-serif text-lg font-semibold text-espresso">No Contact Messages Found</h3>
            <p className="text-sm mt-1">There are no customer inquiries matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (≥768px) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-sand/70 bg-champagne/40 shadow-soft">
              <table className="w-full text-left text-sm text-espresso">
                <thead className="bg-espresso text-ivory font-serif text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Message Preview</th>
                    <th className="px-5 py-4 font-semibold">Submitted Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {messages.map((m) => (
                    <tr key={m._id} className="hover:bg-ivory/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-espresso">{m.name}</div>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-xs text-taupe hover:text-gold transition-colors block"
                        >
                          {m.email}
                        </a>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="truncate text-xs text-taupe/90" title={m.message}>
                          {m.message}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs text-taupe whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={m.status}
                          disabled={updatingId === m._id}
                          onChange={(e) => handleStatusChange(m._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-all ${statusBadgeClass(
                            m.status
                          )}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="READ">READ</option>
                          <option value="REPLIED">REPLIED</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetail(m)}
                            className="p-2 rounded-lg text-espresso hover:bg-gold/20 hover:text-gold transition-colors"
                            title="View Full Message"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="p-2 rounded-lg text-terracotta hover:bg-terracotta/10 transition-colors"
                            title="Delete Message"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<768px) */}
            <div className="md:hidden space-y-4">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className="card p-5 bg-champagne/60 border border-sand/70 rounded-xl space-y-3 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-espresso text-base">{m.name}</h4>
                      <a href={`mailto:${m.email}`} className="text-xs text-taupe hover:text-gold">
                        {m.email}
                      </a>
                    </div>
                    <select
                      value={m.status}
                      disabled={updatingId === m._id}
                      onChange={(e) => handleStatusChange(m._id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${statusBadgeClass(
                        m.status
                      )}`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="READ">READ</option>
                      <option value="REPLIED">REPLIED</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>

                  <p className="text-xs text-taupe line-clamp-3 bg-ivory/60 p-3 rounded-lg border border-sand/50">
                    "{m.message}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-sand/60 text-xs text-taupe">
                    <span>
                      {new Date(m.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(m)}
                        className="px-3 py-1.5 rounded-lg bg-gold text-espresso font-medium text-xs flex items-center gap-1 shadow-xs"
                      >
                        <FiEye /> View
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="p-1.5 rounded-lg text-terracotta hover:bg-terracotta/10"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-ivory rounded-2xl border border-sand/80 shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-espresso text-ivory p-5">
              <div className="flex items-center gap-2">
                <FiMessageSquare className="text-gold" />
                <h3 className="font-serif text-lg font-semibold">Contact Message Details</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-taupe hover:text-ivory transition-colors p-1"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Customer Info Card */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-champagne/60 border border-sand/70 text-sm">
                <div>
                  <span className="text-xs text-taupe flex items-center gap-1 font-medium">
                    <FiUser /> Customer Name
                  </span>
                  <p className="font-semibold text-espresso mt-0.5">{selectedMessage.name}</p>
                </div>
                <div>
                  <span className="text-xs text-taupe flex items-center gap-1 font-medium">
                    <FiMail /> Customer Email
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="font-semibold text-gold hover:underline mt-0.5 block"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <span className="text-xs text-taupe flex items-center gap-1 font-medium">
                    <FiCalendar /> Submitted Date
                  </span>
                  <p className="text-xs font-medium text-espresso mt-0.5">
                    {new Date(selectedMessage.createdAt).toLocaleString("en-IN", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-taupe font-medium block">Current Status</span>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(selectedMessage._id, e.target.value)}
                    className={`mt-1 text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer ${statusBadgeClass(
                      selectedMessage.status
                    )}`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="READ">READ</option>
                    <option value="REPLIED">REPLIED</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              {/* Full Message Box */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-taupe mb-2">
                  Full Customer Message
                </h4>
                <div className="p-4 rounded-xl bg-white border border-sand/70 text-espresso text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-champagne/40 border-t border-sand/70 p-4 flex items-center justify-between">
              <a
                href={`mailto:${selectedMessage.email}?subject=RE:%20Inquiry%20to%20MehzHaya&body=Hi%20${encodeURIComponent(
                  selectedMessage.name
                )},%0A%0AThank%20you%20for%20contacting%20MehzHaya!`}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
              >
                <FiMail /> Reply via Email
              </a>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 rounded-xl bg-sand/50 text-espresso text-xs font-semibold hover:bg-sand transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminContactMessages;
