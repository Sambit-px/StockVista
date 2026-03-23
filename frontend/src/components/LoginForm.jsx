import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, LightbulbOff } from "lucide-react";

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

export function LoginForm({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Enter email and password");
            return;
        }

        setLoading(true);

        try {
            // Call backend login API
            const response = await fetch("http://localhost:3002/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Login failed");
                setLoading(false);
                return;
            }

            // Save tokens in localStorage or state
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            // Pass user info to parent (App)
            onLogin(data.user);

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
            className="flex flex-col w-full relative"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8" style={{ transform: "translateZ(60px)" }}>
                <h2 className="text-4xl font-bold text-amber-500 mb-2 tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    Welcome Back
                </h2>
                <p className="text-slate-400 text-sm font-medium">Access your portal to continue.</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" >
                <motion.div variants={itemVariants} className="space-y-1.5" style={{ transform: "translateZ(40px)" }}>
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-widest">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors duration-300" />
                        <input
                            type="email"
                            placeholder="user@system.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 focus:bg-slate-800/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5" style={{ transform: "translateZ(40px)" }}>
                    <label className="text-xs font-bold text-slate-400 ml-1 tracking-widest">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors duration-300" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 focus:bg-slate-800/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                    </div>

                    <div className="flex justify-end mt-2">
                        <a href="#" className="text-xs text-amber-500/70 hover:text-amber-400 transition-colors hover:underline underline-offset-4">
                            Forgot password?
                        </a>
                    </div>
                </motion.div>

                <motion.button
                    type="submit"
                    variants={itemVariants}
                    style={{ transform: "translateZ(50px)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-amber-600/90 backdrop-blur-md text-slate-950 font-bold rounded-2xl py-3.5 mt-6 flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)] transition-all"
                >
                    {loading ? "Authenticating..." : "Authenticate"}
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </form>
        </motion.div>
    );
}