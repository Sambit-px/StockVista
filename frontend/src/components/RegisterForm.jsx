import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Lightbulb } from "lucide-react";

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

export function RegisterForm({ onRegister }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            alert("Fill all fields");
            return;
        }

        onRegister({ name, email, password });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col w-full relative z-20"
        >
            <motion.div
                variants={itemVariants}
                className="mb-6"
                style={{ transform: "translateZ(60px)" }}
            >
                <h2 className="text-4xl font-bold text-yellow-400 mb-2 tracking-tight drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                    Join System
                </h2>
                <p className="text-slate-300 text-sm font-medium">
                    Initialize your secure connection.
                </p>
            </motion.div>

            <form
                className="space-y-4"
                onSubmit={handleSubmit}
            >
                <motion.div
                    variants={itemVariants}
                    className="space-y-1.5"
                    style={{ transform: "translateZ(40px)" }}
                >
                    <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">
                        Full Name
                    </label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-yellow-400 transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-800/80 backdrop-blur-xl border border-slate-600 rounded-2xl py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 focus:bg-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-300"
                        />
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="space-y-1.5"
                    style={{ transform: "translateZ(40px)" }}
                >
                    <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">
                        Email
                    </label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-yellow-400 transition-colors duration-300" />
                        <input
                            type="email"
                            placeholder="newuser@system.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800/80 backdrop-blur-xl border border-slate-600 rounded-2xl py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 focus:bg-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-300"
                        />
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="space-y-1.5"
                    style={{ transform: "translateZ(40px)" }}
                >
                    <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">
                        Password
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-yellow-400 transition-colors duration-300" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800/80 backdrop-blur-xl border border-slate-600 rounded-2xl py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 focus:bg-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-300"
                        />
                    </div>
                </motion.div>

                <motion.button
                    variants={itemVariants}
                    style={{ transform: "translateZ(50px)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-yellow-500/90 backdrop-blur-md text-slate-950 font-bold rounded-2xl py-3.5 mt-6 flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(250,204,21,0.4)] transition-all"
                >
                    Initialize Account
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </form>

            <motion.div
                variants={itemVariants}
                className="mt-8 text-center text-sm text-slate-400 font-medium"
                style={{ transform: "translateZ(30px)" }}
            >
                Already registered?{" "}
                <span className="text-yellow-400 font-bold inline-flex items-center gap-1.5 ml-1">
                    <Lightbulb className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    Turn off the lamp
                </span>
            </motion.div>
        </motion.div>
    );
}