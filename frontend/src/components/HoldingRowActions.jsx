// components/HoldingsRowActions.jsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { MoreVert } from "@mui/icons-material";
import { ShoppingCart, TrendingDown } from "lucide-react";
import TradeModal from "./Trademodal.jsx";

export function HoldingsRowActions({ holding, hoverRow, stocks, onTraded }) {
    const [isOpen, setIsOpen] = useState(false);
    const [tradeModal, setTradeModal] = useState({ open: false, mode: "BUY" });
    const [dropUp, setDropUp] = useState(false);          // ← new
    const wrapperRef = useRef(null);                       // ← new

    const stock = stocks.find(s => s.symbol === holding.symbol);
    const currentPrice = stock?.price ?? holding.avgPrice;
    const isBuy = tradeModal.mode === "BUY";

    const handleMouseEnter = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            // If less than 180px below the button, flip upward
            setDropUp(window.innerHeight - rect.bottom < 180);
        }
        setIsOpen(true);
    };

    return (
        <>
            <div
                ref={wrapperRef}
                className="relative inline-block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsOpen(false)}
            >
                <button
                    className={`rounded-lg p-1 transition-opacity duration-200 ${hoverRow === holding._id ? "opacity-100" : "opacity-0"
                        } hover:bg-slate-700/60`}
                >
                    <MoreVert className="h-4 w-4 text-slate-300" />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: dropUp ? -6 : 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: dropUp ? -4 : 4, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 w-52 z-[9999] rounded-xl overflow-hidden"
                            style={{
                                // ← key change: anchor to bottom when flipping up
                                ...(dropUp
                                    ? { bottom: "calc(100% + 4px)" }
                                    : { top: "calc(100% + 4px)" }),
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
                                    {holding.symbol}
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>
                                    {holding.quantity} shares
                                </span>
                            </div>

                            {/* Buy More */}
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
                                Buy More
                            </motion.button>

                            {/* Sell */}
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
                                Sell
                                <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.6 }}>
                                    ({holding.quantity} held)
                                </span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <TradeModal
                isOpen={tradeModal.open}
                onClose={() => setTradeModal(m => ({ ...m, open: false }))}
                mode={tradeModal.mode}
                holding={holding}
                currentPrice={currentPrice}
                onConfirm={async ({ symbol, quantity, price, mode }) => {
                    const token = localStorage.getItem("accessToken");
                    const API = import.meta.env.VITE_API_URL;
                    const toastId = toast.loading(`${mode === "BUY" ? "Buying" : "Selling"} ${symbol}...`);
                    try {
                        const { default: axios } = await import("axios");
                        if (mode === "BUY") {
                            await axios.post(
                                `${API}/stock/${symbol}/buy`,
                                { quantity, price, name: holding.name },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                        } else {
                            await axios.post(
                                `${API}/stock/${symbol}/sell`,
                                { quantity, price },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                        }
                        toast.success(`${mode} order successful (${quantity} ${symbol})`, { id: toastId });
                        onTraded?.();
                    } catch (err) {
                        toast.error(
                            err?.response?.data?.message || err?.message || "Trade failed",
                            { id: toastId }
                        );
                        throw err;
                    }
                }}
            />
        </>
    );
}