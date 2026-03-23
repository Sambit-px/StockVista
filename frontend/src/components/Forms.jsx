import { useState } from "react";
import { Mail, Lock, User, Github, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: {
        opacity: 0,
        transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

export function LoginForm({ onSwitch, onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return alert("Enter email and password");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3002/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Login failed");
                setLoading(false);
                return;
            }

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            onLogin(data.user); // send user data to parent
            setLoading(false);
        } catch (err) {
            console.error("Login error:", err);
            alert("An error occurred during login");
            setLoading(false);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-2xl border-2 border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-[0_0_80px_rgba(245,158,11,0.15)] relative before:absolute before:inset-0 before:rounded-[2.5rem] before:p-[1px] before:bg-gradient-to-br before:from-slate-200/30 before:via-slate-900 before:to-slate-950 before:-z-10"
        >
            {/* Header */}
            <motion.div variants={itemVariants} style={{ transform: "translateZ(60px)" }}>
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-2xl">
                    Welcome{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Back
                    </span>
                </h2>
                <p className="text-emerald-100/60 font-medium">Initialize your trading terminal.</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" style={{ transform: "translateZ(40px)" }}>
                <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute -inset-1 bg-slate-500 rounded-xl opacity-5 group-hover:opacity-60 group-focus-within:opacity-30 transition-all duration-500 blur-lg"></div>
                    <div className="relative bg-[#111723] rounded-xl flex items-center p-1 border-2 border-white/10 group-hover:border-2 group-hover:border-slate-500/30 transition-all duration-300">
                        <Mail className="w-5 h-5 text-gray-500 ml-3 group-hover:text-slate-400 transition-colors" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-transparent px-3 py-3 text-white focus:outline-none placeholder-gray-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute -inset-1 bg-slate-500 rounded-xl opacity-5 group-hover:opacity-60 group-focus-within:opacity-30 transition-all duration-500 blur-lg"></div>
                    <div className="relative bg-[#111723] rounded-xl flex items-center p-1 border-2 border-white/10 group-hover:border-2 group-hover:border-slate-500/30 transition-all duration-300">
                        <Lock className="w-5 h-5 text-gray-500 ml-3 group-hover:text-slate-400 transition-colors" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-transparent px-3 py-3 text-white focus:outline-none placeholder-gray-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </motion.div>

                <motion.button
                    type="submit"
                    variants={itemVariants}
                    style={{ transform: "translateZ(20px)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 mt-4 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                    {loading ? "Authenticating..." : "Access Terminal"}
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </form>

            {/* Switch to Register */}
            <div className="text-center pb-4" style={{ transform: "translateZ(50px)" }}>
                <p className="text-sm text-gray-400 flex flex-col gap-2 items-center justify-center">
                    <span>
                        New to StockVista?{" "}
                        <button
                            onClick={onSwitch}
                            className="text-amber-400 font-semibold hover:text-amber-300 transition-colors underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-400"
                        >
                            Create Account
                        </button>
                    </span>
                    <span className="text-xs text-gray-500 italic mt-2">Pull the center lamp to switch</span>
                </p>
            </div>
        </motion.div>
    );
}

export function RegisterForm({ onSwitch }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) return alert("Fill all fields");

        setLoading(true);

        try {
            const res = await fetch("http://localhost:3002/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                // Show backend error clearly
                const errMsg = data?.error || "Registration failed";
                alert(errMsg);
                setLoading(false);
                return;
            }

            alert("✅ Registration successful! Logging you in...");
            setLoading(false);

            // Optionally, auto-switch to login
            setTimeout(() => onSwitch(), 1500);

        } catch (err) {
            console.error("Registration error:", err);
            alert("An error occurred during registration");
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full bg-[#0a0e17]/80 backdrop-blur-2xl border-2 border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-[0_0_80px_rgba(99,102,241,0.15)] relative before:absolute before:inset-0 before:rounded-[2.5rem] before:p-[1px] before:bg-gradient-to-br before:from-amber-200/30 before:via-slate-900 before:to-slate-950 before:-z-10">
            {/* Header */}
            <div style={{ transform: "translateZ(60px)" }} className="mt-4">
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-2xl">
                    Join <span className="text-transparent bg-clip-text bg-white">Vista</span>
                </h2>
                <p className="text-amber-100/60 font-medium">Start trading with zero fees.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" style={{ transform: "translateZ(40px)" }}>
                {/* Name */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-amber-500 rounded-xl opacity-5 group-hover:opacity-60 group-focus-within:opacity-30 transition-all duration-500 blur-lg"></div>
                    <div className="relative bg-[#111723] rounded-xl flex items-center p-1 border-2 border-white/10 group-hover:border-2 group-hover:border-amber-500/30 transition-all duration-300">
                        <User className="w-5 h-5 text-gray-500 ml-3 group-hover:text-amber-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-transparent px-3 py-2.5 text-white focus:outline-none placeholder-gray-600"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-amber-500 rounded-xl opacity-5 group-hover:opacity-60 group-focus-within:opacity-30 transition-all duration-500 blur-lg"></div>
                    <div className="relative bg-[#111723] rounded-xl flex items-center p-1 border-2 border-white/10 group-hover:border-2 group-hover:border-amber-500/30 transition-all duration-300">
                        <Mail className="w-5 h-5 text-gray-500 ml-3 group-hover:text-amber-400 transition-colors" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-transparent px-3 py-3 text-white focus:outline-none placeholder-gray-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-amber-500 rounded-xl opacity-5 group-hover:opacity-60 group-focus-within:opacity-30 transition-all duration-500 blur-lg"></div>
                    <div className="relative bg-[#111723] rounded-xl flex items-center p-1 border-2 border-white/10 group-hover:border-2 group-hover:border-amber-500/30 transition-all duration-300">
                        <Lock className="w-5 h-5 text-gray-500 ml-3 group-hover:text-amber-400 transition-colors" />
                        <input
                            type="password"
                            placeholder="Create Password"
                            className="w-full bg-transparent px-3 py-3 text-white focus:outline-none placeholder-gray-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white rounded-xl font-bold transform transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    {loading ? "Creating..." : "Create Account"}
                </button>
            </form>

            {/* Switch to Login */}
            <div className="text-center pb-4" style={{ transform: "translateZ(50px)" }}>
                <p className="text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
                    <span>
                        Already registered?{" "}
                        <button
                            onClick={onSwitch}
                            className="text-amber-400 font-semibold hover:text-amber-300 transition-colors underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-400"
                        >
                            Sign In
                        </button>
                    </span>
                    <span className="text-xs text-gray-500 italic mt-2">Pull the center lamp to switch</span>
                </p>
            </div>
        </div>
    );
}