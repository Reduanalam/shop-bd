import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminFetchUsers, adminUpdateUserRole, adminDeleteUser } from "../../services/adminService.js";

const ROLES = ["customer", "seller", "admin"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = () => adminFetchUsers().then((res) => setUsers(res.data));
  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await adminUpdateUserRole(id, role);
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this user?")) return;
    await adminDeleteUser(id);
    load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Manage Users</h1>
      <div className="bg-white rounded-xl shadow-sm divide-y">
        {users.map((u) => (
          <div key={u._id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[160px]">
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
            </div>
            <span className="text-sm text-gray-500">🪙 {u.coins || 0}</span>
            <select
              value={u.role}
              onChange={(e) => changeRole(u._id, e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button onClick={() => remove(u._id)} className="text-red-500 text-sm">Delete</button>
          </div>
        ))}
        {users.length === 0 && <p className="p-4 text-gray-400">No users yet.</p>}
      </div>
    </div>
  );
}
