import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API = import.meta.env.VITE_API_URL;

export default function OrdersPage() {
    const [orders, setOrders] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("accessToken");

            const res = await axios.get(`${API}/allorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const grouped = groupByDate(res.data.orders);
            setOrders(grouped);

        } catch (err) {
            console.error("Failed to fetch orders", err);
        }
    };

    // 🔥 GROUP BY DATE
    const groupByDate = (ordersArray) => {
        return ordersArray.reduce((acc, order) => {
            const date = new Date(order.placedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

            if (!acc[date]) acc[date] = [];
            acc[date].push(order);

            return acc;
        }, {});
    };

    return (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700">
            <Navbar />
            <div className="min-h-screen px-6 py-8 text-white">

                <div className="max-w-6xl mx-auto">


                    <h1 className="text-2xl font-bold mb-6">All Orders</h1>

                    {Object.keys(orders).length === 0 && (
                        <div className="text-slate-400">No orders found</div>
                    )}

                    {Object.entries(orders).map(([date, ordersList]) => (
                        <div key={date} className="mb-8">

                            {/* DATE HEADER */}
                            <h2 className="text-lg font-semibold text-slate-300 mb-3">
                                {date}
                            </h2>

                            {/* TABLE */}
                            <div className="bg-slate-900/60 border-2 border-slate-700/40 rounded-2xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="text-slate-400 border-b border-slate-700">
                                        <tr>
                                            <th className="text-left px-4 py-3">Stock</th>
                                            <th className="text-left px-4 py-3">Type</th>
                                            <th className="text-left px-4 py-3">Qty</th>
                                            <th className="text-left px-4 py-3">Price</th>
                                            <th className="text-left px-4 py-3">Status</th>
                                            <th className="text-left px-4 py-3">Time</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {ordersList.map((order, index) => (
                                            <motion.tr
                                                key={order._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-slate-700/40 hover:bg-slate-800/50 transition"
                                            >
                                                {/* STOCK */}
                                                <td
                                                    className="px-4 py-3 cursor-pointer hover:text-blue-400"
                                                    onClick={() => navigate(`/stock/${order.symbol}`)}
                                                >
                                                    <div className="font-semibold">
                                                        {order.symbol}
                                                    </div>
                                                </td>

                                                {/* TYPE */}
                                                <td className="px-4 py-3">
                                                    <span className={`font-semibold ${order.type === "BUY"
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                        }`}>
                                                        {order.type}
                                                    </span>
                                                </td>

                                                {/* QTY */}
                                                <td className="px-4 py-3 text-slate-300">
                                                    {order.quantity}
                                                </td>

                                                {/* PRICE */}
                                                <td className="px-4 py-3 font-semibold">
                                                    ${order.price}
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-4 py-3">
                                                    <span className={`font-semibold ${order.status === "EXECUTED"
                                                        ? "text-green-400"
                                                        : order.status === "PENDING"
                                                            ? "text-yellow-400"
                                                            : "text-slate-400"
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>

                                                {/* TIME */}
                                                <td className="px-4 py-3 text-slate-400">
                                                    {new Date(order.placedAt).toLocaleTimeString("en-IN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}