import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
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
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

const API = import.meta.env.VITE_API_URL;

const TIME_PERIODS = ["1D", "1W", "1M", "1Y", "3Y", "5Y"];

const TABS = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "news", label: "News", icon: Newspaper },
    { id: "financials", label: "Financials", icon: BarChart3 },
];

const PEER_STOCKS = [
    { symbol: "ONGC", name: "Oil & Natural Gas Corp", price: 245.60, change: -3.20, changePercent: -1.29, marketCap: "3.1L Cr" },
    { symbol: "BPCL", name: "Bharat Petroleum Corp", price: 356.75, change: 5.40, changePercent: 1.54, marketCap: "1.2L Cr" },
    { symbol: "IOC", name: "Indian Oil Corporation", price: 134.50, change: -1.20, changePercent: -0.88, marketCap: "1.9L Cr" },
    { symbol: "ADANIGREEN", name: "Adani Green Energy", price: 1234.80, change: 23.50, changePercent: 1.94, marketCap: "2.0L Cr" },
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

export function StockPage() {
    const navigate = useNavigate();
    const { symbol } = useParams();
    const [orderLoading, setOrderLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("1D");
    const [activeTab, setActiveTab] = useState("overview");
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [orderSide, setOrderSide] = useState("BUY");
    const [news, setNews] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [qty, setQty] = useState("1");

    const [priceType, setPriceType] = useState("MARKET");
    const [limitPrice, setLimitPrice] = useState("");
    // ── Data State ────────────────────────────────────────────────────────────
    const [stockData, setStockData] = useState(MOCK_STOCK);
    const [financials, setFinancials] = useState(null);
    const [fundamentals, setfundamentals] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fullFinancials, setFullFinancials] = useState(null);
    const [finSubTab, setFinSubTab] = useState("income");
    const [period, setPeriod] = useState("annual");
    const [finReports, setFinReports] = useState([]);
    const [finRows, setFinRows] = useState([]);
    const key = financials?.keyFinancials;
    const income = financials?.incomeStatement;

    const INCOME_ROWS = [
        { label: "Revenue", field: "revenue", bold: true },
        { label: "Cost of Revenue", field: "costOfRevenue" },
        { label: "Gross Profit", field: "grossProfit", bold: true },
        { label: "Operating Expenses", field: "operatingExpenses" },
        { label: "Operating Income", field: "operatingIncome", bold: true },
        { label: "EBITDA", field: "ebitda" },
        { label: "Interest Expense", field: "interestExpense" },
        { label: "Net Income", field: "netIncome", bold: true },
        { label: "EPS (Diluted)", field: "eps", money: false },
    ];


    const BALANCE_ROWS = [
        { label: "Total Assets", field: "totalAssets", bold: true },
        { label: "Current Assets", field: "totalCurrentAssets" },
        { label: "Cash & Equivalents", field: "cashAndCashEquivalents" },
        { label: "Total Liabilities", field: "totalLiabilities", bold: true },
        { label: "Current Liabilities", field: "totalCurrentLiabilities" },
        { label: "Long-term Debt", field: "longTermDebt" },
        { label: "Shareholder Equity", field: "totalStockholdersEquity", bold: true },
    ]

    const CASH_ROWS = [
        { label: "Operating Cash Flow", field: "operatingCashFlow", bold: true },
        { label: "Capital Expenditures", field: "capitalExpenditure" },
        { label: "Investing Cash Flow", field: "netCashProvidedByInvestingActivities" },
        { label: "Financing Cash Flow", field: "netCashProvidedByFinancingActivities" },
        { label: "Net Change in Cash", field: "netChangeInCash" },
        { label: "Free Cash Flow", field: "freeCashFlow" },
        { label: "Dividends Paid", field: "netDividendsPaid" },
    ];

    // ✅ AFTER — just an empty formatNumber for now
    function formatNumber(num, isPercent = false) {
        if (num === null || num === undefined) return "--"; // handle null/undefined
        const abs = Math.abs(num);

        let formatted;
        if (abs >= 1_000_000_000) formatted = (num / 1_000_000_000).toFixed(2) + "B";
        else if (abs >= 1_000_000) formatted = (num / 1_000_000).toFixed(2) + "M";
        else if (abs >= 1_000) formatted = (num / 1_000).toFixed(0) + "K";
        else formatted = num.toLocaleString();

        return isPercent ? `${formatted}%` : formatted;
    }
    // Add this function
    const toggleWatchlist = async () => {
        const token = localStorage.getItem("accessToken");
        try {
            if (isInWatchlist) {
                await axios.delete(`${API}/watchlist/${stockData.symbol}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API}/watchlist`,
                    { symbol: stockData.symbol, name: stockData.name },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setIsInWatchlist(prev => !prev);
        } catch (err) {
            console.error("Watchlist toggle failed:", err.response?.data || err.message);
        }
    };

    const fetchStock = async () => {
        try {
            const token = localStorage.getItem("accessToken"); // ← add this
            const res = await fetch(`${API}/stock/${symbol}?period=${selectedPeriod}`, {
                headers: { Authorization: `Bearer ${token}` } // ← add this
            });
            if (res.status === 404) {
                console.warn(`Stock not found for ${symbol}`);
                return null; // fallback to mock
            }

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Stock error:", err);
            return null;
        }
    };

    const fetchFundamentals = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API}/stock-fundamentals/${symbol}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (res.status === 404) {
                console.warn(`Fundamentals not found for ${symbol}`);
                return null;
            }

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Fundamentals fetch error:", err);
            return null;
        }
    };

    const fetchFinancials = async () => {
        try {
            const res = await fetch(`${API}/stock-financials/${symbol}`);

            if (res.status === 404) {
                console.warn(`Financials not found for ${symbol}`);
                return null;
            }

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Financials error:", err);
            return null;
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await fetch(`${API}/market-metrics/${symbol}`);

            if (res.status === 404) {
                console.warn(`Financials not found for ${symbol}`);
                return null;
            }

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Financials error:", err);
            return null;
        }
    };

    const fetchFullFinancials = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API}/financials/full/${symbol}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.status === 404) {
                console.warn(`Full financials not found for ${symbol}`);
                return null;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error("Full financials error:", err);
            return null;
        }
    };

    const handleOrder = async () => {
        const priceToSend = priceType === "MARKET"
            ? stockData.price
            : parseFloat(limitPrice);

        if (priceType === "LIMIT" && (!limitPrice || priceToSend <= 0)) {
            alert("Please enter a valid limit price");
            return;
        }

        try {
            setOrderLoading(true);

            const endpoint = orderSide === "BUY"
                ? `${API}/stock/${stockData.symbol}/buy`
                : `${API}/stock/${stockData.symbol}/sell`;

            await axios.post(
                endpoint,
                { quantity: Number(qty), price: priceToSend, name: stockData.name },
                { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
            );

            navigate("/stocks", { state: { tab: "orders" } });
        } catch (err) {
            console.error("Order failed:", err.response?.data || err.message);
        } finally {
            setOrderLoading(false);
        }
    };

    function colLabel(report) {
        const d = report.date || report.fiscalDateEnding || "";
        if (!d) return "—";
        return d.slice(0, 4);
    }

    // Runs ONCE on symbol load — fetches stock data + changes + fundamentals + financials
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (!symbol) return;

        isFirstLoad.current = true;

        // ✅ AFTER
        const loadBaseData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken");

                const wlRes = await fetch(`${API}/watchlist/${symbol}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (wlRes.ok) {
                    const wlData = await wlRes.json();
                    setIsInWatchlist(wlData.isWatchlisted);
                }

                const [stockRes, fundamentalsRes, financialsRes, metricRes, fullFinancialsRes] = await Promise.all([
                    fetchStock(),
                    fetchFundamentals(),
                    fetchFinancials(),
                    fetchMetrics(),
                    fetchFullFinancials(),
                ]);

                if (stockRes) {
                    setStockData(stockRes);
                    setChartData(stockRes.chart || []);
                    setNews(stockRes.news || []);
                } else {
                    setError(`Stock "${symbol}" not found or unavailable.`);
                }

                setfundamentals(fundamentalsRes);
                setFinancials(financialsRes);
                setMetrics(metricRes);

                setFullFinancials(fullFinancialsRes);
            } catch (err) {
                console.error(err);
                setError("Failed to load stock data.");
            } finally {
                setLoading(false);
                isFirstLoad.current = false;
            }
        };

        loadBaseData();
    }, [symbol]);

    // Only fetch chart after first load
    useEffect(() => {
        if (!symbol) return;
        if (isFirstLoad.current) return; // 🔒 guard first render

        const loadChart = async () => {
            const token = localStorage.getItem("accessToken");
            try {
                const res = await fetch(`${API}/stock/${symbol}?period=${selectedPeriod}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return; // handle 404 or error
                const data = await res.json();
                setChartData(data.chart || []);
            } catch (err) {
                console.error(err);
            }
        };

        loadChart();
    }, [symbol, selectedPeriod]);

    useEffect(() => {
        if (!fullFinancials) return;

        // ── DEBUG — remove once working ──
        console.log("fullFinancials:", fullFinancials);
        console.log("incomeStatement:", fullFinancials.incomeStatement);
        console.log("annualReports:", fullFinancials.incomeStatement?.annualReports);
        // ────────────────────────────────

        const sourceMap = {
            income: fullFinancials.incomeStatement?.annualReports,
            balance: fullFinancials.balanceSheet?.annualReports,
            cash: fullFinancials.cashFlow?.annualReports,
        };

        console.log("sourceMap[finSubTab]:", sourceMap[finSubTab]); // ── DEBUG

        const reports = sourceMap[finSubTab] || [];
        setFinReports(Array.isArray(reports) ? reports.slice(0, 5) : []);
        setFinRows({ income: INCOME_ROWS, balance: BALANCE_ROWS, cash: CASH_ROWS }[finSubTab]);

    }, [fullFinancials, finSubTab, period]);

    // ── Derived values ────────────────────────────────────────────────────────
    const periodChange = stockData.changes?.[selectedPeriod] || { change: 0, percent: 0 };
    const isPositive = periodChange.change >= 0;
    const themeColor = isPositive ? "#10b981" : "#ef4444";
    const orderValue = parseFloat(qty || "0") * (priceType === "MARKET" ? stockData.price : parseFloat(limitPrice) || 0);

    // ── Custom Tooltip ────────────────────────────────────────────────────────
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const point = payload[0].payload;
        const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const date = new Date(point.time);

        const label =
            selectedPeriod === "1D"
                ? date.toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                }) // 17 Mar, 10:30 AM
                : date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                }); // 17 Mar 26
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
                                    <h1 className="text-3xl font-semibold tracking-tight">{stockData.name}</h1>
                                    <span className="text-xs font-medium px-2 py-0.5 bg-white/5 text-gray-400 rounded">{stockData.exchange}</span>
                                </div>
                                <p className="text-sm text-gray-400">{stockData.symbol}</p>
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


                                            <YAxis
                                                domain={[
                                                    (dataMin) => dataMin * 0.998,
                                                    (dataMax) => dataMax * 1.002,
                                                ]}
                                                hide
                                            />

                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke={themeColor}
                                                strokeWidth={2.5}   //  slightly thicker
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
                                    onClick={() => toggleWatchlist}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                                >
                                    <Star className={`w-3.5 h-3.5 ${isInWatchlist ? "fill-emerald-500 text-emerald-500" : ""}`} />
                                    {isInWatchlist ? "Watchlisted" : "Add to Watchlist"}
                                </button>
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
                                                { label: "52W Low", value: `$${Number(stockData.fiftyTwoWeek.low).toFixed(2)}` },
                                                { label: "52W High", value: `$${Number(stockData.fiftyTwoWeek.high).toFixed(2)}` },
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
                                                {
                                                    label: "1 Week",
                                                    value: `${Number(stockData?.changes?.["1W"]?.percent ?? 0) >= 0 ? "+" : ""}${Number(stockData?.changes?.["1W"]?.percent ?? 0).toFixed(2)}%`,
                                                    pos: Number(stockData?.changes?.["1W"]?.percent ?? 0) >= 0,
                                                },
                                                {
                                                    label: "1 Month",
                                                    value: `${Number(stockData?.changes?.["1M"]?.percent ?? 0) >= 0 ? "+" : ""}${Number(stockData?.changes?.["1M"]?.percent ?? 0).toFixed(2)}%`,
                                                    pos: Number(stockData?.changes?.["1M"]?.percent ?? 0) >= 0,
                                                },
                                                {
                                                    label: "1 Year",
                                                    value: `${Number(stockData?.changes?.["1Y"]?.percent ?? 0) >= 0 ? "+" : ""}${Number(stockData?.changes?.["1Y"]?.percent ?? 0).toFixed(2)}%`,
                                                    pos: Number(stockData?.changes?.["1Y"]?.percent ?? 0) >= 0,
                                                },
                                                {
                                                    label: "3 Years",
                                                    value: `${Number(stockData?.changes?.["3Y"]?.percent ?? 0) >= 0 ? "+" : ""}${Number(stockData?.changes?.["3Y"]?.percent ?? 0).toFixed(2)}%`,
                                                    pos: Number(stockData?.changes?.["3Y"]?.percent ?? 0) >= 0,
                                                },
                                                {
                                                    label: "5 Years",
                                                    value: `${Number(stockData?.changes?.["5Y"]?.percent ?? 0) >= 0 ? "+" : ""}${Number(stockData?.changes?.["5Y"]?.percent ?? 0).toFixed(2)}%`,
                                                    pos: Number(stockData?.changes?.["5Y"]?.percent ?? 0) >= 0,
                                                },
                                            ].map(({ label, value, pos }) => (
                                                <div key={label} className="bg-[#1a2130]/30 p-3 rounded-lg text-center">
                                                    <div className="text-gray-500 text-xs mb-1">{label}</div>
                                                    <div className={`font-semibold text-sm ${pos ? "text-emerald-400" : "text-red-400"}`}>
                                                        {value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fundamentals */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Fundamentals</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                                            {[
                                                { label: "Market Cap", value: formatNumber(metrics?.marketCap) },
                                                { label: "P/E Ratio", value: formatNumber(metrics?.peRatio) },
                                                { label: "P/B Ratio", value: formatNumber(metrics?.pbRatio) },
                                                { label: "Div Yield", value: `${formatNumber(metrics?.dividendYield)}%` },
                                                { label: "Volume", value: stockData?.volume },
                                                { label: "ROE", value: `${formatNumber(metrics?.roe)}%` },
                                                { label: "EPS (TTM)", value: `${formatNumber(metrics?.eps)}%` },
                                                { label: "Industry P/E", value: "--" },
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

                            {/* NEWS */}
                            {activeTab === "news" && (
                                <div className="space-y-4">
                                    {news.length === 0 ? (
                                        <p className="text-gray-400 text-sm px-4">No news available</p>
                                    ) : (
                                        news.slice(0, 50).map((article, index) => {


                                            const timeAgo = new Date(article.datetime * 1000).toLocaleDateString();

                                            return (
                                                <a
                                                    key={index}
                                                    href={article.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group cursor-pointer block"
                                                >
                                                    <div className="flex gap-4 p-4 rounded-xl hover:bg-[#1a2130]/50 transition-colors">


                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-sm group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
                                                                {article.headline}
                                                            </h4>

                                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                <span className="text-gray-400">{article.source}</span>

                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {timeAgo}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="h-px bg-white/5 mx-4" />
                                                </a>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* FINANCIALS */}
                            {activeTab === "financials" && (
                                <div className="text-sm space-y-8">

                                    {/* ── Key Metrics ───────────────────────────────────────────────── */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Key Financials (TTM)</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: "Revenue", value: `${formatNumber(fullFinancials?.incomeStatement?.highlights?.revenue)}` },
                                                { label: "Net Profit", value: `${formatNumber(fullFinancials?.incomeStatement?.highlights?.netProfit)}` },
                                                { label: "EPS (TTM)", value: `${formatNumber(metrics?.eps)}%` },
                                                { label: "ROE", value: `${formatNumber(metrics?.roe)}%` },
                                            ].map(({ label, value, yoy }) => (
                                                <div key={label} className="bg-[#1a2130]/50 p-4 rounded-lg">
                                                    <div className="text-gray-500 mb-1 text-xs">{label}</div>
                                                    <div className="font-semibold text-base">{value}</div>
                                                    {yoy != null && (
                                                        <div className={`text-xs mt-1 ${yoy >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                            {yoy > 0 ? "+" : ""}{yoy}% YoY
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Sub-tabs + Period toggle ──────────────────────────────────── */}
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex gap-2">
                                            {[
                                                { id: "income", label: "Income Statement" },
                                                { id: "balance", label: "Balance Sheet" },
                                                { id: "cash", label: "Cash Flow" },
                                            ].map(({ id, label }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setFinSubTab(id)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${finSubTab === id ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                    </div>

                                    {/* ── Statement Table ───────────────────────────────────────────── */}
                                    <div className="border border-white/10 rounded-xl overflow-hidden">
                                        {finReports.length === 0 ? (
                                            <div className="text-gray-500 text-center py-10 text-xs">No data available</div>
                                        ) : (
                                            <table className="w-full text-left">
                                                <thead className="bg-[#1a2130]/80 border-b border-white/10">
                                                    <tr>
                                                        <th className="py-3 px-4 font-medium text-gray-400 text-xs">Consolidated ($)</th>
                                                        {finReports.map((r, i) => (
                                                            <th key={i} className="py-3 px-4 font-medium text-gray-400 text-right text-xs">
                                                                {colLabel(r)}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {finRows.map(({ label, field, bold, money = true }) => (
                                                        <tr key={field} className={`hover:bg-white/5 transition-colors ${bold ? "bg-white/[0.02]" : ""}`}>
                                                            <td className={`py-3 px-4 text-xs ${bold ? "text-white font-medium" : "text-gray-300"}`}>
                                                                {label}
                                                            </td>
                                                            {finReports.map((r, i) => {
                                                                const raw = r?.[field];
                                                                const isEmpty = raw == null || raw === "None" || raw === "";
                                                                const num = isEmpty ? null : parseFloat(raw);
                                                                const display = isEmpty
                                                                    ? <span className="text-gray-600">—</span>
                                                                    : isNaN(num)
                                                                        ? raw
                                                                        : money
                                                                            ? formatNumber(num)
                                                                            : num.toLocaleString();
                                                                return (
                                                                    <td key={i} className={`py-3 px-4 text-right text-xs tabular-nums ${bold
                                                                        ? i === 0 ? "text-white font-medium" : "text-white"
                                                                        : i === 0 ? "text-gray-200 font-medium" : "text-gray-400"
                                                                        }`}>
                                                                        {display}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>



                                    {/* ── Ratios ────────────────────────────────────────────────────── */}
                                    <div>
                                        <h3 className="text-base font-semibold mb-4">Financial Ratios</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                                            {[
                                                { label: "Debt/Equity", value: formatNumber(metrics?.DebtToEquity) },
                                                { label: "Current Ratio", value: formatNumber(metrics?.currentRatio) },
                                                { label: "Book Value", value: formatNumber(metrics?.bookValue) },
                                                { label: "Free Cash Flow", value: formatNumber(metrics?.freeCashFlowYield) },
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
                                        className={`flex-1 py-3.5 text-sm font-bold tracking-wider transition-colors ${orderSide === "BUY"
                                            ? "bg-emerald-500 text-white"
                                            : "bg-[#1a2130] text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        BUY
                                    </button>
                                    <button
                                        onClick={() => setOrderSide("SELL")}
                                        className={`flex-1 py-3.5 text-sm font-bold tracking-wider transition-colors ${orderSide === "SELL"
                                            ? "bg-red-500 text-white"
                                            : "bg-[#1a2130] text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        SELL
                                    </button>
                                </div>

                                <div className="p-5 space-y-5">

                                    {/* Inputs */}
                                    <div className="space-y-4 text-sm">

                                        {/* Qty */}
                                        <div className="flex justify-between items-center">
                                            <label className="text-gray-400">Qty (NSE)</label>
                                            <input
                                                type="text"
                                                value={qty}
                                                onKeyDown={(e) => {
                                                    if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => setQty(e.target.value)}
                                                className="w-24 bg-[#1a2130] border border-white/10 rounded py-1.5 px-3 text-right text-white focus:outline-none focus:border-emerald-500/50"
                                            />
                                        </div>

                                        {/* Price Row */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <label className="text-gray-400">Price</label>
                                                <button
                                                    onClick={() => {
                                                        setPriceType(prev => prev === "MARKET" ? "LIMIT" : "MARKET");
                                                        setLimitPrice("");
                                                    }}
                                                    className="text-xs font-bold text-white hover:text-emerald-400 transition-colors"
                                                >
                                                    {priceType === "MARKET" ? "Market ▾" : "Limit ▾"}
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                onKeyDown={(e) => {
                                                    if (!/[0-9.]/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                value={priceType === "MARKET" ? stockData?.price ?? "" : limitPrice}
                                                onClick={() => {
                                                    if (priceType === "MARKET") {
                                                        setPriceType("LIMIT");
                                                        setLimitPrice("");
                                                    }
                                                }}
                                                onChange={(e) => priceType === "LIMIT" && setLimitPrice(e.target.value)}
                                                readOnly={priceType === "MARKET"}
                                                placeholder={stockData?.price ? Number(stockData.price).toFixed(2) : "0.00"}
                                                className={`w-24 bg-[#1a2130] border border-white/10 rounded py-1.5 px-3 text-right text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-gray-600 ${priceType === "MARKET"
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-white cursor-text"
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={handleOrder}
                                        disabled={orderLoading}
                                        className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${orderSide === "BUY"
                                            ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                                            : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                            }`}
                                    >
                                        {orderLoading ? "Placing..." : `${orderSide} ${stockData.symbol}`}
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