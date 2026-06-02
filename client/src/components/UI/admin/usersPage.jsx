import React from "react";

const UsersPage = ({ users, usersLoading, onRoleChange, onDeleteUser }) => {
    if (usersLoading) {
        return (
            <div className="text-center py-10 text-slate-600 font-semibold">
                იტვირთება მომხმარებლები...
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 font-medium">
                მომხმარებლები არ მოიძებნა
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold text-sm">
                        <th className="p-4">სახელი</th>
                        <th className="p-4">ელ-ფოსტა</th>
                        <th className="p-4">როლი</th>
                        <th className="p-4 text-center">მოქმედება</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                    {users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-medium text-slate-900">{user.fullname}</td>
                            <td className="p-4 text-slate-500">{user.email}</td>
                            <td className="p-4">
                                <select
                                    value={user.role || "user"}
                                    onChange={(e) => onRoleChange(user._id, e.target.value)}
                                    className="bg-slate-100 border border-slate-200 rounded-xl px-2 py-1 outline-none text-slate-800 font-medium text-xs focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                                >
                                    <option value="user">User</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td className="p-4 text-center">
                                <button
                                    onClick={() => onDeleteUser(user._id)}
                                    className="text-red-500 hover:text-red-700 font-semibold transition-colors px-3 py-1 rounded-xl hover:bg-red-50 cursor-pointer"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersPage; 