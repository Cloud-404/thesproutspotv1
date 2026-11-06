"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DeliveryPartnerProfile, Order } from "@/lib/types";
import {
  Bike,
  CheckCircle2,
  Phone,
  Power,
  RefreshCw,
  ShoppingBag,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminDeliveryPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [partnersRes, ordersRes] = await Promise.all([
        fetch("/api/admin/delivery-partners"),
        fetch("/api/orders"),
      ]);
      if (partnersRes.ok) setPartners(await partnersRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingAssignments = orders.filter(
    (o) =>
      !o.assignedDeliveryPartnerId &&
      o.orderStatus !== "DELIVERED" &&
      o.orderStatus !== "CANCELLED"
  );

  const inProgressDeliveries = orders.filter(
    (o) => o.orderStatus === "OUT_FOR_DELIVERY"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Delivery Fleet & Dispatch
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Monitor registered delivery partners, active routes, and pending dispatches.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F8EBD2] bg-white text-xs font-bold text-[#26291F] hover:bg-[#F8EBD2]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#74776D]">
            Registered Fleet
          </span>
          <span className="text-2xl font-black text-[#26291F] block mt-1">
            {partners.length} Partners
          </span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
            {partners.filter((p) => p.isAvailable).length} Currently Available
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#74776D]">
            Pending Assignments
          </span>
          <span className="text-2xl font-black text-amber-700 block mt-1">
            {pendingAssignments.length} Orders
          </span>
          <span className="text-[10px] text-[#74776D] block mt-0.5">
            Awaiting delivery agent dispatch
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#74776D]">
            Active on the Road
          </span>
          <span className="text-2xl font-black text-blue-700 block mt-1">
            {inProgressDeliveries.length} Deliveries
          </span>
          <span className="text-[10px] text-[#74776D] block mt-0.5">
            Currently in transit across Nimbahera
          </span>
        </div>
      </div>

      {/* Partner Roster Cards */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-[#263719]">
          Delivery Partner Profiles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xl">
                    🛵
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#26291F]">
                      {partner.name}
                    </h4>
                    <span className="text-[11px] text-[#74776D] block">
                      {partner.vehicleType} • {partner.vehicleNumber || "Verified"}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    partner.isAvailable
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {partner.isAvailable ? "Online" : "Offline"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-100">
                <div className="bg-[#FBF8F0] p-2.5 rounded-2xl">
                  <span className="text-[10px] text-[#74776D] block">Deliveries</span>
                  <span className="font-extrabold text-[#26291F]">
                    {partner.totalDeliveries} Completed
                  </span>
                </div>
                <div className="bg-[#FBF8F0] p-2.5 rounded-2xl">
                  <span className="text-[10px] text-[#74776D] block">Total Earnings</span>
                  <span className="font-extrabold text-[#34451F]">
                    ₹{partner.totalEarnings}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <a
                  href={`tel:${partner.phone}`}
                  className="font-bold text-[#34451F] hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {partner.phone}
                </a>
                <span className="text-[11px] text-[#74776D] block">
                  Commission: ₹{partner.commissionPerOrder} per completed delivery
                </span>
              </div>

              {partner.activeOrders && partner.activeOrders.length > 0 && (
                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-[#6C472B] block mb-1">
                    Currently Assigned Order:
                  </span>
                  {partner.activeOrders.map((o: Order) => (
                    <Link
                      key={o.id}
                      href={`/admin/orders/${o.id}`}
                      className="text-xs font-bold text-[#34451F] hover:underline block"
                    >
                      #{o.orderNumber} ({o.deliveryAddress.areaLocality}) →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
