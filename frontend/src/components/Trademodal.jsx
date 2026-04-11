import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, TrendingUp, TrendingDown, Zap, AlertCircle, ChevronDown } from "lucide-react";

/**
 * TradeModal — Premium Buy/Sell dialog with Market / Limit toggle
 *
 * Props:
 *   isOpen       : boolean
 *   onClose      : () => void
 *   mode         : "BUY" | "SELL"
 *   holding      : { symbol, name, avgPrice, quantity }
 *   currentPrice : number
 *   onConfirm    : ({ symbol, quantity, price, mode, priceType }) => Promise<void>
 */
export default function TradeModal({
    isOpen,
    onClose,
    mode = "BUY",
    holding,
    currentPrice,
    onConfirm,
}) {
    const [activeMode, setActiveMode] = useState(mode);
    const [qty, setQty] = useState("1");
    const [priceType, setPriceType] = useState("MARKET");
    const [limitPrice, setLimitPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [showPriceMenu, setShowPriceMenu] = useState(false);

    const isBuy = activeMode === "BUY";
    const livePrice = currentPrice ?? holding?.avgPrice ?? 0;
    const quantity = holding?.quantity;
    const execPrice = priceType === "MARKET" ? livePrice : (parseFloat(limitPrice) || 0);
    const parsedQty = Math.max(0, parseInt(qty) || 0);
    const total = (execPrice * parsedQty).toFixed(2);
    const maxSell = holding?.quantity ?? 0;

    const pnlPerShare = !isBuy ? livePrice - (holding?.avgPrice ?? 0) : null;
    const pnlTotal = pnlPerShare !== null ? (pnlPerShare * parsedQty).toFixed(2) : null;
    const isProfitable = (pnlPerShare ?? 0) >= 0;

    useEffect(() => {
        if (isOpen) {
            setActiveMode(mode);
            setQty("1");
            setPriceType("MARKET");
            setLimitPrice("");
            setLoading(false);
            setConfirmed(false);
            setShowPriceMenu(false);
        }
    }, [isOpen, mode]);

    const handleQtyKey = (e) => {
        if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handlePriceKey = (e) => {
        if (!/[0-9.]/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleConfirm = async () => {
        if (priceType === "LIMIT" && (!limitPrice || parseFloat(limitPrice) <= 0)) return;
        if (parsedQty <= 0) return;
        if (!isBuy && parsedQty > maxSell) return;

        setLoading(true);
        try {
            await onConfirm?.({
                symbol: holding?.symbol,
                quantity: parsedQty,
                price: execPrice,
                mode: activeMode,
                priceType,
            });
            setConfirmed(true);
            setTimeout(() => onClose(), 1500);
        } catch {
            setLoading(false);
        }
    };

    const accent = isBuy ? "#10b981" : "#ef4444";
    const accentHover = isBuy ? "#059669" : "#dc2626";
    const accentSoft = isBuy ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";
    const accentBorder = isBuy ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)";
    const accentGlow = isBuy
        ? "0 0 60px rgba(16,185,129,0.18)"
        : "0 0 60px rgba(239,68,68,0.18)";

    const inputStyle = {
        width: "96px",
        background: "#1a2130",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "7px",
        padding: "7px 12px",
        textAlign: "right",
        color: "#fff",
        fontSize: "13px",
        fontWeight: 600,
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color 0.15s",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="bd"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(2,6,23,0.80)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            zIndex: 9998,
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: -28, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -18, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        style={{
                            position: "fixed",
                            top: "6vh",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 9999,
                            width: "min(400px, 94vw)",
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            background: "#111723",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderRadius: "20px",
                            boxShadow: `${accentGlow}, 0 40px 80px rgba(0,0,0,0.7)`,
                            overflow: "hidden",
                        }}
                    >
                        {/* ── BUY / SELL toggle tabs ── */}
                        <div style={{ display: "flex" }}>
                            {["BUY", "SELL"].map((m) => (
                                <motion.button
                                    key={m}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveMode(m)}
                                    style={{
                                        flex: 1,
                                        padding: "14px 0",
                                        fontSize: "13px",
                                        fontWeight: 800,
                                        letterSpacing: "0.08em",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "all 0.18s",
                                        background: activeMode === m
                                            ? (m === "BUY" ? "#10b981" : "#ef4444")
                                            : "#1a2130",
                                        color: activeMode === m ? "#fff" : "#6b7280",
                                    }}
                                >
                                    {m}
                                </motion.button>
                            ))}
                        </div>

                        <div style={{ padding: "20px" }}>

                            {/* ── Stock name + live price ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "18px",
                                    padding: "14px 16px",
                                    borderRadius: "12px",
                                    background: "rgba(255,255,255,0.025)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
                                        {holding?.name ?? holding?.symbol}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#4b5563", fontWeight: 600, marginTop: "3px", letterSpacing: "0.04em" }}>
                                        {holding?.symbol} · NSE
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "20px", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.03em" }}>
                                        ${Number(livePrice).toFixed(2)}
                                    </div>
                                    {!isBuy && (
                                        <div style={{
                                            fontSize: "11px", fontWeight: 700,
                                            color: isProfitable ? "#10b981" : "#ef4444",
                                            marginTop: "2px",
                                        }}>
                                            avg ${Number(holding?.avgPrice ?? 0).toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* ── Inputs ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 }}
                                style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}
                            >
                                {/* Qty row */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 500 }}>
                                        Qty {!isBuy && maxSell > 0 && (
                                            <span style={{ color: "#4b5563", fontSize: "11px" }}>
                                                (max {maxSell})
                                            </span>
                                        )}
                                    </span>
                                    <input
                                        type="text"
                                        value={qty}
                                        onKeyDown={handleQtyKey}
                                        onChange={(e) => setQty(e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            borderColor: (!isBuy && parsedQty > maxSell && maxSell > 0)
                                                ? "rgba(239,68,68,0.5)"
                                                : "rgba(255,255,255,0.10)",
                                        }}
                                    />
                                </div>

                                {/* Price row */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
                                        <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 500 }}>Price</span>

                                        {/* Market/Limit dropdown trigger */}
                                        <button
                                            onClick={() => setShowPriceMenu(v => !v)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "3px",
                                                background: "none", border: "none", cursor: "pointer",
                                                fontSize: "12px", fontWeight: 800, color: "#fff",
                                                letterSpacing: "0.02em", padding: 0,
                                            }}
                                        >
                                            {priceType === "MARKET" ? "Market" : "Limit"}
                                            <ChevronDown size={12} />
                                        </button>

                                        {/* Dropdown */}
                                        <AnimatePresence>
                                            {showPriceMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                                    transition={{ duration: 0.13 }}
                                                    style={{
                                                        position: "absolute",
                                                        top: "22px", left: "38px",
                                                        background: "#1e2a3a",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                        borderRadius: "10px",
                                                        overflow: "hidden",
                                                        zIndex: 10,
                                                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                                                        minWidth: "100px",
                                                    }}
                                                >
                                                    {["MARKET", "LIMIT"].map((pt) => (
                                                        <button
                                                            key={pt}
                                                            onClick={() => {
                                                                setPriceType(pt);
                                                                if (pt == "LIMIT") {
                                                                    setLimitPrice(livePrice.toFixed(2));
                                                                }
                                                                setShowPriceMenu(false);
                                                            }}
                                                            style={{
                                                                display: "block", width: "100%",
                                                                padding: "9px 14px", textAlign: "left",
                                                                fontSize: "12px", fontWeight: 700,
                                                                color: priceType === pt ? accent : "#9ca3af",
                                                                background: priceType === pt ? accentSoft : "transparent",
                                                                border: "none", cursor: "pointer",
                                                                transition: "all 0.12s",
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
                                        onKeyDown={handlePriceKey}
                                        value={priceType === "MARKET" ? Number(livePrice).toFixed(2) : limitPrice}
                                        onClick={() => {
                                            if (priceType === "MARKET") {
                                                setPriceType("LIMIT");
                                                setLimitPrice("");
                                            }
                                        }}
                                        onChange={(e) => priceType === "LIMIT" && setLimitPrice(e.target.value)}
                                        readOnly={priceType === "MARKET"}
                                        placeholder="0.00"
                                        style={{
                                            ...inputStyle,
                                            color: priceType === "MARKET" ? "#6b7280" : "#fff",
                                            cursor: priceType === "MARKET" ? "not-allowed" : "text",
                                        }}
                                    />
                                </div>
                            </motion.div>

                            {/* ── Order summary ── */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.16 }}
                                style={{
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    background: accentSoft,
                                    border: `1px solid ${accentBorder}`,
                                    marginBottom: "16px",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>Order value</span>
                                    <motion.span
                                        key={total}
                                        initial={{ opacity: 0, scale: 0.88 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 420 }}
                                        style={{ fontSize: "20px", fontWeight: 900, color: accent, letterSpacing: "-0.03em" }}
                                    >
                                        ${total}
                                    </motion.span>
                                </div>



                                {/* Validation warning */}
                                {!isBuy && parsedQty > maxSell && maxSell > 0 && (
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: "5px",
                                        marginTop: "8px", fontSize: "11px", color: "#f97316", fontWeight: 600,
                                    }}>
                                        <AlertCircle size={11} />
                                        Exceeds your holding of {maxSell} shares
                                    </div>
                                )}
                            </motion.div>

                            {/* ── Submit ── */}
                            <motion.button
                                whileHover={!loading && !confirmed ? {
                                    scale: 1.02,
                                    background: accentHover,
                                } : {}}
                                whileTap={!loading && !confirmed ? { scale: 0.97 } : {}}
                                onClick={!loading && !confirmed ? handleConfirm : undefined}
                                style={{
                                    width: "100%", height: 50, borderRadius: "12px", border: "none",
                                    cursor: loading || confirmed ? "default" : "pointer",
                                    background: confirmed ? "#059669" : accent,
                                    color: "#fff",
                                    fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    boxShadow: isBuy
                                        ? "0 4px 20px rgba(16,185,129,0.35)"
                                        : "0 4px 20px rgba(239,68,68,0.35)",
                                    opacity: loading ? 0.85 : 1,
                                    transition: "background 0.18s, opacity 0.18s",
                                    position: "relative", overflow: "hidden",
                                }}
                            >
                                {/* shimmer */}
                                <motion.div
                                    style={{
                                        position: "absolute", top: 0, left: "-80%",
                                        width: "40%", height: "100%", pointerEvents: "none",
                                        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",
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
                                                animation: "trSpin 0.7s linear infinite",
                                            }}
                                        />
                                    )}
                                    {confirmed && (
                                        <motion.div key="ok"
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 450 }}
                                        >
                                            ✓ Order Placed!
                                        </motion.div>
                                    )}
                                    {!loading && !confirmed && (
                                        <motion.div key="idle"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            style={{ display: "flex", alignItems: "center", gap: "7px" }}
                                        >
                                            <Zap size={15} fill="white" strokeWidth={0} />
                                            {activeMode} {holding?.symbol}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <div style={{
                                textAlign: "center", marginTop: "10px",
                                fontSize: "10px", color: "#374151", fontWeight: 500,
                            }}>
                                {priceType === "MARKET"
                                    ? "Market orders execute at best available price"
                                    : `Limit order executes at $${limitPrice || "—"} or better`}
                            </div>
                        </div>

                        {/* close button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                position: "absolute", top: "14px", right: "14px",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "50%", width: 28, height: 28,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "#6b7280",
                                zIndex: 10,
                            }}
                        >
                            <X size={13} />
                        </motion.button>

                        <style>{`@keyframes trSpin { to { transform: rotate(360deg); } }`}</style>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}