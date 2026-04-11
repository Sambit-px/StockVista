import React from 'react';
import { easeInOut, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Repeat, TrendingUp } from "lucide-react";

function Hero() {
    const Navigate = useNavigate();
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-2/3 -left-2/3 w-full h-full bg-gradient-to-br from-slate-600/50 to-slate-900/10 rounded-full blur-3xl" />
            </div>

            {/* Random Background Dots */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(35)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-yellow-400/30 "
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>
            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:pt-52 px-8 pb-16'>
                <div className='grid lg:grid-cols-2 gap-12 items-center'>
                    {/* Left Content */}
                    <div className="space-y-6">
                        {/* Badge */}
                        <motion.div initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-2 border-slate-600/20 rounded-full">
                            <TrendingUp className='w-5 h-5 text-amber-100' />
                            <span className="text-sm text-amber-100">Zero Brokerage Charges</span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1 initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }} className="text-white text-2xl sm:text-2xl font-bold">
                            Invest Smarter with <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-slate-400 bg-clip-text text-transparent">StockVista</span>
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }} className="text-xl text-slate-300 max-w-xl">
                            Your all-in-one platform for stocks, mutual funds, F&O, IPOs, and bonds. Trade with confidence and zero brokerage fees.
                        </motion.p>
                        <motion.div initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }} className='flex flex-col sm:flex-row gap-4 mt-6'>
                            <motion.button whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }} className='inline-flex items-center justify-center gap-2 px-12 py-3 bg-gradient-to-r from-amber-200/60 to-slate-700 text-white rounded-full hover:shadow-2xl hover:shadow-amber-100/50 transition-all' onClick={() => Navigate('/auth', { state: { register: true } })}>Start Investing
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ArrowRight className='h-5 w-5' />
                                </motion.div>
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} className='inline-flex items-center justify-center gap-2 px-12 py-3 border-2 text-slate-400 border-slate-700 rounded-full hover:border-amber-200 hover:text-amber-100 transition-colors'>Watch Demo</motion.button>
                        </motion.div>
                        {/* Stats */}
                        <motion.div initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }} className="flex items-center gap-8 pt-6">
                            {[
                                { value: "5M+", label: "Active Users" },
                                { value: "₹500Cr+", label: "Daily Volume" },
                                { value: "4.8★", label: "User Rating" },
                            ].map((stat, index) => (
                                <motion.div whileHover={{ scale: 1.05 }} key={index} className="relative">
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-slate-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right Content */}
                    <motion.div initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }} className="relative">
                        {/* Main Image */}
                        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/50">
                            <img
                                src="https://images.unsplash.com/photo-1560221328-12fe60f83ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
                                alt="Stock Trading Platform"
                                className="w-full h-auto"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                        </motion.div>

                        {/* Floating Card */}
                        <motion.div initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                            transition={{
                                opacity: { duration: 0.6, delay: 0.8 },
                                scale: { duration: 0.6, delay: 0.8 },
                                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                            }}
                            whileHover={{ scale: 1.05 }}
                            className="absolute -bottom-6 -left-6 bg-slate-800/90 backdrop-blur-xl border-2 border-amber-50/30 rounded-xl shadow-2xl shadow-amber-100/60 p-6 max-w-xs">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center border-2 border-amber-100/30">
                                    <TrendingUp className="w-6 h-6 text-amber-200" />
                                </div>
                                <div className='grid items-center justify-center'>
                                    <div className="text-sm bg-gradient-to-r from-amber-100 to-slate-500 bg-clip-text text-transparent">Portfolio Growth</div>
                                    <div className="text-2xl font-bold bg-gradient-to-r from-amber-100 to-slate-700 bg-clip-text text-transparent">+24.5%</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}


export default Hero;