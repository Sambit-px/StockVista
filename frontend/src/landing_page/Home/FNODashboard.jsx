import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    TrendingUp,
    TrendingDown,
    Search,
    Bell,
    User,
    ArrowLeft,
    Target,
    Activity,
    AlertCircle,
    Package,
    RefreshCw,
    Download,
    ShoppingCart,
} from "lucide-react";

function FNODashboard({ onNavigate }) {
    const [activeTab, setActiveTab] = useState("holdings");
    const [refreshing, setRefreshing] = useState(false);

    const holdings = [
        {
            symbol: "NIFTY",
            expiry: "25 Jan 2026",
            strikePrice: 21500,
            type: "CE",
            quantity: 50,
            avgPrice: 142.8,
            ltp: 152.3,
            invested: 7140,
            currentValue: 7615,
            pl: 475,
            plPercent: 6.65,
        },
        {
            symbol: "BANKNIFTY",
            expiry: "25 Jan 2026",
            strikePrice: 45000,
            type: "PE",
            quantity: 25,
            avgPrice: 187.25,
            ltp: 179.8,
            invested: 4681.25,
            currentValue: 4495,
            pl: -186.25,
            plPercent: -3.98,
        },
        {
            symbol: "RELIANCE",
            expiry: "30 Jan 2026",
            strikePrice: 2550,
            type: "FUT",
            quantity: 250,
            avgPrice: 2545.3,
            ltp: 2557.65,
            invested: 636325,
            currentValue: 639412.5,
            pl: 3087.5,
            plPercent: 0.49,
        },
    ];

    const positions = [
        {
            symbol: "NIFTY",
            expiry: "25 Jan 2026",
            strikePrice: 21500,
            type: "CE",
            quantity: 50,
            buyPrice: 145.5,
            ltp: 152.3,
            pl: 340,
            plPercent: 4.67,
        },
        {
            symbol: "BANKNIFTY",
            expiry: "25 Jan 2026",
            strikePrice: 45000,
            type: "PE",
            quantity: 25,
            buyPrice: 187.25,
            ltp: 179.8,
            pl: -186.25,
            plPercent: -3.98,
        },
        {
            symbol: "RELIANCE",
            expiry: "30 Jan 2026",
            strikePrice: 2550,
            type: "FUT",
            quantity: 250,
            buyPrice: 2545.3,
            ltp: 2557.65,
            pl: 3087.5,
            plPercent: 0.49,
        },
        {
            symbol: "TCS",
            expiry: "30 Jan 2026",
            strikePrice: 3850,
            type: "CE",
            quantity: 100,
            buyPrice: 65.4,
            ltp: 58.2,
            pl: -720,
            plPercent: -11.01,
        },
    ];

    const orders = [
        {
            id: "FNO001",
            symbol: "NIFTY 21500 CE",
            type: "BUY",
            quantity: 50,
            price: 145.5,
            status: "Executed",
            time: "10:15 AM",
            expiry: "25 Jan 2026",
        },
        {
            id: "FNO002",
            symbol: "BANKNIFTY 45000 PE",
            type: "SELL",
            quantity: 25,
            price: 192.0,
            status: "Pending",
            time: "11:30 AM",
            expiry: "25 Jan 2026",
        },
        {
            id: "FNO003",
            symbol: "RELIANCE FUT",
            type: "BUY",
            quantity: 250,
            price: 2545.3,
            status: "Executed",
            time: "09:45 AM",
            expiry: "30 Jan 2026",
        },
        {
            id: "FNO004",
            symbol: "TCS 3850 CE",
            type: "SELL",
            quantity: 100,
            price: 70.0,
            status: "Cancelled",
            time: "12:00 PM",
            expiry: "30 Jan 2026",
        },
    ];

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
    const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const holdingsPL = totalCurrentValue - totalInvested;
    const totalPL = positions.reduce((sum, p) => sum + p.pl, 0);

    const marginUsed = 145680;
    const marginAvailable = 354320;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => onNavigate("home")}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-semibold">Back to Home</span>
                        </button>
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleRefresh}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <User className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold mb-2">F&O Trading</h1>
                        <p className="text-sm opacity-90">Futures & Options with advanced strategies</p>
                    </motion.div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer"
                        >
                            <div className="text-sm opacity-90 mb-1">Total P&L</div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-2xl font-bold ${(holdingsPL + totalPL) >= 0 ? "text-green-300" : "text-red-300"}`}
                                >
                                    ₹{(holdingsPL + totalPL).toLocaleString()}
                                </span>
                                {(holdingsPL + totalPL) >= 0 ? (
                                    <TrendingUp className="h-5 w-5 text-green-300" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-red-300" />
                                )}
                            </div>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer"
                        >
                            <div className="text-sm opacity-90 mb-1">Margin Used</div>
                            <div className="text-2xl font-bold">₹{marginUsed.toLocaleString()}</div>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer"
                        >
                            <div className="text-sm opacity-90 mb-1">Margin Available</div>
                            <div className="text-2xl font-bold">₹{marginAvailable.toLocaleString()}</div>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer"
                        >
                            <div className="text-sm opacity-90 mb-1">Active Positions</div>
                            <div className="text-2xl font-bold">{positions.length}</div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search contracts..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19547b]"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Target className="h-4 w-4" />
                            Option Chain
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </motion.button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 overflow-x-auto">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab("holdings")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === "holdings"
                            ? "bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white shadow-md"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Holdings
                        </div>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab("positions")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === "positions"
                            ? "bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white shadow-md"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Positions
                        </div>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab("orders")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === "orders"
                            ? "bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white shadow-md"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Orders
                        </div>
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    {/* Holdings Tab */}
                    {activeTab === "holdings" && (
                        <motion.div
                            key="holdings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {holdings.map((holding, index) => (
                                <motion.div
                                    key={`${holding.symbol}-${holding.strikePrice}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4 flex-1">
                                            <motion.div
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.5 }}
                                                className="bg-gradient-to-r from-[#ffd89b] to-[#19547b] p-3 rounded-lg"
                                            >
                                                <Activity className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg text-slate-900">
                                                        {holding.symbol} {holding.type !== "FUT" ? holding.strikePrice : ""} {holding.type}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${holding.type === "CE"
                                                            ? "bg-green-100 text-green-700"
                                                            : holding.type === "PE"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-blue-100 text-blue-700"
                                                            }`}
                                                    >
                                                        {holding.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">Exp: {holding.expiry}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-500">Qty: {holding.quantity}</span>
                                                    <span className="text-xs text-slate-500">Avg: ₹{holding.avgPrice}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <div className="text-xs text-slate-600 mb-1">LTP</div>
                                                <div className="text-lg font-semibold text-slate-900">₹{holding.ltp}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-600 mb-1">Invested</div>
                                                <div className="text-lg font-semibold text-slate-900">₹{holding.invested.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-600 mb-1">Current</div>
                                                <div className="text-lg font-semibold text-slate-900">₹{holding.currentValue.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-600 mb-1">P&L</div>
                                                <div className={`text-lg font-semibold ${holding.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {holding.pl >= 0 ? '+' : ''}₹{holding.pl.toFixed(2)}
                                                </div>
                                                <div className={`text-xs ${holding.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ({holding.pl >= 0 ? '+' : ''}{holding.plPercent}%)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                                            >
                                                Exit
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Positions Tab */}
                    {activeTab === "positions" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Contract</th>
                                            <th className="px-6 py-4 text-left font-semibold">Type</th>
                                            <th className="px-6 py-4 text-right font-semibold">Qty</th>
                                            <th className="px-6 py-4 text-right font-semibold">Buy Price</th>
                                            <th className="px-6 py-4 text-right font-semibold">LTP</th>
                                            <th className="px-6 py-4 text-right font-semibold">P&L</th>
                                            <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {positions.map((position, index) => (
                                            <motion.tr
                                                key={`${position.symbol}-${position.strikePrice}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-semibold text-slate-900">
                                                            {position.symbol}{" "}
                                                            {position.type !== "FUT" ? position.strikePrice : ""} {position.type}
                                                        </div>
                                                        <div className="text-xs text-slate-600">Exp: {position.expiry}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${position.type === "CE"
                                                            ? "bg-green-100 text-green-700"
                                                            : position.type === "PE"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-blue-100 text-blue-700"
                                                            }`}
                                                    >
                                                        {position.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-900">{position.quantity}</td>
                                                <td className="px-6 py-4 text-right text-slate-900">₹{position.buyPrice}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                                    ₹{position.ltp}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div
                                                        className={`font-semibold ${position.pl >= 0 ? "text-green-600" : "text-red-600"
                                                            }`}
                                                    >
                                                        {position.pl >= 0 ? "+" : ""}₹{position.pl.toFixed(2)}
                                                    </div>
                                                    <div
                                                        className={`text-xs ${position.pl >= 0 ? "text-green-600" : "text-red-600"
                                                            }`}
                                                    >
                                                        ({position.pl >= 0 ? "+" : ""}
                                                        {position.plPercent}%)
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold">
                                                        Exit
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                                            <th className="px-6 py-4 text-left font-semibold">Contract</th>
                                            <th className="px-6 py-4 text-left font-semibold">Type</th>
                                            <th className="px-6 py-4 text-right font-semibold">Quantity</th>
                                            <th className="px-6 py-4 text-right font-semibold">Price</th>
                                            <th className="px-6 py-4 text-center font-semibold">Status</th>
                                            <th className="px-6 py-4 text-right font-semibold">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, index) => (
                                            <motion.tr
                                                key={order.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-mono text-sm text-slate-600">{order.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{order.symbol}</div>
                                                    <div className="text-xs text-slate-600">Exp: {order.expiry}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${order.type === "BUY"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {order.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-900">{order.quantity}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                                    ₹{order.price}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === "Executed"
                                                            ? "bg-green-100 text-green-700"
                                                            : order.status === "Pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-slate-100 text-slate-700"
                                                            }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-slate-600">{order.time}</td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Risk Alert */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-4"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-orange-900">F&O Risk Reminder</h4>
                            <p className="text-sm text-orange-800 mt-1">
                                F&O trading involves higher risk. Please ensure you understand the risks and have
                                sufficient margin before trading.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default FNODashboard;