
import React from 'react';
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Smartphone } from "lucide-react";

function OpenAccount() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    return (
        <section ref={ref} className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-300/30 rounded-3xl overflow-hidden"
                >


                    <div className="relative grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-16">
                        {/* Left Content */}
                        <div className="text-white">
                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-white mb-6 text-xl"
                            >
                                Start Your Investment Journey Today
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-xl text-slate-300 mb-8"
                            >
                                Open your free account in minutes and get access to zero brokerage trading, IPOs, mutual funds, and more.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group px-8 py-4 bg-gradient-to-r from-amber-200 to-slate-600 text-white rounded-full hover:shadow-2xl hover:shadow-amber-200/50 transition-all flex items-center justify-center gap-2"
                                >
                                    Get Started Free
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.div>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 border-2 border-slate-600 text-white rounded-full flex items-center justify-center gap-2"
                                >
                                    <Smartphone className="w-5 h-5" />
                                    Download App
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="mt-8 flex items-center gap-4 text-slate-300 flex-wrap"
                            >
                                {["No hidden charges", "Instant verification", "24/7 support"].map((text, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="text-sm"
                                    >
                                        ✓ {text}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right Content - Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            className="relative"
                        >
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1646153114001-495dfb56506d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2NTY2MTAyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                    alt="Mobile App"
                                    className="rounded-2xl shadow-2xl border border-slate-700"
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default OpenAccount;