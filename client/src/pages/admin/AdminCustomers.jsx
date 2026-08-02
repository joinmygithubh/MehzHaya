import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";

import api from "../../api/axios";
import Loader from "../../components/common/Loader";

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      toast.success("Role updated");
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-espresso">
        Customers ({users.length})
      </h1>
      <div className="card overflow-x-auto bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-sand/60 bg-champagne/80 text-left font-serif text-espresso">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-sand/40 hover:bg-champagne/40 text-espresso transition-colors">
                <td className="p-3 font-serif font-semibold">{u.name}</td>
                <td className="p-3 text-taupe">{u.email}</td>
                <td className="p-3 text-taupe">{u.phone || "—"}</td>
                <td className="p-3">
                  {u.isEmailVerified ? (
                    <span className="text-sage font-bold">✓</span>
                  ) : (
                    <span className="text-sand font-bold">✗</span>
                  )}
                </td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    className="rounded-lg border border-sand bg-ivory text-espresso px-2 py-1 text-xs font-medium"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-3 text-taupe">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(u._id)} className="rounded-lg p-2 text-terracotta hover:bg-blush/60 transition-colors">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
