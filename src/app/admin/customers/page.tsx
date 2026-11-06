"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, ShoppingBag, Power, Search } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers");
      if (res.ok) setCustomers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      if (res.ok) fetchCustomers();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Customer Directory
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Registered customer accounts, repeat order statistics, and customer lifetime value.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74776D]" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#F8EBD2] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FBF8F0] border-b border-[#F8EBD2] text-[#74776D] uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Contact Details</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4">Orders Placed</th>
              <th className="py-3 px-4">Total Spending</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#74776D]">
                  Loading customers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#74776D]">
                  No customers found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/70">
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-sm text-[#263719] block">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-[#74776D]">ID: {c.id}</span>
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5">
                    <span className="font-semibold text-[#26291F] block">{c.email}</span>
                    <span className="text-[11px] text-[#74776D]">{c.phone}</span>
                  </td>

                  <td className="py-3.5 px-4 text-[#74776D]">
                    {new Date(c.joinedAt).toLocaleDateString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-[#26291F]">
                    {c.orderCount} Orders
                  </td>

                  <td className="py-3.5 px-4 font-black text-[#34451F] text-sm">
                    ₹{c.totalSpent}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        c.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleActive(c.id, c.isActive)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        c.isActive
                          ? "border border-red-300 text-red-600 hover:bg-red-50"
                          : "bg-[#34451F] text-white hover:bg-[#263719]"
                      }`}
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
