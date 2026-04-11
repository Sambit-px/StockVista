import { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL;

// ─── showToast ────────────────────────────────────────────────────────────────

export const showToast = {
    success: (msg, opts) => toast.success(msg, opts),
    error: (msg, opts) => toast.error(msg, opts),
    warning: (msg, opts) => toast.warning(msg, opts),
    info: (msg, opts) => toast.info(msg, opts),
};

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Shared input wrapper ─────────────────────────────────────────────────────

function InputField({ icon: Icon, accentColor = "slate", ...props }) {
    const hoverGlow = accentColor === "amber" ? "bg-amber-500" : "bg-slate-500";
    const hoverBorder = accentColor === "amber" ? "amber-500/30" : "slate-500/30";
    const hoverIcon = accentColor === "amber" ? "text-amber-400" : "text-slate-400";

    return (
        <div className="relative group">
            <div className={`absolute -inset-1 ${hoverGlow} rounded-xl opacity-5 group-hover:opacity-60 group-focus-within:opacity-30 transition-all duration-500 blur-lg`} />
            <div className={`relative bg-[#111723] rounded-xl flex items-center p-1 border-2 border-white/10 group-hover:border-2 group-hover:border-${hoverBorder} transition-all duration-300`}>
                <Icon className={`w-5 h-5 text-gray-500 ml-3 group-hover:${hoverIcon} transition-colors`} />
                <input
                    className="w-full bg-transparent px-3 py-3 text-white focus:outline-none placeholder-gray-600"
                    {...props}
                />
            </div>
        </div>
    );
}

// ─── LoginForm ────────────────────────────────────────────────────────────────

export function LoginForm({ onSwitch, onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { showToast.error("Enter your email and password."); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) { showToast.error(data?.error || "Login failed. Please try again."); return; }
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            showToast.success("Terminal unlocked. Welcome back.");
            onLogin(data.user);
        } catch {
            showToast.error("Network error. Check your connection.", { duration: 6000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-2xl border-2 border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-[0_0_80px_rgba(148,163,184,0.2)] relative before:absolute before:inset-0 before:rounded-[2.5rem] before:p-[1px] before:bg-gradient-to-br before:from-slate-200/30 before:via-slate-900 before:to-slate-950 before:-z-10"
        >
            <motion.div variants={itemVariants} style={{ transform: "translateZ(60px)" }}>
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-2xl">
                    Welcome{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-200 cursor-pointer" onClick={() => navigate(-1)}>
                        Back
                    </span>
                </h2>
                <p className="text-emerald-100/60 font-medium">Initialize your trading terminal.</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5" style={{ transform: "translateZ(40px)" }}>
                <motion.div variants={itemVariants}>
                    <InputField icon={Mail} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <InputField icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </motion.div>
                <motion.button
                    type="submit" variants={itemVariants} disabled={loading}
                    style={{ transform: "translateZ(20px)" }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="w-full py-3 mt-4 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            Authenticating...
                        </>
                    ) : (
                        <> Access Terminal <ArrowRight className="w-5 h-5" /> </>
                    )}
                </motion.button>
            </form>

            <div className="text-center pb-4" style={{ transform: "translateZ(50px)" }}>
                <p className="text-sm text-gray-400 flex flex-col gap-2 items-center justify-center">
                    <span>
                        New to StockVista?{" "}
                        <button onClick={onSwitch} className="text-amber-400 font-semibold hover:text-amber-300 transition-colors underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-400">
                            Create Account
                        </button>
                    </span>
                    <span className="text-xs text-gray-500 italic mt-2">Pull the center lamp to switch</span>
                </p>
            </div>
        </motion.div>
    );
}

// ─── RegisterForm ─────────────────────────────────────────────────────────────

export function RegisterForm({ onSwitch }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) { showToast.error("Please fill in all fields."); return; }
        if (password.length < 8) { showToast.warning("Password must be at least 8 characters."); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) { showToast.error(data?.error || "Registration failed. Please try again."); return; }
            showToast.success("Account created. Redirecting to login...");
            setTimeout(() => onSwitch(), 1500);
        } catch {
            showToast.error("Network error. Check your connection.", { duration: 6000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full bg-[#0a0e17]/80 backdrop-blur-2xl border-2 border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-[0_0_80px_rgba(253,230,138,0.15)] relative before:absolute before:inset-0 before:rounded-[2.5rem] before:p-[1px] before:bg-gradient-to-br before:from-amber-200/30 before:via-slate-900 before:to-slate-950 before:-z-10">
            <div style={{ transform: "translateZ(60px)" }} className="mt-4">
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-2xl">
                    Join <span className="text-transparent bg-clip-text bg-white">Vista</span>
                </h2>
                <p className="text-amber-100/60 font-medium">Start trading with zero fees.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" style={{ transform: "translateZ(40px)" }}>
                <InputField icon={User} accentColor="amber" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <InputField icon={Mail} accentColor="amber" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <InputField icon={Lock} accentColor="amber" type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button
                    type="submit" disabled={loading}
                    className="w-full py-3 mt-4 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transform transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            Creating...
                        </>
                    ) : "Create Account"}
                </button>
            </form>

            <div className="text-center pb-4" style={{ transform: "translateZ(50px)" }}>
                <p className="text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
                    <span>
                        Already registered?{" "}
                        <button onClick={onSwitch} className="text-amber-400 font-semibold hover:text-amber-300 transition-colors underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-400">
                            Sign In
                        </button>
                    </span>
                    <span className="text-xs text-gray-500 italic mt-2">Pull the center lamp to switch</span>
                </p>
            </div>
        </div>
    );
}

// ─── Add once in App.jsx ──────────────────────────────────────────────────────
//
//  import { Toaster } from "sonner";
//
//  <Toaster
//      position="bottom-right"
//      theme="dark"
//      toastOptions={{
//          style: {
//              background: "rgba(15, 23, 42, 0.85)",
//              border: "1px solid rgba(100, 116, 139, 0.25)",
//              backdropFilter: "blur(12px)",
//              color: "#cbd5e1",
//              fontSize: "13px",
//              borderRadius: "12px",
//          },
//      }}
//  />