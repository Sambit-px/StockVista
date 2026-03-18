import axios from "axios";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import Dock from '../../components/Dock.jsx';
import PillNav from '../../components/PillNav.jsx';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { MoreVert } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { HiListBullet } from "react-icons/hi2";
import SearchBar from "./SearchBar.jsx";

import {
    TrendingUp,
    TrendingDown,
    Search,
    Star,
    Bell,
    User,
    ArrowLeft,
    Plus,
    ShoppingCart,
    Filter,
    BarChart2,
    Package,
    RefreshCw,
    Download,
    Eye,
    Compass,
    Activity,
    Zap,
    Flame,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function StockDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("explore");
    const [gainers, setGainers] = useState([]);
    const [losers, setLosers] = useState([]);
    const [activeStocks, setActiveStocks] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [hoverRow, setHoverRow] = useState(null);

    const exploreStocks = {
        trending: [
            { symbol: "ADANIENT", name: "Adani Enterprises", price: 2847.50, change: 6.8, volume: "2.8M" },
            { symbol: "TATASTEEL", name: "Tata Steel", price: 145.30, change: 4.2, volume: "5.1M" },
            { symbol: "WIPRO", name: "Wipro Ltd", price: 445.60, change: 3.5, volume: "1.9M" },
            { symbol: "AXISBANK", name: "Axis Bank", price: 1156.80, change: 2.9, volume: "3.2M" },
        ],
        topGainers: [
            { symbol: "TITAN", name: "Titan Company", price: 3420.50, change: 8.4, volume: "980K" },
            { symbol: "ASIANPAINT", name: "Asian Paints", price: 2845.30, change: 7.2, volume: "1.2M" },
            { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 6889.75, change: 6.5, volume: "850K" },
        ],
        topLosers: [
            { symbol: "ZOMATO", name: "Zomato Ltd", price: 125.40, change: -5.8, volume: "4.5M" },
            { symbol: "PAYTM", name: "Paytm", price: 685.90, change: -4.2, volume: "2.8M" },
            { symbol: "NYKAA", name: "Nykaa", price: 168.50, change: -3.6, volume: "1.5M" },
        ],
    };

    const holdings = [
        { symbol: "AAPL", quantity: 20, avgPrice: 180 },
        { symbol: "MSFT", quantity: 10, avgPrice: 400 },
        { symbol: "NVDA", quantity: 5, avgPrice: 820 },
        { symbol: "TSLA", quantity: 15, avgPrice: 170 }
    ];

    // Watchlist symbols
    const watchlistStocks = [
        { symbol: "AAPL" },
        { symbol: "TSLA" },
        { symbol: "MSFT" },
        { symbol: "NVDA" },
        { symbol: "AMZN" },
        { symbol: "META" },
        { symbol: "GOOGL" },
        { symbol: "NFLX" },
        { symbol: "AMD" },
        { symbol: "INTC" }
    ];

    const orders = [
        {
            id: "ORD001",
            symbol: "RELIANCE",
            type: "BUY",
            quantity: 50,
            price: 2515.30,
            status: "Executed",
            time: "10:30 AM",
        },
        {
            id: "ORD002",
            symbol: "TCS",
            type: "SELL",
            quantity: 25,
            price: 3860.00,
            status: "Pending",
            time: "11:15 AM",
        },
        {
            id: "ORD003",
            symbol: "HDFCBANK",
            type: "BUY",
            quantity: 100,
            price: 1599.25,
            status: "Executed",
            time: "09:45 AM",
        },
        {
            id: "ORD004",
            symbol: "INFY",
            type: "SELL",
            quantity: 75,
            price: 1465.00,
            status: "Cancelled",
            time: "12:30 PM",
        },
    ];

    const items = [
        { icon: <Compass size={30} strokeWidth={1.2} />, label: 'Explore', onClick: () => setActiveTab("explore"), },
        { icon: <Package size={30} strokeWidth={1.2} />, label: 'Holdings', onClick: () => setActiveTab("holdings"), },
        { icon: <Eye size={30} strokeWidth={1.2} />, label: 'Watchlist', onClick: () => setActiveTab("watchlist"), },
        { icon: <ShoppingCart size={30} strokeWidth={1.2} />, label: 'Orders', onClick: () => setActiveTab("orders"), },
    ];


    const totalInvested = holdings.reduce((sum, h) => {
        return sum + (h.avgPrice * h.quantity);
    }, 0);

    const totalCurrentValue = holdings.reduce((sum, h) => {
        const stock = stocks.find(s => s.symbol === h.symbol);
        if (!stock) return sum;
        return sum + (stock.price * h.quantity);
    }, 0);

    const totalPL = totalCurrentValue - totalInvested;
    const totalPLPercent = (totalPL / totalInvested) * 100;
    const fetchExploreData = async () => {
        try {
            const gainersRes = await axios.get(`${API}/explore/gainers`);
            const losersRes = await axios.get(`${API}/explore/losers`);
            const activeRes = await axios.get(`${API}/explore/most-active`);
            setGainers(gainersRes.data);
            setLosers(losersRes.data);
            setActiveStocks(activeRes.data);
        } catch (err) {
            console.error("Explore fetch error:", err);
        }
    };



    // 1️⃣ Define a reusable function
    const fetchAllStocks = async (symbols) => {
        try {
            const res = await axios.get(`${API}/stocks?symbols=${symbols.join(",")}`);
            setStocks(prev => {
                const updatedStocks = prev.filter(s => !symbols.includes(s.symbol));
                return [...updatedStocks, ...res.data];
            });
            console.log("Stocks updated:", res.data);
        } catch (err) {
            console.error("Failed to fetch stocks:", err.response?.status, err.message);
        }
    };

    useEffect(() => {
        const allSymbols = [...new Set([
            ...holdings.map(h => h.symbol),
            ...watchlistStocks.map(w => w.symbol)
        ])];

        // Initial fetch
        fetchAllStocks(allSymbols);

        // Interval fetch every 3 minutes
        const interval = setInterval(() => fetchAllStocks(allSymbols), 180000);

        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        fetchExploreData(); // FMP gainers/losers/active

        const exploreInterval = setInterval(fetchExploreData, 300000); // 5 min

        return () => clearInterval(exploreInterval);
    }, []);


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700">

            <div className="relative">
                {/* Header */}
                <div>
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate("/home")}
                                className="flex items-center gap-2 px-3 py-3 rounded-3xl bg-slate-950 hover:bg-slate-700/50 backdrop-blur-sm transition-colors text-slate-300"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                {/* Search & Filters */}
                                <div className="rounded-2xl shadow-xl pt-4 px-5 mb-6 ">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 relative">
                                            <SearchBar
                                                onSelect={(symbol) => {
                                                    // Navigate to stock page on selection
                                                    navigate(`/stock/${symbol}`);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 hover:bg-slate-700/50 backdrop-blur-sm rounded-3xl transition-colors text-slate-300"
                                >
                                    <Bell className="h-5 w-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 hover:bg-slate-700/50 backdrop-blur-sm rounded-3xl transition-colors text-slate-300"
                                >
                                    <User className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>
                        <div className="flex justify-center">

                            <PillNav
                                items={[
                                    { label: 'Stocks', href: '/stocks' },
                                    { label: 'Positions', href: '/fno' },
                                    { label: 'Mutual Funds', href: '/MutualFunds' }
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


                    {/* Dock-style Tabs */}
                    <div className=" relative flex justify-center mb-8">
                        <div className="h-[90px] flex items-center">
                            <Dock
                                items={items}
                                panelHeight={70}
                                baseItemSize={60}
                                magnification={80}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Explore Tab */}
                        {activeTab === "explore" && (
                            <motion.div
                                key="explore"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Trending Stocks */}
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
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                whileHover={{ scale: 1.02 }}
                                                className="bg-slate-800/90 border-2 border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:border-amber-200 duration-100"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="text-white">{stock.name}</h4>
                                                    </div>


                                                    <div className="flex flex-col items-end">
                                                        <div className="text-lg font-semibold text-white">${stock.price.toFixed(2)}</div>
                                                        <div className="text-sm font-semibold text-green-400">{stock.change >= 0 ? "+" : ""}
                                                            {stock.change.toFixed(2)} ({stock.changesPercentage.toFixed(2)}%)
                                                        </div>
                                                    </div>


                                                </div>

                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Gainers & Losers */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Top Gainers */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="h-5 w-5 text-green-400" />
                                            <h3 className="text-xl font-bold text-white">Top Gainers</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {gainers.map((stock, index) => (
                                                <motion.div
                                                    key={stock.symbol}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="bg-slate-800/90 border-2 border-slate-700/50 rounded-2xl p-4 cursor-pointer hover:border-green-400 duration-100"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-white">{stock.name}</h4>

                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold text-white">${stock.price}</div>

                                                            <div
                                                                className={`text-sm font-semibold ${stock.change >= 0 ? "text-green-400" : "text-red-400"
                                                                    }`}
                                                            >
                                                                {stock.change >= 0 ? "+" : ""}
                                                                {stock.change.toFixed(2)} ({stock.changesPercentage.toFixed(2)}%)
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top Losers */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingDown className="h-5 w-5 text-red-400" />
                                            <h3 className="text-xl font-bold text-white">Top Losers</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {losers.map((stock, index) => (
                                                <motion.div
                                                    key={stock.symbol}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
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

                                                            <div
                                                                className={`text-sm font-semibold ${stock.change >= 0 ? "text-green-400" : "text-red-400"
                                                                    }`}
                                                            >
                                                                {stock.change >= 0 ? "+" : ""}
                                                                {stock.change.toFixed(2)} ({stock.changesPercentage.toFixed(2)}%)
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

                        {/* Holdings Tab */}
                        {activeTab === "holdings" && (
                            <motion.div
                                key="holdings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >

                                {/* Portfolio Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="rounded-2xl p-5 shadow-lg hover:bg-slate-800/60">
                                        <div className="text-sm text-slate-400">Total Invested</div>
                                        <div className="text-2xl font-bold text-white">
                                            ${totalInvested.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl p-5 shadow-lg hover:bg-slate-800/60">
                                        <div className="text-sm text-slate-400">Current Value</div>
                                        <div className="text-2xl font-bold text-white">
                                            ${totalCurrentValue.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl p-5 shadow-lg hover:bg-slate-800/60">
                                        <div className="text-sm text-slate-400">Total P&L</div>
                                        <div
                                            className={`text-2xl font-bold ${totalPL >= 0 ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {totalPL >= 0 ? "+" : ""}${totalPL.toFixed(2)}
                                        </div>
                                        <div
                                            className={`text-sm ${totalPL >= 0 ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            ({totalPLPercent.toFixed(2)}%)
                                        </div>
                                    </div>

                                    <div className="rounded-2xl p-5 shadow-lg hover:bg-slate-800/60">
                                        <div className="text-sm text-slate-400">Total P&L</div>
                                        <div
                                            className={`text-2xl font-bold ${totalPL >= 0 ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {totalPL >= 0 ? "+" : ""}${totalPL.toFixed(2)}
                                        </div>
                                        <div
                                            className={`text-sm ${totalPL >= 0 ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            ({totalPLPercent.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>

                                {/* Holdings Table */}
                                <motion.div
                                    whileHover={{ scale: 1.005 }}
                                    className="bg-slate-800/90 border-2 border-slate-700/50 rounded-2xl p-6"
                                >
                                    <table className="w-full text-sm">

                                        <thead className="text-slate-400 border-b border-slate-700">
                                            <tr>
                                                <th className="text-left pb-3">Instrument</th>
                                                <th className="text-left pb-3">Day Change</th>
                                                <th className="text-left pb-3">Returns</th>
                                                <th className="text-left pb-3">Current (Invested)</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {holdings.map((holding, index) => {

                                                const stock = stocks.find(s => s.symbol === holding.symbol);

                                                if (!stock) return null;

                                                const price = stock.price;
                                                const dayChange = stock.change;

                                                const curValue = price * holding.quantity;
                                                const invested = holding.avgPrice * holding.quantity;

                                                const pnl = curValue - invested;
                                                const pnlPercent = (pnl / invested) * 100;

                                                const dayPercent = (dayChange / price) * 100;
                                                const isProfit = pnl >= 0;
                                                const dayPositive = dayChange >= 0;

                                                return (
                                                    <motion.tr
                                                        key={holding.symbol}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                        className="border-b border-slate-700/40"
                                                        onMouseEnter={() => {
                                                            setHoverRow(holding.symbol);
                                                        }
                                                        }
                                                        onMouseLeave={() => {
                                                            setHoverRow(null);
                                                        }
                                                        }
                                                    >

                                                        {/* Instrument */}
                                                        <td className="px-4 py-3 cursor-pointer hover:text-blue-500"
                                                            onClick={() => navigate(`/stock/${holding.symbol}`)}>
                                                            <div className="font-semibold text-white">{holding.symbol}</div>
                                                            <div className="text-xs text-slate-400">{holding.quantity} shares • Avg ${holding.avgPrice}</div>
                                                        </td>
                                                        {/* Day Change */}
                                                        <td>
                                                            <div className={dayPositive ? "text-green-400" : "text-red-400"}>
                                                                ${dayChange.toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                ({dayPercent.toFixed(2)}%)
                                                            </div>
                                                        </td>

                                                        {/* Returns */}
                                                        <td>
                                                            <div className={isProfit ? "text-green-400" : "text-red-400"}>
                                                                ${pnl.toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                ({pnlPercent.toFixed(2)}%)
                                                            </div>
                                                        </td>

                                                        {/* Current / Invested */}
                                                        <td>
                                                            <div className="flex item-centered gap-4">
                                                                <div>
                                                                    <div className="font-semibold text-white">
                                                                        ${curValue.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-xs text-slate-400">
                                                                        ${invested.toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                {/* Action Menu */}
                                                                <Menu
                                                                    as="div"
                                                                    className="relative flex inline-block w-6 flex justify-center bg-transparent"
                                                                    onMouseEnter={() => {
                                                                        setOpenMenu(holding.symbol);
                                                                    }
                                                                    }
                                                                    onMouseLeave={() => {
                                                                        setOpenMenu(null);
                                                                    }
                                                                    }
                                                                >
                                                                    <MenuButton
                                                                        className={`rounded-lg p-1 transition-opacity duration-200 ${hoverRow === holding.symbol ? "opacity-100" : "opacity-0"
                                                                            } hover:bg-gray-100`}
                                                                    >
                                                                        <MoreVert className="h-4 w-4 text-gray-700" />
                                                                    </MenuButton>

                                                                    <Transition
                                                                        as={Fragment}
                                                                        show={openMenu === holding.symbol}
                                                                        enter="transition ease-out duration-200"
                                                                        enterFrom="opacity-0 translate-y-2 scale-95"
                                                                        enterTo="opacity-100 translate-y-0 scale-100"
                                                                        leave="transition ease-in duration-150"
                                                                        leaveFrom="opacity-100 translate-y-0 scale-100"
                                                                        leaveTo="opacity-0 translate-y-2 scale-95"
                                                                    >
                                                                        <MenuItems
                                                                            anchor="bottom end"
                                                                            className="absolute right-0 mt-2 w-48 z-[9999] bg-slate-900/80 backdrop-blur-xl text-slate-300 border-2 border-slate-700 rounded-md shadow-lg origin-top-right"
                                                                        >
                                                                            <MenuItem>
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.02, fontWeight: 700 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
                                                                                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/50 rounded"
                                                                                >
                                                                                    <HiListBullet className="stroke-[1.4]" /> View Details
                                                                                </motion.button>
                                                                            </MenuItem>

                                                                            <MenuItem>
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.02, fontWeight: 700 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
                                                                                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/50 rounded"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPen} /> Edit Order
                                                                                </motion.button>
                                                                            </MenuItem>

                                                                            <MenuItem>
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.02, fontWeight: 700 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
                                                                                    onClick={() => handleCancelClick(stock.name, stock.mode)}
                                                                                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-slate-700/50 rounded"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faTrash} /> Cancel Order
                                                                                </motion.button>
                                                                            </MenuItem>
                                                                        </MenuItems>
                                                                    </Transition>
                                                                </Menu>
                                                            </div>
                                                        </td>

                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>

                                    </table>
                                </motion.div>

                            </motion.div>
                        )}

                        {/* Watchlist Tab */}
                        {activeTab === "watchlist" && (
                            <motion.div
                                key="watchlist"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <table className="w-full text-sm">
                                    <thead className="text-slate-400 border-b border-slate-700">
                                        <tr>
                                            <th className="text-left pb-3">Instrument</th>
                                            <th className="text-left pb-3">Day Change</th>
                                            <th className="text-left pb-3">Current (Invested)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stocks
                                            .filter(s => watchlistStocks.some(w => w.symbol === s.symbol))
                                            .map((stock, index) => {
                                                const dayChange = stock.change ?? 0;
                                                const dayPositive = dayChange >= 0;
                                                const dayPercent = stock.changesPercentage ?? 0;
                                                const price = stock.price ?? 0;

                                                return (
                                                    <motion.tr
                                                        key={stock.symbol}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05, ease: "easeInOut" }}
                                                        className="border-b border-slate-700/40"
                                                        onMouseEnter={() => setHoverRow(stock.symbol)}
                                                        onMouseLeave={() => setHoverRow(null)}
                                                    >
                                                        {/* Instrument */}
                                                        <td
                                                            className="px-4 py-3 cursor-pointer hover:text-blue-500"
                                                            onClick={() => navigate(`/stock/${stock.symbol}`)}
                                                        >
                                                            <div className="font-semibold text-white">{stock.symbol}</div>
                                                            <div className="text-xs text-slate-400">{stock.name}</div>
                                                        </td>

                                                        {/* Day Change */}
                                                        <td className="px-4 py-3">
                                                            <div className={dayPositive ? "text-green-400" : "text-red-400"}>
                                                                {dayPositive ? "+" : ""}${dayChange.toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                ({dayPercent.toFixed(2)}%)
                                                            </div>
                                                        </td>

                                                        {/* Price */}

                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-between">

                                                                <span className="font-semibold text-white w-fit">
                                                                    ${price.toFixed(2)}
                                                                </span>


                                                                {/* Actions */}
                                                                <Menu
                                                                    as="div"
                                                                    className="relative flex inline-block w-6 flex justify-center bg-transparent"
                                                                    onMouseEnter={() => setOpenMenu(stock.symbol)}
                                                                    onMouseLeave={() => setOpenMenu(null)}
                                                                >
                                                                    <MenuButton
                                                                        className={`rounded-lg p-1 transition-opacity duration-200 ${hoverRow === stock.symbol ? "opacity-100" : "opacity-0"
                                                                            } hover:bg-gray-100`}
                                                                    >
                                                                        <MoreVert className="h-4 w-4 text-gray-700" />
                                                                    </MenuButton>
                                                                    <Transition
                                                                        as={Fragment}
                                                                        show={openMenu === stock.symbol}
                                                                        enter="transition ease-out duration-200"
                                                                        enterFrom="opacity-0 translate-y-2 scale-95"
                                                                        enterTo="opacity-100 translate-y-0 scale-100"
                                                                        leave="transition ease-in duration-150"
                                                                        leaveFrom="opacity-100 translate-y-0 scale-100"
                                                                        leaveTo="opacity-0 translate-y-2 scale-95"
                                                                    >
                                                                        <MenuItems
                                                                            anchor="bottom end"
                                                                            className="absolute right-0 mt-2 w-48 z-[9999] bg-slate-900/80 backdrop-blur-xl text-slate-300 border-2 border-slate-700 rounded-md shadow-lg origin-top-right"
                                                                        >
                                                                            <MenuItem>
                                                                                <motion.button
                                                                                    whileHover={{ fontWeight: 700 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                                                                                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/50 rounded"
                                                                                >
                                                                                    <HiListBullet /> View Details
                                                                                </motion.button>
                                                                            </MenuItem>
                                                                            <MenuItem>
                                                                                <motion.button
                                                                                    whileHover={{ fontWeight: 700 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-slate-700/50 rounded"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faTrash} /> Remove
                                                                                </motion.button>
                                                                            </MenuItem>
                                                                        </MenuItems>
                                                                    </Transition>
                                                                </Menu>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === "orders" && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className=" rounde-2d-2xl shadow-md overflow-hidden border border-slate-700/50"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-semibold text-slate-300">Order ID</th>
                                                <th className="px-6 py-4 text-left font-semibold text-slate-300">Stock</th>
                                                <th className="px-6 py-4 text-left font-semibold text-slate-300">Type</th>
                                                <th className="px-6 py-4 text-right font-semibold text-slate-300">Quantity</th>
                                                <th className="px-6 py-4 text-right font-semibold text-slate-300">Price</th>
                                                <th className="px-6 py-4 text-center font-semibold text-slate-300">Status</th>
                                                <th className="px-6 py-4 text-right font-semibold text-slate-300">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order, index) => (
                                                <motion.tr
                                                    key={order.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4 font-mono text-sm text-slate-400">{order.id}</td>
                                                    <td className="px-6 py-4 font-semibold text-white">{order.symbol}</td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${order.type === "BUY"
                                                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                                                                }`}
                                                        >
                                                            {order.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-white">{order.quantity}</td>
                                                    <td className="px-6 py-4 text-right font-semibold text-white">
                                                        ${order.price}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === "Executed"
                                                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                                : order.status === "Pending"
                                                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                                                    : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                                                                }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-slate-400">{order.time}</td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
}

