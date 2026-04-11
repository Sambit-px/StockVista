import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { MoreVert } from "@mui/icons-material";
import { X, Zap, AlertCircle, ChevronDown, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export function OrdersRowActions({
    order,
    hoverRow,
    stocks = [],
    onRefresh,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const [mode, setMode] = useState("EDIT");
    const [dropUp, setDropUp] = useState(false);
    const wrapperRef = useRef(null);

    const stockInfo = stocks.find((s) => s.symbol === order.symbol);
    const isPending = order.status === "PENDING";
    const isBuy = order.type === "BUY";

    const handleCancel = async () => {
        const token = localStorage.getItem("accessToken");
        try {
            await axios.delete(`${API}/order/${order._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Order cancelled successfully");
            setCancelModal(false);
            onRefresh?.();
        } catch (err) {
            toast.error("Failed to cancel order");
        }
    };

    const handleEdit = async ({ quantity, price }) => {
        const token = localStorage.getItem("accessToken");
        try {
            await axios.put(
                `${API}/order/${order._id}`,
                { quantity, price },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Order updated successfully");
            setEditModal(false);
            onRefresh?.();
        } catch (err) {
            toast.error("Failed to update order");
        }
    };

    const handleReorder = async ({ quantity, price }) => {
        const token = localStorage.getItem("accessToken");

        const endpoint =
            order.type === "BUY"
                ? `${API}/stock/${order.symbol}/buy`
                : `${API}/stock/${order.symbol}/sell`;

        try {
            await axios.post(
                endpoint,
                {
                    quantity,
                    price,
                    name: stockInfo?.name || order.symbol,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Order placed successfully 🚀");
            setEditModal(false);
            onRefresh?.();
        } catch (err) {
            toast.error("Order failed (market/live issue)");
        }
    };

    const handleMouseEnter = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
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
                    className={`p-1 rounded transition-opacity duration-200 ${hoverRow === order._id ? "opacity-100" : "opacity-0"
                        } hover:bg-slate-700/50`}
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
                            className="absolute right-0 mt-1 w-52 z-[9999] rounded-xl overflow-hidden"
                            style={{
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
                            {/* Header badge */}
                            <div style={{
                                padding: "10px 14px 9px",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{
                                        fontSize: 9, fontWeight: 900, letterSpacing: "0.1em",
                                        padding: "2px 6px", borderRadius: 4,
                                        background: isBuy ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                                        color: isBuy ? "#34d399" : "#f87171",
                                    }}>
                                        {order.type}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>
                                        {stockInfo?.name || order.symbol}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    color: order.status === "Executed" ? "#34d399"
                                        : order.status === "Pending" ? "#fbbf24"
                                            : "#6b7280",
                                }}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Edit — Pending only */}
                            {!isPending && (
                                <motion.button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setMode("REORDER");
                                        setEditModal(true);
                                    }}

                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        width: "100%",
                                        padding: "10px 14px",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: "#93c5fd",
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.08)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <RefreshCw size={12} style={{ color: "#60a5fa" }} />
                                    Modify & Reorder
                                </motion.button>
                            )}

                            {/* Repeat Order — Executed / Cancelled */}
                            {/* Edit — ONLY for Pending */}
                            {isPending && (
                                <motion.button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setMode("EDIT");
                                        setEditModal(true);
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        width: "100%",
                                        padding: "10px 14px",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: "#94a3b8",
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(251,191,36,0.06)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <FontAwesomeIcon icon={faPen} style={{ fontSize: 12, color: "#64748b" }} />
                                    Edit Order
                                </motion.button>
                            )}

                            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />

                            {/* Cancel */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => { setIsOpen(false); setCancelModal(true); }}
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
                                Cancel Order
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <EditOrderModal
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                order={order}
                stockInfo={stockInfo}
                onConfirm={mode === "EDIT" ? handleEdit : handleReorder}
            />

            <CancelConfirmModal
                isOpen={cancelModal}
                onClose={() => setCancelModal(false)}
                order={order}
                stockInfo={stockInfo}
                onConfirm={handleCancel}
            />


        </>
    );
}

/* ── EditOrderModal (unchanged internals) ── */
function EditOrderModal({ isOpen, onClose, order, stockInfo, onConfirm }) {
    const [qty, setQty] = useState("");
    const [price, setPrice] = useState("");
    const [priceType, setPriceType] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [livePrice, setLivePrice] = useState(null);

    const isBuy = order?.type === "BUY";
    const accent = isBuy ? "#10b981" : "#ef4444";
    const accentHover = isBuy ? "#059669" : "#dc2626";
    const accentSoft = isBuy ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";
    const accentBorder = isBuy ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)";
    const accentGlow = isBuy ? "0 0 60px rgba(16,185,129,0.12)" : "0 0 60px rgba(239,68,68,0.12)";

    useEffect(() => {
        if (isOpen) {
            setQty(String(order?.quantity ?? 1));
            setPrice(String(order?.price ?? ""));
            setPriceType("MARKET");
            setShowMenu(false);
            setLoading(false);
            setConfirmed(false);
        }
    }, [isOpen]);

    const parsedQty = Math.max(0, parseInt(qty) || 0);

    // Use livePrice only if priceType is MARKET, otherwise use entered price
    const parsedPrice =
        priceType === "MARKET"
            ? livePrice != null
                ? Number(livePrice)
                : null
            : parseFloat(price) || 0;

    // Show "--" until livePrice is available
    const total = parsedPrice != null ? (parsedQty * parsedPrice).toFixed(2) : "--";
    const valid =
        parsedQty > 0 &&
        (priceType === "MARKET" || parsedPrice > 0);

    const displayTotal =
        parsedPrice != null
            ? (parsedQty * parsedPrice).toFixed(2)
            : "--";

    const handleConfirm = async () => {
        if (!valid) return;
        setLoading(true);
        try {
            if (parsedPrice != null) {
                await onConfirm({
                    quantity: parsedQty,
                    price: parsedPrice,
                    priceType,
                });
            }
            setConfirmed(true);
            setTimeout(() => onClose(), 1500);
        } catch {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "96px", background: "#1a2130",
        border: "1px solid rgba(255,255,255,0.10)", borderRadius: "7px",
        padding: "7px 12px", textAlign: "right", color: "#fff",
        fontSize: "13px", fontWeight: 600, outline: "none",
        fontFamily: "inherit",
    };


    useEffect(() => {
        if (priceType !== "MARKET") return;

        const fetchLivePrice = async () => {
            try {
                const token = localStorage.getItem("accessToken");

                const res = await axios.get(`${API}/stock/${order.symbol}/live`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data?.price !== undefined) {
                    setLivePrice(Number(res.data.price));
                }
            } catch (err) {
                console.error("Live price fetch failed:", err);
            }
        };

        fetchLivePrice();
        const interval = setInterval(fetchLivePrice, 3000);
        return () => clearInterval(interval);
    }, [priceType, order.symbol]);



    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="edit-bd"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(2,6,23,0.80)",
                            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                            zIndex: 9998,
                        }}
                    />
                    <motion.div
                        key="edit-panel"
                        initial={{ opacity: 0, y: -28, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -18, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        style={{
                            position: "fixed", top: "6vh", left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 9999, width: "min(400px, 94vw)",
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            background: "#111723",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderRadius: "20px",
                            boxShadow: `${accentGlow}, 0 40px 80px rgba(0,0,0,0.7)`,
                            overflow: "hidden",
                        }}
                    >
                        <div style={{
                            padding: "16px 20px 14px",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{
                                    fontSize: 9, fontWeight: 900, letterSpacing: "0.1em",
                                    padding: "3px 8px", borderRadius: 5,
                                    background: isBuy ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                                    color: accent,
                                }}>
                                    {order?.type}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>Edit Order</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "50%", width: 28, height: 28,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#6b7280",
                                }}
                            >
                                <X size={13} />
                            </motion.button>
                        </div>

                        <div style={{ padding: "20px" }}>
                            <motion.div
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.06 }}
                                style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    marginBottom: 18, padding: "13px 16px", borderRadius: 12,
                                    background: "rgba(255,255,255,0.025)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>
                                        {stockInfo?.name || order?.symbol}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#4b5563", fontWeight: 600, marginTop: 3 }}>
                                        {order?.symbol} · {order?.status}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc" }}>
                                        ${Number(order?.price ?? 0).toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>original price</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Qty</span>
                                    <input
                                        type="text" value={qty}
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key))
                                                e.preventDefault();
                                        }}
                                        onChange={(e) => setQty(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                                        <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Price</span>
                                        <button
                                            onClick={() => setShowMenu(v => !v)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 3,
                                                background: "none", border: "none", cursor: "pointer",
                                                fontSize: 12, fontWeight: 800, color: "#fff", padding: 0,
                                            }}
                                        >
                                            {priceType === "MARKET" ? "Market" : "Limit"}
                                            <ChevronDown size={12} />
                                        </button>
                                        <AnimatePresence>
                                            {showMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                                    transition={{ duration: 0.12 }}
                                                    style={{
                                                        position: "absolute", top: 22, left: 38,
                                                        background: "#1e2a3a",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                        borderRadius: 10, overflow: "hidden", zIndex: 10,
                                                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)", minWidth: 100,
                                                    }}
                                                >
                                                    {["MARKET", "LIMIT"].map((pt) => (
                                                        <button
                                                            key={pt}
                                                            onClick={() => { setPriceType(pt); setShowMenu(false); }}
                                                            style={{
                                                                display: "block", width: "100%",
                                                                padding: "9px 14px", textAlign: "left",
                                                                fontSize: 12, fontWeight: 700,
                                                                color: priceType === pt ? accent : "#9ca3af",
                                                                background: priceType === pt ? accentSoft : "transparent",
                                                                border: "none", cursor: "pointer",
                                                            }}
                                                        >
                                                            {pt === "MARKET" ? "Market" : "Limit"}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <input
                                        type="text"
                                        value={priceType === "MARKET" ? (livePrice != null ? livePrice.toFixed(2) : "") : price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        readOnly={priceType === "MARKET"}
                                        placeholder="0.00"
                                        style={{
                                            ...inputStyle,
                                            color: priceType === "MARKET" ? "#6b7280" : "#fff",
                                            cursor: priceType === "MARKET" ? "not-allowed" : "text",
                                        }}
                                        onClick={() => {
                                            if (priceType === "MARKET") {
                                                // Switch to LIMIT when clicked
                                                setPriceType("LIMIT");
                                                setPrice(livePrice != null ? livePrice.toFixed(2) : "");
                                            }
                                        }}
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}
                                style={{
                                    padding: "12px 14px", borderRadius: 10,
                                    background: accentSoft, border: `1px solid ${accentBorder}`,
                                    marginBottom: 16,
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                }}
                            >
                                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Updated order value</span>
                                <motion.span
                                    key={displayTotal}
                                    initial={{ opacity: 0, scale: 0.88 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 420 }}
                                    style={{ fontSize: 20, fontWeight: 900, color: accent }}
                                >
                                    {displayTotal === "--" ? "$--" : `$${displayTotal}`}
                                </motion.span>
                            </motion.div>

                            <motion.button
                                whileHover={!loading && !confirmed ? { scale: 1.02, background: accentHover } : {}}
                                whileTap={!loading && !confirmed ? { scale: 0.97 } : {}}
                                onClick={!loading && !confirmed ? handleConfirm : undefined}
                                style={{
                                    width: "100%", height: 50, borderRadius: 12, border: "none",
                                    cursor: loading || confirmed ? "default" : "pointer",
                                    background: confirmed ? "#059669" : accent,
                                    color: "#fff", fontSize: 14, fontWeight: 800,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    boxShadow: isBuy ? "0 4px 20px rgba(16,185,129,0.3)" : "0 4px 20px rgba(239,68,68,0.3)",
                                    opacity: loading ? 0.85 : 1,
                                    transition: "background 0.18s",
                                    position: "relative", overflow: "hidden",
                                }}
                            >
                                <motion.div
                                    style={{
                                        position: "absolute", top: 0, left: "-80%",
                                        width: "40%", height: "100%", pointerEvents: "none",
                                        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
                                        transform: "skewX(-15deg)",
                                    }}
                                    animate={{ left: ["-80%", "160%"] }}
                                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 2.5 }}
                                />
                                <AnimatePresence mode="wait">
                                    {loading && !confirmed && (
                                        <motion.div key="spin"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            style={{
                                                width: 20, height: 20,
                                                border: "2.5px solid rgba(255,255,255,0.3)",
                                                borderTop: "2.5px solid #fff",
                                                borderRadius: "50%",
                                                animation: "editSpin 0.7s linear infinite",
                                            }}
                                        />
                                    )}
                                    {confirmed && (
                                        <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            ✓ Order Updated!
                                        </motion.span>
                                    )}
                                    {!loading && !confirmed && (
                                        <motion.div key="idle"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            style={{ display: "flex", alignItems: "center", gap: 7 }}
                                        >
                                            <Zap size={15} fill="white" strokeWidth={0} />
                                            Update Order
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                        <style>{`@keyframes editSpin { to { transform: rotate(360deg); } }`}</style>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ── CancelConfirmModal (unchanged internals) ── */
function CancelConfirmModal({ isOpen, onClose, order, stockInfo, onConfirm }) {
    const [loading, setLoading] = useState(false);
    const isBuy = order?.type === "BUY";

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="cancel-bd"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(2,6,23,0.80)",
                            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                            zIndex: 9998,
                        }}
                    />
                    <motion.div
                        key="cancel-panel"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        style={{
                            position: "fixed", top: "12vh", left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 9999, width: "min(360px, 93vw)",
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            background: "#111723",
                            border: "1px solid rgba(239,68,68,0.18)",
                            borderRadius: "20px",
                            boxShadow: "0 0 50px rgba(239,68,68,0.10), 0 30px 80px rgba(0,0,0,0.65)",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ padding: "24px 20px 0", textAlign: "center" }}>
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 380, delay: 0.05 }}
                                style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.25)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    margin: "0 auto 14px",
                                }}
                            >
                                <AlertCircle size={22} style={{ color: "#f87171" }} />
                            </motion.div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>
                                Cancel this order?
                            </div>
                            <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, marginBottom: 20 }}>
                                This will cancel your{" "}
                                <span style={{ color: isBuy ? "#34d399" : "#f87171", fontWeight: 700 }}>{order?.type}</span>{" "}
                                order for{" "}
                                <span style={{ color: "#94a3b8", fontWeight: 700 }}>{order?.quantity} × {stockInfo?.name || order?.symbol}</span>{" "}
                                at <span style={{ color: "#f1f5f9", fontWeight: 700 }}>${order?.price}</span>. This cannot be undone.
                            </div>
                        </div>
                        <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onClose}
                                style={{
                                    flex: 1, height: 44, borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    background: "rgba(255,255,255,0.04)",
                                    color: "#94a3b8", fontSize: 13, fontWeight: 700, cursor: "pointer",
                                }}
                            >
                                Keep Order
                            </motion.button>
                            <motion.button
                                whileHover={!loading ? { scale: 1.02, background: "#dc2626" } : {}}
                                whileTap={!loading ? { scale: 0.97 } : {}}
                                onClick={!loading ? handleConfirm : undefined}
                                style={{
                                    flex: 1, height: 44, borderRadius: 10, border: "none",
                                    background: "#ef4444", color: "#fff",
                                    fontSize: 13, fontWeight: 800,
                                    cursor: loading ? "default" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
                                    opacity: loading ? 0.8 : 1,
                                    transition: "background 0.15s",
                                }}
                            >
                                {loading ? (
                                    <div style={{
                                        width: 16, height: 16,
                                        border: "2px solid rgba(255,255,255,0.3)",
                                        borderTop: "2px solid #fff",
                                        borderRadius: "50%",
                                        animation: "cancelSpin 0.7s linear infinite",
                                    }} />
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 12 }} />
                                        Yes, Cancel
                                    </>
                                )}
                            </motion.button>
                        </div>
                        <style>{`@keyframes cancelSpin { to { transform: rotate(360deg); } }`}</style>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}