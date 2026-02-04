import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import { IoArrowBackSharp } from "react-icons/io5";

function DeliveryHistory() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canView = userData?.role === "deliveryBoy";

  const formatDateTime = useMemo(
    () =>
      (date) => {
        if (!date) return "—";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    [],
  );

  useEffect(() => {
    if (!canView) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${serverUrl}/api/order/delivery-history`, {
          withCredentials: true,
        });
        setHistory(res.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load delivery history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [canView]);

  if (!canView) {
    return (
      <div className="min-h-screen bg-[#fff0e6] px-4 py-6 md:px-8">
        <div className="max-w-[900px] mx-auto bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <p className="text-gray-700 font-semibold">Not authorized</p>
          <p className="text-gray-500 text-sm">This page is for delivery boys only.</p>
          <button
            className="mt-4 bg-[#ff4d2d] text-white px-4 py-2 rounded-lg"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff0e6] px-4 py-6 md:px-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="h-10 w-10 rounded-full bg-white border border-orange-100 shadow-sm flex items-center justify-center hover:shadow-md transition"
          aria-label="Go back"
        >
          <IoArrowBackSharp size={22} className="text-[#ff4d2d]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-sm text-gray-500">Completed tasks</p>
        </div>
      </div>

      <div className="max-w-[900px] w-full mx-auto">
        {loading ? (
          <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm text-gray-600">
            Loading...
          </div>
        ) : error ? (
          <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm text-gray-600">
            No completed deliveries yet.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((h) => (
              <div
                key={`${h.orderId}-${h.shopOrderId}`}
                className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#ff4d2d]">{h.shopName}</p>
                    <p className="text-xs text-gray-500">Order #{String(h.orderId).slice(0, 6).toUpperCase()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                    Delivered
                  </span>
                </div>

                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="text-gray-500 font-medium">Delivered at: </span>
                    {formatDateTime(h.deliveredAt)}
                  </p>
                  <p>
                    <span className="text-gray-500 font-medium">Customer: </span>
                    {h.customer?.fullname || "—"} {h.customer?.mobile ? `(${h.customer.mobile})` : ""}
                  </p>
                  <p>
                    <span className="text-gray-500 font-medium">Address: </span>
                    {h.deliveryAddress?.text || "—"}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <div className="px-3 py-1 rounded-lg bg-orange-50 text-orange-700 font-semibold">
                    Items: {h.itemsCount}
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-orange-50 text-orange-700 font-semibold">
                    Subtotal: ₹{h.subTotal}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryHistory;
