import axios from "axios";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import Dock from '../../components/Dock.jsx';
import PillNav from '../../components/PillNav.jsx';
import { toast } from "react-hot-toast";
import TradeModal from "../../components/Trademodal.jsx";
import { WatchlistRowActions } from "../../components/WatchlistRowActions.jsx";
import { OrdersRowActions } from "../../components/OrdersRowActions.jsx";
import { HoldingsRowActions } from "../../components/HoldingRowActions.jsx";
import Navbar from "../../components/Navbar.jsx";

import {
    TrendingUp,
    TrendingDown,
    Bell,
    User,
    ArrowLeft,
    ShoppingCart,
    Package,
    Eye,
    Compass,
    Flame,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function StockDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("explore");
    const [gainers, setGainers] = useState([]);
    const [losers, setLosers] = useState([]);
    const [activeStocks, setActiveStocks] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [watchlistStocks, setWatchlistStocks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [hoverRow, setHoverRow] = useState(null);
    const [hoverStock, setHoverStock] = useState(null);

    // ── Trade Modal state ──────────────────────────────────────────
    const [tradeModal, setTradeModal] = useState({
        open: false,
        mode: "BUY",
        holding: null,
    });
    const openTrade = (mode, holding) => setTradeModal({ open: true, mode, holding });
    const closeTrade = () => setTradeModal((m) => ({ ...m, open: false }));
    // ──────────────────────────────────────────────────────────────

    const items = [
        { icon: <Compass size={30} strokeWidth={1.2} />, label: 'Explore', onClick: () => setActiveTab("explore") },
        { icon: <Package size={30} strokeWidth={1.2} />, label: 'Holdings', onClick: () => setActiveTab("holdings") },
        { icon: <Eye size={30} strokeWidth={1.2} />, label: 'Watchlist', onClick: () => setActiveTab("watchlist") },
        { icon: <ShoppingCart size={30} strokeWidth={1.2} />, label: 'Orders', onClick: () => setActiveTab("orders") },
    ];

    const totalInvested = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
    const totalCurrentValue = holdings.reduce((sum, h) => {
        const stock = stocks.find(s => s.symbol === h.symbol);
        return stock ? sum + (stock.price * h.quantity) : sum;
    }, 0);
    const totalPL = totalCurrentValue - totalInvested;
    const totalPLPercent = totalInvested ? (totalPL / totalInvested) * 100 : 0;

    const totalDayChange = holdings.reduce((sum, h) => {
        const stock = stocks.find(s => s.symbol === h.symbol);
        return stock ? sum + (stock.change * h.quantity) : sum;
    }, 0);
    const totalDayPercent = totalCurrentValue !== 0 ? (totalDayChange / totalCurrentValue) * 100 : 0;

    // ── Fetch helpers ──────────────────────────────────────────────
    const fetchExploreData = async () => {
        try {
            const [gainersRes, losersRes, activeRes] = await Promise.all([
                axios.get(`${API}/explore/gainers`),
                axios.get(`${API}/explore/losers`),
                axios.get(`${API}/explore/most-active`),
            ]);
            setGainers(gainersRes.data);
            setLosers(losersRes.data);
            setActiveStocks(activeRes.data);
        } catch (err) {
            console.error("Explore fetch error:", err);
        }
    };

    const fetchAllStocks = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API}/stocks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHoldings(res.data.holdings || []);
            setWatchlistStocks(res.data.watchlist || []);
            setOrders(res.data.orders || []);
        } catch (err) {
            console.error("Failed to fetch stocks:", err);
        }
    };

    const fetchLivePrices = async () => {
        try {
            const symbols = [
                ...holdings.map(h => h.symbol),
                ...watchlistStocks.map(w => w.symbol),
                ...orders.map(o => o.symbol),
            ];
            const unique = [...new Set(symbols)];
            const results = await Promise.all(
                unique.map(async (symbol) => {
                    const [quote, profile] = await Promise.all([
                        axios.get(`https://finnhub.io/api/v1/quote`, {
                            params: { symbol, token: import.meta.env.VITE_FINNHUB_API_KEY },
                        }),
                        axios.get(`https://finnhub.io/api/v1/stock/profile2`, {
                            params: { symbol, token: import.meta.env.VITE_FINNHUB_API_KEY },
                        }),
                    ]);
                    return {
                        symbol,
                        name: profile.data.name,
                        price: quote.data.c,
                        change: quote.data.d,
                        changesPercentage: quote.data.dp,
                    };
                })
            );
            setStocks(results);
        } catch (err) {
            console.error("Live price fetch error:", err);
        }
    };

    // ── Trade handlers ─────────────────────────────────────────────
    const handleBuy = async (holding) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post(`${API}/stock/${holding.symbol}/buy`,
                { quantity: holding.qty ?? 1, price: holding.avgPrice, name: holding.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Bought ${holding.symbol} successfully`);
            await fetchAllStocks();
        } catch (err) {
            toast.error(`Buy failed`);
            console.error(err);
        }
    };

    const handleSell = async (holding) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post(`${API}/stock/${holding.symbol}/sell`,
                { quantity: holding.qty ?? 1, price: holding.avgPrice },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Sold ${holding.symbol} successfully`);
            await fetchAllStocks();
        } catch (err) {
            toast.error(`Sell failed`);
            console.error(err);
        }
    };

    const handleRemoveFromWatchlist = async (symbol) => {

        try {
            const token = localStorage.getItem("accessToken");

            await axios.delete(`${API}/watchlist/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setWatchlistStocks(prev =>
                prev.filter(item => item.symbol !== symbol)
            );


        } catch (err) {
            toast.error("Failed to remove", { id });

            // rollback
            fetchAllStocks();
        }
    };

    useEffect(() => {
        if (holdings.length || watchlistStocks.length) {
            fetchLivePrices();
            const interval = setInterval(fetchLivePrices, 15000);
            return () => clearInterval(interval);
        }
    }, [holdings, watchlistStocks]);

    useEffect(() => {
        fetchExploreData();
        const interval = setInterval(fetchExploreData, 300000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => { fetchAllStocks(); }, []);

    useEffect(() => {
        if (location.state?.tab) setActiveTab(location.state.tab);
    }, [location.state]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700">
            <Navbar />
            <div className="relative">

                {/* ── Header ── */}
                <div>
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex justify-center">
                            <PillNav
                                items={[
                                    { label: 'Stocks', href: '/stocks' },
                                    { label: 'Positions', href: '/fno' },
                                    { label: 'Mutual Funds', href: '/MutualFunds' },
                                ]}
                                activeHref="/"
                                className="custom-nav"
                                ease="power2.easeOut"
                                baseColor="#000000"
                                pillColor="#ffffff"
                                hoveredPillTextColor="#ffffff"
                                pillTextColor="#000000"
                                theme="light"
                                initialLoadAnimation={false}
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">

                    {/* ── Dock ── */}
                    <div className="relative flex justify-center mb-8">
                        <div className="h-[90px] flex items-center">
                            <Dock items={items} panelHeight={70} baseItemSize={60} magnification={80} />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">

                        {/* ════════════════ EXPLORE TAB ════════════════ */}
                        {activeTab === "explore" && (
                            <motion.div
                                key="explore"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Trending */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Flame className="h-5 w-5 text-[#fee685]" />
                                        <h3 className="text-xl font-bold text-white">Trending Stocks</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeStocks.map((stock, index) => (
                                            <motion.div
                                                key={stock.symbol}
                                                onClick={() => navigate(`/stock/${stock.symbol}`)}
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                whileHover={{ scale: 1.02 }}
                                                className="bg-slate-800/90 border-2 border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:border-amber-200 duration-100"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-white">{stock.name}</h4>
                                                    <div className="flex flex-col items-end">
                                                        <div className="text-lg font-semibold text-white">${stock.price.toFixed(2)}</div>
                                                        <div className="text-sm font-semibold text-green-400">
                                                            {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changesPercentage.toFixed(2)}%)
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Gainers & Losers */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="h-5 w-5 text-green-400" />
                                            <h3 className="text-xl font-bold text-white">Top Gainers</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {gainers.map((stock, index) => (
                                                <motion.div
                                                    key={stock.symbol}
                                                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="bg-slate-800/90 border-2 border-slate-700/50 rounded-2xl p-4 cursor-pointer hover:border-green-400 duration-100"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-white">{stock.name}</h4>
                                                        <div className="text-right">
                                                            <div className="font-semibold text-white">${stock.price}</div>
                                                            <div className={`text-sm font-semibold ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                                {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changesPercentage.toFixed(2)}%)
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingDown className="h-5 w-5 text-red-400" />
                                            <h3 className="text-xl font-bold text-white">Top Losers</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {losers.map((stock, index) => (
                                                <motion.div
                                                    key={stock.symbol}
                                                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="bg-slate-800/90 border-2 border-slate-700/50 rounded-2xl p-4 cursor-pointer hover:border-red-400 duration-100"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-white">{stock.symbol}</h4>
                                                            <p className="text-xs text-slate-400">{stock.name}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold text-white">${stock.price}</div>
                                                            <div className={`text-sm font-semibold ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                                {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changesPercentage.toFixed(2)}%)
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ════════════════ HOLDINGS TAB ════════════════ */}
                        {activeTab === "holdings" && (
                            <motion.div
                                key="holdings"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="rounded-2xl p-5 shadow-lg hover:bg-slate-800/60">
                                        <div className="text-sm text-slate-400">Total Invested</div>
                                        <div className="text-2xl font-bold text-white">${totalInvested.toLocaleString()}</div>
                                    </div>
                                    <div className="rounded-2xl p-5 shadow-lg hover:bg-slate-800/60">
                                        <div className="text-sm text-slate-400">Current Value</div>
                                        <div className="text-2xl font-bold text-white">${totalCurrentValue.toLocaleString()}</div>
                                    </div>
                                    <div className="rounded-2xl p-5 shadow-lg hover:bg-slate-800/60">
                                        <div className="text-sm text-slate-400">1D Returns</div>
                                        <div className={`text-2xl font-bold ${totalDayChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {totalDayChange >= 0 ? "+" : ""}${totalDayChange.toFixed(2)}
                                        </div>
                                        <div className={`text-sm ${totalDayChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            ({totalDayPercent.toFixed(2)}%)
                                        </div>
                                    </div>
                                    <div className="rounded-2xl p-5 shadow-lg hover:bg-slate-800/60">
                                        <div className="text-sm text-slate-400">Total P&L</div>
                                        <div className={`text-2xl font-bold ${totalPL >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {totalPL >= 0 ? "+" : ""}${totalPL.toFixed(2)}
                                        </div>
                                        <div className={`text-sm ${totalPL >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            ({totalPLPercent.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>

                                {/* Holdings Table — doc-4 styling */}
                                {/* Holdings Table */}
                                <div className="space-y-4">
                                    <table className="w-full text-sm">
                                        <thead className="text-slate-400 border-b border-slate-700">
                                            <tr>
                                                <th className="text-center pb-3">Instrument</th>
                                                <th className="text-center pb-3">Day Change</th>
                                                <th className="text-center pb-3">Returns</th>
                                                <th className="text-left pl-10 pb-3">Current (Invested)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {holdings.map((holding, index) => {
                                                const stock = stocks.find(s => s.symbol === holding.symbol);
                                                const price = stock?.price ?? holding.avgPrice;
                                                const dayChange = stock?.change ?? 0;
                                                const curValue = price * holding.quantity;
                                                const invested = holding.avgPrice * holding.quantity;
                                                const pnl = curValue - invested;
                                                const pnlPercent = (pnl / invested) * 100;
                                                const dayPercent = stock?.changesPercentage ?? 0;
                                                const isProfit = pnl >= 0;
                                                const dayPositive = dayChange >= 0;

                                                return (
                                                    <motion.tr
                                                        key={holding._id}
                                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                        className={`border-b border-slate-700/40 transition-colors duration-150 ${hoverRow === holding._id ? 'bg-slate-800/60' : ''}`}
                                                        onMouseEnter={() => setHoverRow(holding._id)}
                                                        onMouseLeave={() => setHoverRow(null)}
                                                    >
                                                        {/* Instrument */}
                                                        <td className="px-4 py-3 cursor-pointer text-center"
                                                            onClick={() => navigate(`/stock/${holding.symbol}`)}
                                                            onMouseEnter={() => setHoverStock(holding._id)}
                                                            onMouseLeave={() => setHoverStock(null)} >
                                                            <div
                                                                className={`font-semibold transition-colors ${hoverStock === holding._id ? 'text-amber-300' : 'text-slate-300'}`}
                                                            >
                                                                {holding.name || holding.symbol}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {holding.quantity} shares • Avg ${holding.avgPrice.toFixed(2)}
                                                            </div>
                                                        </td>

                                                        {/* Day Change */}
                                                        <td className="px-4 py-3 text-center">
                                                            <div className={dayPositive ? "text-green-400" : "text-red-400"}>
                                                                {dayPositive ? "+" : ""}${dayChange.toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">({dayPercent.toFixed(2)}%)</div>
                                                        </td>

                                                        {/* Returns */}
                                                        <td className="px-4 py-3 text-center">
                                                            <div className={isProfit ? "text-green-400" : "text-red-400"}>
                                                                {isProfit ? "+" : ""}${pnl.toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">({pnlPercent.toFixed(2)}%)</div>
                                                        </td>

                                                        {/* Current (Invested) + Actions */}
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-evenly">
                                                                <div>
                                                                    <div className="font-semibold text-white">${curValue.toLocaleString()}</div>
                                                                    <div className="text-xs text-slate-400">${invested.toLocaleString()}</div>
                                                                </div>
                                                                <HoldingsRowActions
                                                                    holding={holding}
                                                                    hoverRow={hoverRow}
                                                                    stocks={stocks}
                                                                    onTraded={fetchAllStocks}
                                                                />
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* ════════════════ WATCHLIST TAB ════════════════ */}
                        {activeTab === "watchlist" && (
                            <motion.div
                                key="watchlist"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <table className="w-full text-sm">
                                    <thead className="text-slate-400 border-b border-slate-700">
                                        <tr>
                                            <th className="text-center pb-3">Instrument</th>
                                            <th className="text-center pb-3">Day Change</th>
                                            <th className="text-left pl-14 pb-3">Current (Invested)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stocks
                                            .filter(s => watchlistStocks.some(w => w.symbol === s.symbol))
                                            .map((stock, index) => {
                                                const holding = holdings.find(h => h.symbol === stock.symbol);
                                                const dayChange = stock.change ?? 0;
                                                const dayPercent = stock.changesPercentage ?? 0;
                                                const dayPositive = dayPercent >= 0;
                                                const price = stock.price ?? 0;

                                                return (
                                                    <motion.tr
                                                        key={stock.symbol}
                                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                        className={`border-b border-slate-700/40 transition-colors duration-150 ${hoverRow === stock.symbol ? 'bg-slate-800/60' : ''}`}
                                                        onMouseEnter={() => setHoverRow(stock.symbol)}
                                                        onMouseLeave={() => setHoverRow(null)}
                                                    >
                                                        {/* Instrument */}
                                                        <td
                                                            className="px-4 py-3 cursor-pointer text-center"
                                                            onClick={() => navigate(`/stock/${stock.symbol}`)}
                                                            onMouseEnter={() => setHoverStock(stock.symbol)}
                                                            onMouseLeave={() => setHoverStock(null)}
                                                        >
                                                            <div className={`font-semibold transition-colors ${hoverStock === stock.symbol ? 'text-amber-300' : 'text-slate-300'}`}>
                                                                {stock.name || stock.symbol}
                                                            </div>
                                                            {holding ? (
                                                                <div className="text-xs text-slate-400">
                                                                    {holding.quantity} shares • Avg ${holding.avgPrice}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-slate-400">{stock.symbol}</div>
                                                            )}
                                                        </td>

                                                        {/* Day Change */}
                                                        <td className="px-4 py-3 text-center">
                                                            <div className={dayPositive ? "text-green-400" : "text-red-400"}>
                                                                {dayPositive ? "+" : ""}${dayChange.toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">({dayPercent.toFixed(2)}%)</div>
                                                        </td>

                                                        {/* Price + WatchlistRowActions (fancy glass menu + TradeModal + AlertModal) */}
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-evenly">
                                                                <span className="font-semibold text-white">${price.toFixed(2)}</span>
                                                                <WatchlistRowActions
                                                                    stock={stock}
                                                                    hoverRow={hoverRow}
                                                                    navigate={navigate}
                                                                    holdings={holdings}
                                                                    onRemove={handleRemoveFromWatchlist}
                                                                    onTraded={fetchAllStocks}
                                                                />
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {/* ════════════════ ORDERS TAB ════════════════ */}
                        {activeTab === "orders" && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <table className="w-full text-sm">
                                    <thead className="text-slate-400 border-b border-slate-700">
                                        <tr>
                                            <th className="text-center pb-3">Stock</th>
                                            <th className="text-center pb-3">Type</th>
                                            <th className="text-center pb-3">Quantity</th>
                                            <th className="text-center pb-3">Price</th>
                                            <th className="text-center pb-3">Status</th>
                                            <th className="text-left pl-10 pb-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders
                                            .filter(order => {
                                                const today = new Date();
                                                const orderDate = new Date(order.placedAt);

                                                return (
                                                    (orderDate.getDate() === today.getDate() &&
                                                        orderDate.getMonth() === today.getMonth() &&
                                                        orderDate.getFullYear() === today.getFullYear()) ||
                                                    (order.status === "PENDING")
                                                );
                                            })
                                            .map((order, index) => (
                                                <motion.tr
                                                    key={order._id}
                                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                    className={`border-b border-slate-700/40 transition-colors duration-150 ${hoverRow === order._id ? 'bg-slate-800/60' : ''}`}
                                                    onMouseEnter={() => setHoverRow(order._id)}
                                                    onMouseLeave={() => setHoverRow(null)}
                                                >
                                                    <td
                                                        className="px-4 py-3 cursor-pointer text-center"
                                                        onClick={() => navigate(`/stock/${order.symbol}`)}
                                                        onMouseEnter={() => setHoverStock(order._id)}
                                                        onMouseLeave={() => setHoverStock(null)}
                                                    >
                                                        <div className={`font-semibold transition-colors ${hoverStock === order._id ? 'text-amber-300' : 'text-slate-300'}`}>
                                                            {stocks.find(s => s.symbol === order.symbol)?.name || order.symbol}
                                                        </div>
                                                        <div className="text-xs text-slate-400">{order.symbol}</div>
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`font-semibold ${order.type === "BUY" ? "text-green-400" : "text-red-400"}`}>
                                                            {order.type}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 text-center text-slate-400">{order.quantity}</td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-center text-white">${order.price}</div>
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`font-semibold ${order.status === "Executed" ? "text-green-400"
                                                            : order.status === "Pending" ? "text-yellow-400"
                                                                : "text-slate-400"
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 text-slate-400">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-sm">
                                                                    {new Date(order.placedAt).toLocaleDateString("en-IN", {
                                                                        day: "2-digit", month: "short", year: "numeric",
                                                                    })}
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {new Date(order.placedAt).toLocaleTimeString("en-IN", {
                                                                        hour: "2-digit", minute: "2-digit",
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <OrdersRowActions
                                                                order={order}
                                                                hoverRow={hoverRow}
                                                                stocks={stocks}
                                                                onRefresh={fetchAllStocks}
                                                            />
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Trade Modal (Holdings tab buy/sell) ── */}
            <TradeModal
                isOpen={tradeModal.open}
                onClose={closeTrade}
                mode={tradeModal.mode}
                holding={tradeModal.holding}
                currentPrice={stocks.find(s => s.symbol === tradeModal.holding?.symbol)?.price}
                onConfirm={async ({ symbol, quantity, price, mode }) => {
                    const holding = { ...tradeModal.holding, avgPrice: price, qty: quantity };
                    if (mode === "BUY") await handleBuy(holding);
                    else await handleSell(holding);
                }}
            />
        </div>
    );
}