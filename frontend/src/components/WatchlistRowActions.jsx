import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faBell, faBellSlash } from "@fortawesome/free-solid-svg-icons";
import { HiListBullet } from "react-icons/hi2";
import { MoreVert } from "@mui/icons-material";
import toast from "react-hot-toast";
import { ShoppingCart, TrendingDown, TrendingUp, X, Bell } from "lucide-react";
import axios from "axios";
import TradeModal from "./Trademodal.jsx";

const API = import.meta.env.VITE_API_URL;

export function WatchlistRowActions({
    stock,
    hoverRow,
    navigate,
    holdings = [],
    onRemove,
    onTraded,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [tradeModal, setTradeModal] = useState({ open: false, mode: "BUY" });
    const [alertModal, setAlertModal] = useState(false);
    const [alertActive, setAlertActive] = useState(false);

    const existingHolding = holdings.find((h) => h.symbol === stock.symbol);
    const holding = existingHolding ?? {
        symbol: stock.symbol,
        name: stock.name,
        avgPrice: stock.price,
        quantity: 0,
    };

    const toastId = (mode) => `${stock.symbol}-${mode}`;

    const handleBuy = async ({ symbol, quantity, price }) => {
        const id = toastId("BUY");
        toast.loading("Buying stock…", { id });
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post(
                `${API}/stock/${symbol}/buy`,
                { quantity, price, name: stock.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Stock bought successfully!", { id });
            onTraded?.();
        } catch {
            toast.error("Buy failed. Please try again.", { id });
        }
    };

    const handleSell = async ({ symbol, quantity, price }) => {
        const id = toastId("SELL");
        toast.loading("Selling stock…", { id });
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post(
                `${API}/stock/${symbol}/sell`,
                { quantity, price },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Stock sold successfully!", { id });
            onTraded?.();
        } catch {
            toast.error("Sell failed. Please try again.", { id });
        }
    };

    const handleRemove = async (symbol) => {
        const id = `${symbol}-remove`;
        toast.loading("Removing...", { id });

        try {
            await onRemove?.(symbol);
            toast.success("Removed from watchlist", { id });
        } catch {
            toast.error("Failed to remove", { id });
        }
    };

    const handleSetAlert = (price, direction) => {
        setAlertActive(true);
        setAlertModal(false);
        toast.success(`Alert set: ${stock.symbol} ${direction === "ABOVE" ? "above" : "below"} $${parseFloat(price).toFixed(2)}`);
    };

    const handleRemoveAlert = () => {
        setAlertActive(false);
        setAlertModal(false);
        toast.success("Price alert removed");
    };

    const isPositive = (stock.changesPercentage ?? 0) >= 0;

    return (
        <>
            <div
                className="relative inline-block"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <button
                    className={`rounded-lg p-1 transition-opacity duration-200 ${hoverRow === stock.symbol ? "opacity-100" : "opacity-0"
                        } hover:bg-slate-700/60`}
                >
                    <MoreVert className="h-4 w-4 text-slate-300" />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-1 w-56 z-[9999] rounded-xl overflow-hidden"
                            style={{
                                background: "rgba(15,22,36,0.97)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                                fontFamily: "'DM Sans', system-ui, sans-serif",
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: "10px 14px 9px",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.08em" }}>
                                    {stock.symbol}
                                </span>
                                <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    color: isPositive ? "#34d399" : "#f87171",
                                    display: "flex", alignItems: "center", gap: 3,
                                }}>
                                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {isPositive ? "+" : ""}{(stock.changesPercentage ?? 0).toFixed(2)}%
                                </span>
                            </div>

                            {/* View Details */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => { setIsOpen(false); navigate(`/stock/${stock.symbol}`); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "10px 14px",
                                    fontSize: 13, fontWeight: 500, color: "#cbd5e1",
                                    background: "transparent", border: "none",
                                    cursor: "pointer", textAlign: "left",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <HiListBullet style={{ fontSize: 15, color: "#64748b" }} />
                                View Details
                            </motion.button>

                            {/* Buy Now */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => { setIsOpen(false); setTradeModal({ open: true, mode: "BUY" }); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "10px 14px",
                                    fontSize: 13, fontWeight: 700, color: "#34d399",
                                    background: "transparent", border: "none",
                                    cursor: "pointer", textAlign: "left",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.08)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <ShoppingCart size={13} />
                                Buy Now
                            </motion.button>

                            {/* Sell */}
                            {holding.quantity > 0 && (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => { setIsOpen(false); setTradeModal({ open: true, mode: "SELL" }); }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        width: "100%", padding: "10px 14px",
                                        fontSize: 13, fontWeight: 700, color: "#f87171",
                                        background: "transparent", border: "none",
                                        cursor: "pointer", textAlign: "left",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <TrendingDown size={13} />
                                    Sell&nbsp;
                                    <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.6 }}>
                                        ({holding.quantity} held)
                                    </span>
                                </motion.button>
                            )}

                            {/* Set Alert */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => { setIsOpen(false); setAlertModal(true); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "10px 14px",
                                    fontSize: 13, fontWeight: 500,
                                    color: alertActive ? "#fbbf24" : "#94a3b8",
                                    background: "transparent", border: "none",
                                    cursor: "pointer", textAlign: "left",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(251,191,36,0.06)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <FontAwesomeIcon
                                    icon={alertActive ? faBellSlash : faBell}
                                    style={{ fontSize: 12, color: alertActive ? "#fbbf24" : "#64748b" }}
                                />
                                {alertActive ? "Remove Alert" : "Set Price Alert"}
                            </motion.button>

                            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />

                            {/* Remove */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => { setIsOpen(false); handleRemove(stock.symbol); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "10px 14px",
                                    fontSize: 13, fontWeight: 500, color: "#f87171",
                                    background: "transparent", border: "none",
                                    cursor: "pointer", textAlign: "left",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <FontAwesomeIcon icon={faTrash} style={{ fontSize: 12 }} />
                                Remove from Watchlist
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Trade Modal */}
            <TradeModal
                isOpen={tradeModal.open}
                onClose={() => setTradeModal((m) => ({ ...m, open: false }))}
                mode={tradeModal.mode}
                holding={holding}
                currentPrice={stock.price}
                onConfirm={async ({ symbol, quantity, price, mode }) => {
                    if (mode === "BUY") await handleBuy({ symbol, quantity, price });
                    else await handleSell({ symbol, quantity, price });
                    setTradeModal((m) => ({ ...m, open: false }));
                }}
            />

            {/* Price Alert Modal */}
            <PriceAlertModal
                isOpen={alertModal}
                onClose={() => setAlertModal(false)}
                stock={stock}
                currentlyActive={alertActive}
                onSet={handleSetAlert}
                onRemove={handleRemoveAlert}
            />
        </>
    );
}

function PriceAlertModal({ isOpen, onClose, stock, currentlyActive, onSet, onRemove }) {
    const [alertPrice, setAlertPrice] = useState("");
    const [direction, setDirection] = useState("ABOVE");

    useEffect(() => {
        if (isOpen) {
            setAlertPrice(stock?.price ? stock.price.toFixed(2) : "");
            setDirection("ABOVE");
        }
    }, [isOpen, stock?.price]);

    const parsedPrice = parseFloat(alertPrice) || 0;
    const valid = parsedPrice > 0;

    const handleKey = (e) => {
        if (!/[0-9.]/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key))
            e.preventDefault();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="alert-bd"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onClose}
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(2,6,23,0.75)",
                            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                            zIndex: 9998,
                        }}
                    />
                    <motion.div
                        key="alert-panel"
                        initial={{ opacity: 0, y: -22, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        style={{
                            position: "fixed", top: "8vh", left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 9999, width: "min(380px, 93vw)",
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            background: "#111723",
                            border: "1px solid rgba(251,191,36,0.18)",
                            borderRadius: "20px",
                            boxShadow: "0 0 50px rgba(251,191,36,0.10), 0 30px 80px rgba(0,0,0,0.65)",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{
                            padding: "14px 18px 12px",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Bell size={14} style={{ color: "#fbbf24" }} />
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>Price Alert</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "50%", width: 26, height: 26,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#6b7280",
                                }}
                            >
                                <X size={12} />
                            </motion.button>
                        </div>

                        <div style={{ padding: "16px 18px 20px" }}>
                            <div style={{
                                padding: "10px 14px", borderRadius: 12,
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                marginBottom: 16,
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>{stock?.name}</div>
                                    <div style={{ fontSize: 11, color: "#4b5563", fontWeight: 600, marginTop: 2 }}>{stock?.symbol}</div>
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc" }}>
                                    ${stock?.price?.toFixed(2)}
                                </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                                    Alert me when price goes
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {[
                                        { label: "▲  Above", value: "ABOVE", color: "#10b981", border: "rgba(16,185,129,0.35)", bg: "rgba(16,185,129,0.08)" },
                                        { label: "▼  Below", value: "BELOW", color: "#ef4444", border: "rgba(239,68,68,0.35)", bg: "rgba(239,68,68,0.08)" },
                                    ].map((d) => (
                                        <motion.button
                                            key={d.value} whileTap={{ scale: 0.97 }}
                                            onClick={() => setDirection(d.value)}
                                            style={{
                                                flex: 1, padding: "9px 0", borderRadius: 10,
                                                border: `1px solid ${direction === d.value ? d.border : "rgba(255,255,255,0.07)"}`,
                                                background: direction === d.value ? d.bg : "rgba(255,255,255,0.03)",
                                                color: direction === d.value ? d.color : "#4b5563",
                                                fontSize: 12, fontWeight: 800, cursor: "pointer",
                                                transition: "all 0.14s",
                                            }}
                                        >
                                            {d.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                                    Target Price
                                </div>
                                <div style={{
                                    display: "flex", alignItems: "center",
                                    background: "#1a2130", border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 10, padding: "0 14px", gap: 8,
                                }}>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: "#4b5563" }}>$</span>
                                    <input
                                        type="text" value={alertPrice}
                                        onKeyDown={handleKey} onChange={(e) => setAlertPrice(e.target.value)}
                                        placeholder="0.00"
                                        style={{
                                            flex: 1, background: "transparent", border: "none", outline: "none",
                                            fontSize: 18, fontWeight: 700, color: "#f1f5f9",
                                            padding: "11px 0", fontFamily: "inherit",
                                        }}
                                    />
                                    <span style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>USD</span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {valid && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        style={{
                                            padding: "9px 12px", borderRadius: 8, marginBottom: 14,
                                            background: "rgba(251,191,36,0.07)",
                                            border: "1px solid rgba(251,191,36,0.15)",
                                            fontSize: 12, color: "#fbbf24", fontWeight: 600,
                                        }}
                                    >
                                        Notify when {stock?.symbol} goes {direction === "ABOVE" ? "above" : "below"} ${parseFloat(alertPrice).toFixed(2)}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={{ display: "flex", gap: 8 }}>
                                {currentlyActive && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onRemove}
                                        style={{
                                            flex: 0.4, height: 44, borderRadius: 10,
                                            border: "1px solid rgba(239,68,68,0.3)",
                                            background: "rgba(239,68,68,0.08)",
                                            color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer",
                                        }}
                                    >
                                        Remove
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={valid ? { scale: 1.02, background: "#d97706" } : {}}
                                    whileTap={valid ? { scale: 0.97 } : {}}
                                    onClick={valid ? () => onSet(alertPrice, direction) : undefined}
                                    style={{
                                        flex: 1, height: 44, borderRadius: 10, border: "none",
                                        background: valid ? "#fbbf24" : "rgba(251,191,36,0.15)",
                                        color: valid ? "#1a1200" : "#4b5563",
                                        fontSize: 13, fontWeight: 800,
                                        cursor: valid ? "pointer" : "not-allowed",
                                        transition: "background 0.15s",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    }}
                                >
                                    <Bell size={13} />
                                    Set Alert
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}