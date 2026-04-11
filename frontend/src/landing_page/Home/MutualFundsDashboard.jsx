import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
    TrendingUp,
    TrendingDown,
    Search,
    Bell,
    User,
    ArrowLeft,
    Filter,
    Download,
    Eye,
    ShoppingCart,
    Package,
    RefreshCw,
    PieChart,
    Compass,
    Flame,
    ArrowUpRight,
    Star,
    Zap,
    Target,
} from "lucide-react";

// Dock-style Tab Component
function DockTab({ icon: Icon, label, active, onClick }) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.15, y: -8 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all ${active
                ? 'bg-gradient-to-r from-[#ffd89b] to-[#19547b] shadow-2xl shadow-[#ffd89b]/50'
                : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
        >
            <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400'}`} />
            <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-400'}`}>
                {label}
            </span>
            {active && (
                <motion.div
                    layoutId="activeTabMF"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                />
            )}
        </motion.button>
    );
}

function MutualFundsDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("explore");
    const [refreshing, setRefreshing] = useState(false);

    const exploreFunds = {
        trending: [
            { name: "ICICI Prudential Bluechip Fund", category: "Large Cap", returns1y: 24.5, returns3y: 18.2, aum: "₹45,230 Cr", rating: 5 },
            { name: "Axis Midcap Fund", category: "Mid Cap", returns1y: 32.8, returns3y: 22.5, aum: "₹18,450 Cr", rating: 4 },
            { name: "Kotak Small Cap Fund", category: "Small Cap", returns1y: 42.3, returns3y: 28.7, aum: "₹12,890 Cr", rating: 5 },
            { name: "SBI Flexi Cap Fund", category: "Flexi Cap", returns1y: 28.4, returns3y: 19.8, aum: "₹32,150 Cr", rating: 4 },
        ],
        topPerformers: [
            { name: "Parag Parikh Flexi Cap", returns1y: 38.5, category: "Flexi Cap", rating: 5 },
            { name: "Quant Small Cap Fund", returns1y: 45.2, category: "Small Cap", rating: 4 },
            { name: "Nippon India Growth Fund", returns1y: 35.8, category: "Large & Mid Cap", rating: 5 },
        ],
        taxSaver: [
            { name: "Mirae Asset Tax Saver Fund", returns1y: 28.5, lockIn: "3 years", rating: 5 },
            { name: "Axis Long Term Equity Fund", returns1y: 26.3, lockIn: "3 years", rating: 4 },
            { name: "Canara Robeco Equity Tax Saver", returns1y: 24.8, lockIn: "3 years", rating: 4 },
        ],
    };

    const holdings = [
        {
            name: "ICICI Prudential Bluechip Fund",
            category: "Large Cap",
            units: 1250.50,
            avgNav: 58.40,
            currentNav: 62.30,
            invested: 73029.20,
            currentValue: 77906.15,
            pl: 4876.95,
            plPercent: 6.68,
            returns1y: 24.5,
            sipActive: true,
            sipAmount: 5000,
        },
        {
            name: "Axis Midcap Fund",
            category: "Mid Cap",
            units: 850.25,
            avgNav: 72.80,
            currentNav: 78.50,
            invested: 61898.20,
            currentValue: 66744.63,
            pl: 4846.43,
            plPercent: 7.83,
            returns1y: 32.8,
            sipActive: true,
            sipAmount: 3000,
        },
        {
            name: "SBI Flexi Cap Fund",
            category: "Flexi Cap",
            units: 2100.00,
            avgNav: 42.50,
            currentNav: 44.20,
            invested: 89250.00,
            currentValue: 92820.00,
            pl: 3570.00,
            plPercent: 4.00,
            returns1y: 28.4,
            sipActive: false,
            sipAmount: 0,
        },
    ];

    const watchlistFunds = [
        {
            name: "Parag Parikh Flexi Cap Fund",
            category: "Flexi Cap",
            nav: 55.80,
            returns1y: 38.5,
            returns3y: 24.2,
            rating: 5,
            minSip: 1000,
        },
        {
            name: "Kotak Small Cap Fund",
            category: "Small Cap",
            nav: 185.30,
            returns1y: 42.3,
            returns3y: 28.7,
            rating: 5,
            minSip: 1000,
        },
        {
            name: "Mirae Asset Tax Saver Fund",
            category: "ELSS",
            nav: 32.45,
            returns1y: 28.5,
            returns3y: 20.1,
            rating: 5,
            minSip: 500,
        },
    ];

    const orders = [
        {
            id: "MF001",
            fundName: "ICICI Prudential Bluechip Fund",
            type: "SIP",
            amount: 5000,
            status: "Executed",
            date: "01 Mar 2026",
            nav: 62.30,
        },
        {
            id: "MF002",
            fundName: "Axis Midcap Fund",
            type: "Lumpsum",
            amount: 25000,
            status: "Pending",
            date: "03 Mar 2026",
            nav: 78.50,
        },
        {
            id: "MF003",
            fundName: "SBI Flexi Cap Fund",
            type: "Redeem",
            amount: 15000,
            status: "Executed",
            date: "28 Feb 2026",
            nav: 44.20,
        },
    ];

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
    const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalPL = totalCurrentValue - totalInvested;
    const totalPLPercent = (totalPL / totalInvested) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#ffd89b]/20 to-[#19547b]/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#19547b]/20 to-[#ffd89b]/20 rounded-full blur-3xl"
                />
            </div>

            <div className="relative">
                {/* Header */}
                <div className="border-b border-slate-700/50">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate("/home")}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm transition-colors text-slate-300 border border-slate-700/50"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="font-semibold">Back to Home</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleRefresh}
                                    className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm rounded-xl transition-colors text-slate-300 border border-slate-700/50"
                                >
                                    <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm rounded-xl transition-colors text-slate-300 border border-slate-700/50"
                                >
                                    <Bell className="h-5 w-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm rounded-xl transition-colors text-slate-300 border border-slate-700/50"
                                >
                                    <User className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="inline-flex p-3 bg-gradient-to-br from-[#ffd89b]/20 to-[#19547b]/20 border border-[#ffd89b]/30 rounded-2xl">
                                    <PieChart className="h-6 w-6 text-[#ffd89b]" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Mutual Funds</h1>
                                    <p className="text-sm text-slate-400">Invest in top-rated mutual funds</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Portfolio Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 cursor-pointer shadow-lg"
                            >
                                <div className="text-sm text-slate-400 font-medium mb-1">Total Invested</div>
                                <div className="text-2xl font-bold text-white">₹{totalInvested.toLocaleString()}</div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 cursor-pointer shadow-lg"
                            >
                                <div className="text-sm text-slate-400 font-medium mb-1">Current Value</div>
                                <div className="text-2xl font-bold text-white">₹{totalCurrentValue.toLocaleString()}</div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={`backdrop-blur-md rounded-2xl p-5 border cursor-pointer shadow-lg ${totalPL >= 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}
                            >
                                <div className={`text-sm font-medium mb-1 ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>Total Returns</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {totalPL >= 0 ? '+' : ''}₹{totalPL.toFixed(2)}
                                    </span>
                                    <span className={`text-sm ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>({totalPLPercent.toFixed(2)}%)</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Search & Filters */}
                    <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-5 mb-6 border border-slate-700/50">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search mutual funds..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffd89b] focus:border-[#ffd89b] transition-all text-white placeholder:text-slate-500"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors font-medium border border-slate-600/50"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white rounded-xl transition-colors font-medium"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </motion.button>
                        </div>
                    </div>

                    {/* Dock-style Tabs */}
                    <div className="flex justify-center gap-3 mb-8 p-4 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 w-fit mx-auto">
                        <DockTab
                            icon={Compass}
                            label="Explore"
                            active={activeTab === "explore"}
                            onClick={() => setActiveTab("explore")}
                        />
                        <DockTab
                            icon={Package}
                            label="Holdings"
                            active={activeTab === "holdings"}
                            onClick={() => setActiveTab("holdings")}
                        />
                        <DockTab
                            icon={Eye}
                            label="Watchlist"
                            active={activeTab === "watchlist"}
                            onClick={() => setActiveTab("watchlist")}
                        />
                        <DockTab
                            icon={ShoppingCart}
                            label="Orders"
                            active={activeTab === "orders"}
                            onClick={() => setActiveTab("orders")}
                        />
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
                                {/* Trending Funds */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Flame className="h-5 w-5 text-[#ffd89b]" />
                                        <h3 className="text-xl font-bold text-white">Trending Mutual Funds</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {exploreFunds.trending.map((fund, index) => (
                                            <motion.div
                                                key={fund.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.02 }}
                                                className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:border-[#ffd89b]/30 hover:shadow-lg hover:shadow-[#ffd89b]/20 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white mb-1">{fund.name}</h4>
                                                        <p className="text-xs text-slate-400">{fund.category}</p>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(fund.rating)].map((_, i) => (
                                                            <Star key={i} className="h-3 w-3 fill-[#ffd89b] text-[#ffd89b]" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">1Y Returns</div>
                                                        <div className="text-lg font-bold text-green-400">+{fund.returns1y}%</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">3Y Returns</div>
                                                        <div className="text-sm text-slate-300">{fund.returns3y}%</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">AUM</div>
                                                        <div className="text-sm text-slate-300">{fund.aum}</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Performers & Tax Saver */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Top Performers */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="h-5 w-5 text-green-400" />
                                            <h3 className="text-xl font-bold text-white">Top Performers</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {exploreFunds.topPerformers.map((fund, index) => (
                                                <motion.div
                                                    key={fund.name}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-white text-sm mb-1">{fund.name}</h4>
                                                            <p className="text-xs text-slate-400">{fund.category}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-green-400">+{fund.returns1y}%</div>
                                                            <div className="flex gap-0.5 justify-end mt-1">
                                                                {[...Array(fund.rating)].map((_, i) => (
                                                                    <Star key={i} className="h-2.5 w-2.5 fill-[#ffd89b] text-[#ffd89b]" />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tax Saver Funds */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Target className="h-5 w-5 text-[#ffd89b]" />
                                            <h3 className="text-xl font-bold text-white">Tax Saver (ELSS)</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {exploreFunds.taxSaver.map((fund, index) => (
                                                <motion.div
                                                    key={fund.name}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-[#ffd89b]/30 hover:shadow-lg hover:shadow-[#ffd89b]/20 transition-all"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-white text-sm mb-1">{fund.name}</h4>
                                                            <p className="text-xs text-slate-400">Lock-in: {fund.lockIn}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-green-400">+{fund.returns1y}%</div>
                                                            <div className="flex gap-0.5 justify-end mt-1">
                                                                {[...Array(fund.rating)].map((_, i) => (
                                                                    <Star key={i} className="h-2.5 w-2.5 fill-[#ffd89b] text-[#ffd89b]" />
                                                                ))}
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
                                className="space-y-4"
                            >
                                {holdings.map((holding, index) => (
                                    <motion.div
                                        key={holding.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.01 }}
                                        className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-md hover:shadow-lg hover:border-[#ffd89b]/30 hover:shadow-[#ffd89b]/20 p-6 transition-all cursor-pointer"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="bg-gradient-to-br from-[#ffd89b]/20 to-[#19547b]/20 border border-[#ffd89b]/30 p-3 rounded-xl">
                                                    <PieChart className="h-6 w-6 text-[#ffd89b]" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-white mb-1">{holding.name}</h3>
                                                    <p className="text-sm text-slate-400 mb-2">{holding.category}</p>
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <div className="text-xs text-slate-500">Units</div>
                                                            <div className="text-sm font-semibold text-white">{holding.units.toFixed(2)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-500">Avg NAV</div>
                                                            <div className="text-sm text-slate-400">₹{holding.avgNav}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-500">Current NAV</div>
                                                            <div className="text-sm font-semibold text-white">₹{holding.currentNav}</div>
                                                        </div>
                                                    </div>
                                                    {holding.sipActive && (
                                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                                            <Zap className="h-3 w-3 text-green-400" />
                                                            <span className="text-xs text-green-400 font-semibold">SIP Active: ₹{holding.sipAmount}/month</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <div className="text-xs text-slate-500 mb-1">Invested</div>
                                                    <div className="text-lg font-semibold text-white">₹{holding.invested.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500 mb-1">Current</div>
                                                    <div className="text-lg font-semibold text-white">₹{holding.currentValue.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500 mb-1">Returns</div>
                                                    <div className={`text-lg font-semibold ${holding.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {holding.pl >= 0 ? '+' : ''}₹{holding.pl.toFixed(2)}
                                                    </div>
                                                    <div className={`text-xs ${holding.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        ({holding.pl >= 0 ? '+' : ''}{holding.plPercent.toFixed(2)}%)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
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
                                {watchlistFunds.map((fund, index) => (
                                    <motion.div
                                        key={fund.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.01 }}
                                        className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-md hover:shadow-lg hover:border-[#ffd89b]/30 hover:shadow-[#ffd89b]/20 p-6 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="bg-gradient-to-br from-[#ffd89b]/20 to-[#19547b]/20 border border-[#ffd89b]/30 p-3 rounded-xl">
                                                    <PieChart className="h-6 w-6 text-[#ffd89b]" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg text-white">{fund.name}</h3>
                                                        <motion.button
                                                            whileHover={{ scale: 1.2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="text-[#ffd89b] hover:text-[#ffb84d] transition-colors"
                                                        >
                                                            <Star className="h-4 w-4 fill-current" />
                                                        </motion.button>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mb-2">{fund.category}</p>
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <div className="text-xs text-slate-500">NAV</div>
                                                            <div className="text-sm font-semibold text-white">₹{fund.nav}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-500">Min SIP</div>
                                                            <div className="text-sm text-slate-400">₹{fund.minSip}</div>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(fund.rating)].map((_, i) => (
                                                                <Star key={i} className="h-3 w-3 fill-[#ffd89b] text-[#ffd89b]" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right mr-6">
                                                <div className="text-xs text-slate-500 mb-1">1Y Returns</div>
                                                <div className="text-2xl font-bold text-green-400">+{fund.returns1y}%</div>
                                                <div className="text-xs text-slate-400 mt-1">3Y: {fund.returns3y}%</div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-6 py-2 bg-gradient-to-r from-[#ffd89b] to-[#19547b] text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm"
                                                >
                                                    Start SIP
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors font-semibold text-sm"
                                                >
                                                    Lumpsum
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
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
                                className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-md overflow-hidden border border-slate-700/50"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-semibold text-slate-300">Order ID</th>
                                                <th className="px-6 py-4 text-left font-semibold text-slate-300">Fund Name</th>
                                                <th className="px-6 py-4 text-left font-semibold text-slate-300">Type</th>
                                                <th className="px-6 py-4 text-right font-semibold text-slate-300">Amount</th>
                                                <th className="px-6 py-4 text-right font-semibold text-slate-300">NAV</th>
                                                <th className="px-6 py-4 text-center font-semibold text-slate-300">Status</th>
                                                <th className="px-6 py-4 text-right font-semibold text-slate-300">Date</th>
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
                                                    <td className="px-6 py-4 font-semibold text-white">{order.fundName}</td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${order.type === "SIP"
                                                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                                : order.type === "Lumpsum"
                                                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                                                }`}
                                                        >
                                                            {order.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-white">₹{order.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-semibold text-white">₹{order.nav}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === "Executed"
                                                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                                                }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-slate-400">{order.date}</td>
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
        </div>
    );
}

export default MutualFundsDashboard;
