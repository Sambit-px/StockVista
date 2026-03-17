import React from 'react';
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Check } from "lucide-react";

const benefits = [
    "Instant account opening in under 5 minutes",
    "Real-time market data and live streaming",
    "Advanced charting tools with 100+ indicators",
    "24/7 customer support via chat, email, and phone",
    "Secure transactions with bank-grade encryption",
    "Mobile app for iOS and Android",
    "Portfolio analytics and performance tracking",
    "Research reports and expert recommendations",
];

function Benefits() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <div id="benefits" ref={ref} className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                            <img
                                src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBncm93dGh8ZW58MXx8fHwxNzY1NjU4NjkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                alt="Financial Growth"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Floating Stats */}
                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute -top-6 -right-6 bg-white rounded-xl shadow-2xl p-6 border border-slate-200"
                        >
                            <div className="text-sm text-slate-600 mb-1">Savings on Brokerage</div>
                            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                ₹50,000+
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Per Year Average</div>
                        </motion.div>
                    </motion.div>

                    {/* Right - Content */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="mb-6 text-xl font-medium text-slate-900">
                                Why Choose {" "}
                                <span className="font-extrabold bg-sky-800 bg-clip-text text-transparent">
                                    StockVista?
                                </span>
                            </h2>
                            <p className="text-xl text-slate-600 mb-8">
                                Join millions of investors who trust StockVista for their investment journey. Experience seamless trading with cutting-edge technology.
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                                    transition={{ duration: 0.5, delay: index * 0.1, ease: "linear" }}
                                    whileHover={{
                                        x: 10,
                                        scale: 1.05,
                                        transition: { duration: 0.3, ease: "easeInOut" }
                                    }}
                                    className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-gradient-to-r hover:from-amber-200/50 hover:to-sky-100 hover:shadow-lg border border-slate-200 cursor-pointer"
                                >
                                    <div
                                        className="flex-shrink-0 w-6 h-6 bg-sky-800 rounded-full flex items-center justify-center shadow-md"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <p className="text-slate-700">{benefit}</p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="mt-8"
                        >
                            <button className="px-8 py-4 bg-gradient-to-r from-slate-400 to-slate-700 text-white rounded-full hover:shadow-2xl hover:shadow-slate-500/50">
                                Open Free Account
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Benefits;