import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
    ArrowLeft,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Sparkles,
    ThumbsUp,
    ThumbsDown,
    MinusCircle,
    Clock,
    Briefcase,
    Building2,
    Users,
    Info,
    BarChart3,
    Newspaper,
    LineChart as LineChartIcon,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

const TIME_PERIODS = ["1D", "1W", "1M", "1Y", "3Y", "5Y"];

const TABS = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "news", label: "News", icon: Newspaper },
    { id: "technicals", label: "Technicals", icon: LineChartIcon },
    { id: "financials", label: "Financials", icon: BarChart3 },
    { id: "peers", label: "Peers", icon: Users },
];

const PEER_STOCKS = [
    { symbol: "ONGC", name: "Oil & Natural Gas Corp", price: 245.60, change: -3.20, changePercent: -1.29, marketCap: "3.1L Cr" },
    { symbol: "BPCL", name: "Bharat Petroleum Corp", price: 356.75, change: 5.40, changePercent: 1.54, marketCap: "1.2L Cr" },
    { symbol: "IOC", name: "Indian Oil Corporation", price: 134.50, change: -1.20, changePercent: -0.88, marketCap: "1.9L Cr" },
    { symbol: "ADANIGREEN", name: "Adani Green Energy", price: 1234.80, change: 23.50, changePercent: 1.94, marketCap: "2.0L Cr" },
];

const NEWS_DATA = [
    { id: "1", title: "Reliance Industries announces Q4 results, beats market expectations", source: "Economic Times", time: "2h ago", sentiment: "positive" },
    { id: "2", title: "RIL expands retail footprint with 200+ new stores across India", source: "Business Standard", time: "5h ago", sentiment: "positive" },
    { id: "3", title: "Crude oil prices impact could affect Reliance's refining margins", source: "Moneycontrol", time: "1d ago", sentiment: "neutral" },
    { id: "4", title: "Analysts maintain 'Buy' rating on Reliance with revised target price", source: "CNBC TV18", time: "2d ago", sentiment: "positive" },
];

const MOCK_STOCK = {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2456.75,
    change: 32.50,
    changePercent: 1.34,
    high: 2478.90,
    low: 2435.20,
    open: 2442.00,
    prevClose: 2424.25,
    volume: "1.2Cr",
    marketCap: "16.6L Cr",
    pe: 28.45,
    pb: 2.14,
    divYield: 0.32,
    high52w: 2856.90,
    low52w: 2145.30,
    exchange: "NSE",
};

function getSentimentConfig(sentiment) {
    switch (sentiment) {
        case "positive": return { icon: ThumbsUp, colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10", label: "Positive" };
        case "negative": return { icon: ThumbsDown, colorClass: "text-red-500", bgClass: "bg-red-500/10", label: "Negative" };
        default: return { icon: MinusCircle, colorClass: "text-gray-400", bgClass: "bg-white/5", label: "Neutral" };
    }
}

export function StockPage() {
    const navigate = useNavigate();
    const { symbol } = useParams();

    const [selectedPeriod, setSelectedPeriod] = useState("1D");
    const [activeTab, setActiveTab] = useState("overview");
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [orderSide, setOrderSide] = useState("BUY");
    const [orderType, setOrderType] = useState("MARKET");
    const [qty, setQty] = useState("1");
    const [limitPrice, setLimitPrice] = useState("");

    // ── Data State ────────────────────────────────────────────────────────────
    const [stockData, setStockData] = useState(MOCK_STOCK);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!symbol) return;

        const fetchStock = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:3002/stock/${symbol}?period=${selectedPeriod}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                setStockData({
                    symbol: data.symbol || symbol.toUpperCase(),
                    name: data.name || "",

                    price: data.price ?? MOCK_STOCK.price,
                    change: data.change ?? MOCK_STOCK.change,

                    // 🔥 FIXED
                    changePercent: data.changePercent ?? MOCK_STOCK.changePercent,

                    open: data.open ?? MOCK_STOCK.open,
                    high: data.high ?? MOCK_STOCK.high,
                    low: data.low ?? MOCK_STOCK.low,

                    // 🔥 FIXED
                    prevClose: data.prevClose ?? MOCK_STOCK.prevClose,

                    volume: data.volume ?? MOCK_STOCK.volume,

                    // (optional, backend not sending these yet)
                    marketCap: data.marketCap ?? MOCK_STOCK.marketCap,
                    pe: data.pe ?? MOCK_STOCK.pe,
                    pb: data.pb ?? MOCK_STOCK.pb,
                    divYield: data.divYield ?? MOCK_STOCK.divYield,

                    high52w: data.fiftyTwoWeek?.high ?? MOCK_STOCK.high52w,
                    low52w: data.fiftyTwoWeek?.low ?? MOCK_STOCK.low52w,

                    exchange: data.exchange ?? MOCK_STOCK.exchange,
                    changes: data.changes ?? {},
                });

                setChartData(Array.isArray(data.chart) && data.chart.length > 0 ? data.chart : []);
            } catch (err) {
                console.warn("API unavailable, using mock data:", err.message);
                setError("Using demo data — connect your API at localhost:3002");
                setStockData({ ...MOCK_STOCK, symbol: symbol.toUpperCase() });
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStock();
    }, [symbol, selectedPeriod]);

    // ── Derived values ────────────────────────────────────────────────────────
    const periodChange = stockData.changes?.[selectedPeriod] || { change: 0, percent: 0 };
    const isPositive = periodChange.change >= 0;
    const themeColor = isPositive ? "#10b981" : "#ef4444";
    const orderValue = parseFloat(qty || "0") * stockData.price;

    // ── Custom Tooltip ────────────────────────────────────────────────────────
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const point = payload[0].payload;
        const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const label = selectedPeriod === "1D" ? `${today}, ${point.time}` : point.time;
        return (
            <div className="bg-[#1e2532] border border-white/10 rounded shadow-2xl px-3 py-2">
                <p className="text-white font-semibold text-lg">${payload[0].value.toFixed(2)}</p>
                <p className="text-gray-400 text-xs mt-0.5">{label}</p>
            </div>
        );
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Fetching {symbol?.toUpperCase()}…</p>
                </div>
            </div>
        );
    }

    // ── Empty chart state ─────────────────────────────────────────────────────
    const ChartEmpty = () => (
        <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-600 border border-white/5 rounded-lg">
            <LineChartIcon className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No chart data available for this period</p>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0a0e17] text-gray-100 font-sans selection:bg-emerald-500/30">

            {/* ── Navigation ── */}
            <nav className="sticky top-0 z-50 bg-[#0a0e17]/95 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="text-xl font-bold tracking-tight">
                            <span className="text-emerald-500">Stock</span>
                            <span className="text-white">Vista</span>
                        </div>
                        <div className="hidden md:flex ml-8 relative">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search stocks, mutual funds..."
                                className="bg-[#1a2130] text-sm text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-64 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <button className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Portfolio
                        </button>
                        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center font-bold text-sm">
                            JD
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── API error banner ── */}
            {error && (
                <div className="max-w-7xl mx-auto px-6 pt-3">
                    <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-3 py-2">
                        ⚠ {error}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ── Main Content ── */}
                    <div className="lg:col-span-8">

                        {/* Stock Header */}
                        <div className="flex justify-between items-end pb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-semibold tracking-tight">{stockData.symbol}</h1>
                                    <span className="text-xs font-medium px-2 py-0.5 bg-white/5 text-gray-400 rounded">{stockData.exchange}</span>
                                </div>
                                <p className="text-sm text-gray-400">{stockData.name}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="text-3xl font-semibold tracking-tight">${Number(stockData.price).toFixed(2)}</div>
                                <div className={`flex items-center text-sm font-medium mt-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                    {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                                    {isPositive ? "+" : ""}{Number(stockData.changes?.[selectedPeriod]?.change).toFixed(2)} ({isPositive ? "+" : ""}{Number(stockData.changes?.[selectedPeriod].percent).toFixed(2)}%)
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-6 py-4 border-t border-white/5 text-sm">
                            <div><span className="text-gray-500 mr-2">Open</span><span className="font-medium">${Number(stockData.open).toFixed(2)}</span></div>
                            <div><span className="text-gray-500 mr-2">High</span><span className="font-medium text-emerald-400">${Number(stockData.high).toFixed(2)}</span></div>
                            <div><span className="text-gray-500 mr-2">Low</span><span className="font-medium text-red-400">${Number(stockData.low).toFixed(2)}</span></div>
                            <div><span className="text-gray-500 mr-2">Prev Close</span><span className="font-medium">${Number(stockData.prevClose).toFixed(2)}</span></div>
                        </div>

                        {/* Chart */}
                        <div className="mt-2 mb-8 relative">
                            {chartData.length > 0 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke={themeColor}
                                                strokeWidth={2}
                                                fill="url(#colorPrice)"
                                                isAnimationActive={true}
                                                animationDuration={800}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                                cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "4 4" }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <ChartEmpty />
                            )}

                            {/* Time Period + Watchlist */}
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex space-x-1">
                                    {TIME_PERIODS.map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setSelectedPeriod(period)}
                                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${selectedPeriod === period
                                                ? "bg-white/10 text-white"
                                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                                }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setIsInWatchlist(!isInWatchlist)}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                                >
                                    <Star className={`w-3.5 h-3.5 ${isInWatchlist ? "fill-emerald-500 text-emerald-500" : ""}`} />
                                    {isInWatchlist ? "Watchlisted" : "Add to Watchlist"}
                                </button>
                            </div>
                        </div>

                        {/* AI Insights Strip */}
                        <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-8">
                            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-indigo-300">AI Analysis</h4>
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                                        {isPositive ? "Bullish Signal" : "Bearish Signal"}
                                    </span>
                                </div>
                                <p className="text-sm text-indigo-100/70 leading-relaxed">
                                    Based on technical analysis and market trends, <strong>{stockData.symbol}</strong> is showing{" "}
                                    {isPositive ? "strong bullish" : "bearish"} momentum. Trading{" "}
                                    {isPositive ? "above" : "below"} 50-day EMA with MACD crossover. Volume analysis suggests{" "}
                                    {isPositive ? "institutional buying" : "distribution pressure"}.
                                    Next {isPositive ? "resistance" : "support"} at ${isPositive ? (stockData.price * 1.02).toFixed(0) : (stockData.price * 0.98).toFixed(0)}.
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-indigo-200/60">
                                    <span>Buy Signal: <strong className="text-emerald-400">78%</strong></span>
                                    <span>Target: <strong className="text-white">${(stockData.price * 1.09).toFixed(0)}</strong></span>
                                    <span>Stop Loss: <strong className="text-white">${(stockData.price * 0.94).toFixed(0)}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-white/10 mb-6 overflow-x-auto hide-scrollbar">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* ── Tab Content ── */}
                        <div className="min-h-[400px]">

                            {/* OVERVIEW */}
                            {activeTab === "overview" && (
                                <div className="space-y-8 text-sm">
                                    {/* Performance */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Performance</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {[
                                                { label: "Today's Low", value: `$${Number(stockData.low).toFixed(2)}` },
                                                { label: "Today's High", value: `$${Number(stockData.high).toFixed(2)}` },
                                                { label: "52W Low", value: `$${Number(stockData.low52w).toFixed(2)}` },
                                                { label: "52W High", value: `$${Number(stockData.high52w).toFixed(2)}` },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="bg-[#1a2130]/50 p-4 rounded-lg">
                                                    <div className="text-gray-500 mb-1 text-xs">{label}</div>
                                                    <div className="font-medium">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Period returns */}
                                        <div className="grid grid-cols-5 gap-3 mt-4">
                                            {[
                                                { label: "Today", value: `${isPositive ? "+" : ""}${Number(stockData.changes?.[selectedPeriod]?.percent).toFixed(2)}%`, pos: isPositive },
                                                { label: "1 Week", value: "+2.45%", pos: true },
                                                { label: "1 Month", value: "+5.67%", pos: true },
                                                { label: "1 Year", value: "+23.45%", pos: true },
                                                { label: "3 Years", value: "+78.92%", pos: true },
                                            ].map(({ label, value, pos }) => (
                                                <div key={label} className="bg-[#1a2130]/30 p-3 rounded-lg text-center">
                                                    <div className="text-gray-500 text-xs mb-1">{label}</div>
                                                    <div className={`font-semibold text-sm ${pos ? "text-emerald-400" : "text-red-400"}`}>{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fundamentals */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Fundamentals</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                                            {[
                                                { label: "Market Cap", value: stockData.marketCap },
                                                { label: "P/E Ratio", value: stockData.pe },
                                                { label: "P/B Ratio", value: stockData.pb },
                                                { label: "Div Yield", value: `${stockData.divYield}%` },
                                                { label: "Volume", value: stockData.volume },
                                                { label: "ROE", value: "18.5%" },
                                                { label: "EPS (TTM)", value: "86.32" },
                                                { label: "Industry P/E", value: "24.10" },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-between border-b border-white/5 pb-2">
                                                    <span className="text-gray-500">{label}</span>
                                                    <span className="font-medium">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* About */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-gray-400" /> About {stockData.name}
                                        </h3>
                                        <p className="text-gray-400 leading-relaxed">
                                            {stockData.name} is one of India's largest conglomerates with business interests spanning across
                                            energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.
                                            It is one of the most profitable companies in India and the largest publicly traded company
                                            by market capitalisation.
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
                                            {[
                                                { label: "Founded", value: "1966" },
                                                { label: "HQ", value: "Mumbai, India" },
                                                { label: "CEO", value: "Mukesh Ambani" },
                                                { label: "Employees", value: "347,000+" },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="bg-[#1a2130]/30 p-3 rounded-lg">
                                                    <div className="text-gray-500 text-xs mb-1">{label}</div>
                                                    <div className="font-medium text-sm">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* NEWS */}
                            {activeTab === "news" && (
                                <div className="space-y-4">
                                    {NEWS_DATA.map((news) => {
                                        const cfg = getSentimentConfig(news.sentiment);
                                        const SentimentIcon = cfg.icon;
                                        return (
                                            <div key={news.id} className="group cursor-pointer">
                                                <div className="flex gap-4 p-4 rounded-xl hover:bg-[#1a2130]/50 transition-colors">
                                                    <div className={`w-8 h-8 rounded-lg ${cfg.bgClass} ${cfg.colorClass} flex items-center justify-center shrink-0 mt-0.5`}>
                                                        <SentimentIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
                                                            {news.title}
                                                        </h4>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="text-gray-400">{news.source}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {news.time}</span>
                                                            <span className={`flex items-center gap-1 ${cfg.colorClass} ${cfg.bgClass} px-1.5 py-0.5 rounded`}>
                                                                <SentimentIcon className="w-3 h-3" /> {cfg.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="h-px bg-white/5 mx-4" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* TECHNICALS */}
                            {activeTab === "technicals" && (
                                <div className="space-y-8 text-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Oscillators */}
                                        <div>
                                            <h3 className="text-base font-semibold mb-4">Oscillators</h3>
                                            <div className="space-y-5">
                                                <div>
                                                    <div className="flex justify-between mb-1.5">
                                                        <span className="text-gray-500">RSI (14)</span>
                                                        <span className="font-medium text-emerald-400">62.4 (Bullish)</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "62.4%" }} />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                                        <span>Oversold (0)</span><span>Overbought (100)</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-white/5">
                                                    <span className="text-gray-500">MACD (12,26,9)</span>
                                                    <span className="font-medium text-emerald-400">12.34 (Buy)</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-white/5">
                                                    <span className="text-gray-500">Signal Line</span>
                                                    <span className="font-medium">10.56</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-white/5">
                                                    <span className="text-gray-500">Histogram</span>
                                                    <span className="font-medium text-emerald-400">+1.78</span>
                                                </div>
                                                <div className="flex justify-between py-2">
                                                    <span className="text-gray-500">Stochastic (14,3,3)</span>
                                                    <span className="font-medium text-gray-300">75.2 (Neutral)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Moving Averages */}
                                        <div>
                                            <h3 className="text-base font-semibold mb-4">Moving Averages</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { label: "SMA 20", value: "$2,398.50", signal: "Buy", color: "text-emerald-500 bg-emerald-500/10" },
                                                    { label: "SMA 50", value: "$2,345.80", signal: "Buy", color: "text-emerald-500 bg-emerald-500/10" },
                                                    { label: "SMA 200", value: "$2,234.20", signal: "Buy", color: "text-emerald-500 bg-emerald-500/10" },
                                                    { label: "EMA 20", value: "$2,410.30", signal: "Buy", color: "text-emerald-500 bg-emerald-500/10" },
                                                ].map(({ label, value, signal, color }) => (
                                                    <div key={label} className="flex justify-between items-center p-3 rounded-lg bg-[#1a2130]/30 border border-white/5">
                                                        <span className="text-gray-400">{label}</span>
                                                        <span className="font-medium">{value}</span>
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${color}`}>{signal}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Support & Resistance */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Support &amp; Resistance Levels</h3>
                                        <div className="rounded-xl border border-white/10 overflow-hidden">
                                            {[
                                                { label: "Resistance 3", value: "$2,545.00", color: "text-red-400" },
                                                { label: "Resistance 2", value: "$2,510.00", color: "text-red-400" },
                                                { label: "Resistance 1", value: "$2,478.90", color: "text-red-400" },
                                            ].map(({ label, value, color }) => (
                                                <div key={label} className="flex justify-between px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <span className="text-gray-400 text-sm">{label}</span>
                                                    <span className={`font-semibold text-sm ${color}`}>{value}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between px-4 py-3 border-b border-white/5 bg-emerald-500/5">
                                                <span className="font-semibold text-sm">Current Price</span>
                                                <span className="font-bold text-sm text-emerald-400">${Number(stockData.price).toFixed(2)}</span>
                                            </div>
                                            {[
                                                { label: "Support 1", value: "$2,435.20", color: "text-emerald-400" },
                                                { label: "Support 2", value: "$2,400.00", color: "text-emerald-400" },
                                                { label: "Support 3", value: "$2,365.00", color: "text-emerald-400" },
                                            ].map(({ label, value, color }) => (
                                                <div key={label} className="flex justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                    <span className="text-gray-400 text-sm">{label}</span>
                                                    <span className={`font-semibold text-sm ${color}`}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pivot Points */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Pivot Points (Daily)</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { label: "R1", value: "$2,489.30" },
                                                { label: "Pivot", value: `$${Number(stockData.price).toFixed(2)}` },
                                                { label: "S1", value: "$2,412.40" },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="bg-[#1a2130]/50 p-4 rounded-lg text-center">
                                                    <div className="text-gray-500 text-xs mb-1">{label}</div>
                                                    <div className="font-medium">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FINANCIALS */}
                            {activeTab === "financials" && (
                                <div className="text-sm space-y-8">
                                    {/* Key metrics */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Key Financials (TTM)</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: "Revenue", value: "$8.2L Cr", yoy: "+12.5%" },
                                                { label: "Net Profit", value: "$68,450 Cr", yoy: "+15.2%" },
                                                { label: "EPS", value: "86.32", yoy: "+14.8%" },
                                                { label: "ROE", value: "18.5%", yoy: "+2.1%" },
                                            ].map(({ label, value, yoy }) => (
                                                <div key={label} className="bg-[#1a2130]/50 p-4 rounded-lg">
                                                    <div className="text-gray-500 mb-1 text-xs">{label}</div>
                                                    <div className="font-semibold text-base">{value}</div>
                                                    <div className="text-emerald-400 text-xs mt-1">{yoy} YoY</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Income Statement */}
                                    <div>
                                        <div className="flex gap-3 mb-4">
                                            <button className="px-3 py-1.5 bg-white/10 text-white rounded-md text-xs font-medium">Income Statement</button>
                                            <button className="px-3 py-1.5 text-gray-400 hover:text-white rounded-md text-xs font-medium transition-colors">Balance Sheet</button>
                                            <button className="px-3 py-1.5 text-gray-400 hover:text-white rounded-md text-xs font-medium transition-colors">Cash Flow</button>
                                        </div>
                                        <div className="border border-white/10 rounded-xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#1a2130]/80 border-b border-white/10">
                                                    <tr>
                                                        <th className="py-3 px-4 font-medium text-gray-400">Consolidated ($ Cr)</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right">Mar 2024</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right">Mar 2023</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right">Mar 2022</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    <tr className="hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-4 text-gray-300">Sales</td>
                                                        <td className="py-3 px-4 text-right font-medium">982,440</td>
                                                        <td className="py-3 px-4 text-right">876,450</td>
                                                        <td className="py-3 px-4 text-right">700,230</td>
                                                    </tr>
                                                    <tr className="hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-4 text-gray-300">Expenses</td>
                                                        <td className="py-3 px-4 text-right font-medium">823,100</td>
                                                        <td className="py-3 px-4 text-right">734,560</td>
                                                        <td className="py-3 px-4 text-right">585,430</td>
                                                    </tr>
                                                    <tr className="hover:bg-white/5 transition-colors bg-white/[0.02]">
                                                        <td className="py-3 px-4 text-white font-medium">Operating Profit</td>
                                                        <td className="py-3 px-4 text-right text-white font-medium">159,340</td>
                                                        <td className="py-3 px-4 text-right">141,890</td>
                                                        <td className="py-3 px-4 text-right">114,800</td>
                                                    </tr>
                                                    <tr className="hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-4 text-gray-300">Other Income</td>
                                                        <td className="py-3 px-4 text-right font-medium">13,450</td>
                                                        <td className="py-3 px-4 text-right">11,830</td>
                                                        <td className="py-3 px-4 text-right">14,940</td>
                                                    </tr>
                                                    <tr className="hover:bg-white/5 transition-colors bg-white/[0.02]">
                                                        <td className="py-3 px-4 text-white font-medium">Net Profit</td>
                                                        <td className="py-3 px-4 text-right text-emerald-400 font-medium">79,020</td>
                                                        <td className="py-3 px-4 text-right text-emerald-400">73,670</td>
                                                        <td className="py-3 px-4 text-right text-emerald-400">67,845</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Quarterly results */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Quarterly Results</h3>
                                        <div className="border border-white/10 rounded-xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#1a2130]/80 border-b border-white/10">
                                                    <tr>
                                                        <th className="py-3 px-4 font-medium text-gray-400">Quarter</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right">Revenue</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right">Profit</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right">EPS</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {[
                                                        { q: "Q4 FY24", rev: "$2.1L Cr", profit: "$17,500 Cr", eps: "22.10" },
                                                        { q: "Q3 FY24", rev: "$2.0L Cr", profit: "$16,800 Cr", eps: "21.20" },
                                                        { q: "Q2 FY24", rev: "$2.0L Cr", profit: "$16,200 Cr", eps: "20.45" },
                                                        { q: "Q1 FY24", rev: "$2.1L Cr", profit: "$17,950 Cr", eps: "22.65" },
                                                    ].map(({ q, rev, profit, eps }) => (
                                                        <tr key={q} className="hover:bg-white/5 transition-colors">
                                                            <td className="py-3 px-4 text-gray-300">{q}</td>
                                                            <td className="py-3 px-4 text-right">{rev}</td>
                                                            <td className="py-3 px-4 text-right text-emerald-400">{profit}</td>
                                                            <td className="py-3 px-4 text-right font-medium">{eps}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Ratios */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Financial Ratios</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                                            {[
                                                { label: "Debt/Equity", value: "0.45" },
                                                { label: "Current Ratio", value: "1.32" },
                                                { label: "Div Yield", value: "0.32%" },
                                                { label: "Book Value", value: "$1,245" },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-between border-b border-white/5 pb-2">
                                                    <span className="text-gray-500">{label}</span>
                                                    <span className="font-medium">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PEERS */}
                            {activeTab === "peers" && (
                                <div className="space-y-8">
                                    {/* Peer comparison table */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Peer Comparison</h3>
                                        <div className="border border-white/10 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-[#1a2130]/80 border-b border-white/10">
                                                    <tr>
                                                        <th className="py-3 px-4 font-medium text-gray-400">Company</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right">Price</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right">Change</th>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-right hidden sm:table-cell">Market Cap</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {/* Current stock highlighted */}
                                                    <tr className="bg-emerald-500/5">
                                                        <td className="py-3 px-4 font-semibold text-emerald-400">{stockData.symbol} <span className="text-[10px] font-normal text-gray-500 ml-1">You</span></td>
                                                        <td className="py-3 px-4 text-right font-medium">${Number(stockData.price).toFixed(2)}</td>
                                                        <td className={`py-3 px-4 text-right font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                                            {isPositive ? "+" : ""}{Number(stockData.changes?.[selectedPeriod]?.percent).toFixed(2)}%
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-gray-400 hidden sm:table-cell">{stockData.marketCap}</td>
                                                    </tr>
                                                    {PEER_STOCKS.map((peer) => (
                                                        <tr
                                                            key={peer.symbol}
                                                            className="hover:bg-white/5 transition-colors cursor-pointer"
                                                            onClick={() => navigate(`/stock/${peer.symbol.toLowerCase()}`)}
                                                        >
                                                            <td className="py-3 px-4">
                                                                <div className="font-medium text-white">{peer.symbol}</div>
                                                                <div className="text-xs text-gray-500">{peer.name}</div>
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-medium">${peer.price.toFixed(2)}</td>
                                                            <td className={`py-3 px-4 text-right font-medium ${peer.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                                {peer.change >= 0 ? "+" : ""}{peer.changePercent.toFixed(2)}%
                                                            </td>
                                                            <td className="py-3 px-4 text-right text-gray-400 hidden sm:table-cell">{peer.marketCap}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Analyst Ratings */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Analyst Ratings</h3>
                                        <div className="space-y-4">
                                            {[
                                                { label: "Strong Buy", count: 12, pct: "60%", color: "bg-emerald-500" },
                                                { label: "Buy", count: 5, pct: "25%", color: "bg-emerald-400" },
                                                { label: "Hold", count: 3, pct: "15%", color: "bg-yellow-500" },
                                                { label: "Sell", count: 0, pct: "0%", color: "bg-red-500" },
                                            ].map(({ label, count, pct, color }) => (
                                                <div key={label}>
                                                    <div className="flex items-center justify-between mb-1.5 text-sm">
                                                        <span className="text-gray-500">{label}</span>
                                                        <span className="font-medium">{count}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className={`h-full ${color} rounded-full`} style={{ width: pct }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                                            <div>
                                                <div className="text-gray-500 text-xs mb-1">Consensus Target</div>
                                                <div className="text-2xl font-semibold text-emerald-400">$2,750</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-500 text-xs mb-1">Upside Potential</div>
                                                <div className="text-xl font-semibold text-emerald-400">+11.9%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Trading Sidebar ── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-4">

                            {/* Order Card */}
                            <div className="bg-[#111723] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                {/* Buy / Sell Tabs */}
                                <div className="flex">
                                    <button
                                        onClick={() => setOrderSide("BUY")}
                                        className={`flex-1 py-3.5 text-sm font-bold tracking-wider transition-colors ${orderSide === "BUY" ? "bg-emerald-500 text-white" : "bg-[#1a2130] text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        BUY
                                    </button>
                                    <button
                                        onClick={() => setOrderSide("SELL")}
                                        className={`flex-1 py-3.5 text-sm font-bold tracking-wider transition-colors ${orderSide === "SELL" ? "bg-red-500 text-white" : "bg-[#1a2130] text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        SELL
                                    </button>
                                </div>

                                <div className="p-5 space-y-5">
                                    {/* Order Type */}
                                    <div className="flex bg-[#1a2130] p-1 rounded-lg">
                                        {(["MARKET", "LIMIT", "STOP-LOSS"]).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setOrderType(type)}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${orderType === type ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-gray-300"
                                                    }`}
                                            >
                                                {type === "STOP-LOSS" ? "SL" : type.charAt(0) + type.slice(1).toLowerCase()}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Inputs */}
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between items-center">
                                            <label className="text-gray-400">Qty (NSE)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={qty}
                                                onChange={(e) => setQty(e.target.value)}
                                                className="w-24 bg-[#1a2130] border border-white/10 rounded py-1.5 px-3 text-right text-white focus:outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <label className="text-gray-400">Price</label>
                                            <input
                                                type="number"
                                                value={orderType === "MARKET" ? stockData.price : limitPrice}
                                                onChange={(e) => setLimitPrice(e.target.value)}
                                                disabled={orderType === "MARKET"}
                                                placeholder={orderType === "MARKET" ? "Market" : "0.00"}
                                                className={`w-24 bg-[#1a2130] border border-white/10 rounded py-1.5 px-3 text-right focus:outline-none focus:border-emerald-500/50 ${orderType === "MARKET" ? "text-gray-500 cursor-not-allowed" : "text-white"
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="pt-4 border-t border-white/10 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Margin Required</span>
                                            <span className="font-semibold">${orderValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Available Balance</span>
                                            <span className="text-gray-400">$45,230.50</span>
                                        </div>
                                        {orderValue > 45230.5 && (
                                            <div className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                                                ⚠ Insufficient balance for this order
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] ${orderSide === "BUY"
                                            ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                                            : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                            }`}
                                    >
                                        {orderSide} {stockData.symbol}
                                    </button>
                                </div>
                            </div>

                            {/* Performance Quick Card */}
                            <div className="bg-[#111723] border border-white/10 rounded-xl p-5 text-sm">
                                <h4 className="font-semibold mb-4 text-gray-300">Returns</h4>
                                <div className="space-y-3">
                                    {["1D", "1W", "1M", "1Y", "3Y"].map((period) => {
                                        const changeObj = stockData.changes?.[period] || { change: 0, percent: 0 };
                                        const isPos = changeObj.percent >= 0;
                                        const labelMap = { "1D": "Today", "1W": "1 Week", "1M": "1 Month", "1Y": "1 Year", "3Y": "3 Years" };

                                        return (
                                            <div key={period} className="flex justify-between items-center">
                                                <span className="text-gray-500">{labelMap[period]}</span>
                                                <span className={`font-semibold ${isPos ? "text-emerald-400" : "text-red-400"}`}>
                                                    {isPos ? "+" : ""}{changeObj.percent.toFixed(2)}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StockPage;
