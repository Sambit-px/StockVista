import { motion } from "motion/react";
import {
    TrendingUp,
    BarChart3,
    PieChart,
    ArrowRight,
    Sparkles,
    Target,
    Shield,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";



function Home() {
    const Navigate = useNavigate();
    const location = useLocation(); // ← capture navigation state

    const sections = [
        {
            id: "stocks",
            title: "Stocks",
            description: "Trade in equity markets with real-time data and zero brokerage",
            icon: TrendingUp,
            gradient: "slate-900",
            stats: [
                { label: "NSE/BSE", value: "5000+" },
                { label: "Sectors", value: "50+" },
            ],
            features: ["Real-time quotes", "Advanced charts", "Market insights"],
        },
        {
            id: "fno",
            title: "F&O",
            description: "Futures & Options trading with advanced analytics and strategies",
            icon: BarChart3,
            gradient: "slate-900",
            stats: [
                { label: "Contracts", value: "1000+" },
                { label: "Strategies", value: "25+" },
            ],
            features: ["Option chain", "Strategy builder", "Risk analyzer"],
        },
        {
            id: "MutualFunds",
            title: "Mutual Funds",
            description: "Invest in mutual funds with zero commission and smart recommendations",
            icon: PieChart,
            gradient: "slate-900",
            stats: [
                { label: "Funds", value: "2500+" },
                { label: "AMCs", value: "40+" },
            ],
            features: ["SIP automation", "Tax planning", "Fund comparison"],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-600 to-slate-800">
            {/* Header */}
            <div className=" text-white">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl font-bold mb-2">Welcome to <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-slate-100 bg-clip-text text-transparent">StockVista</span></h1>
                        <p className="text-lg text-slate-400">
                            Your all-in-one trading platform
                        </p>
                    </motion.div>
                </div>
            </div>



            {/* Main Sections */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-3xl font-bold text-slate-200 mb-8"
                >
                    Choose Your Trading Platform
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 * index + 0.4 }}
                            whileHover={{
                                scale: 1.02,
                                y: -4,
                                boxShadow: "0px 0px 50px rgb(255,236,179)"
                            }}
                            onClick={() => Navigate(`/${section.id}`)}
                            className="rounded-3xl shadow-xl overflow-hidden cursor-pointer backdrop-blur-xl hover:shadow-2xl hover:shadow-amber-50 transition-shadow duration-500 ease-in-out"
                        >
                            {/* Gradient Header */}

                            <div
                                className={`bg-${section.gradient} p-6 text-white`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <section.icon className="h-12 w-12" />
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className="bg-white/20 p-2 rounded-full"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </motion.div>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {section.description}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 p-6 bg-slate-900">
                                {section.stats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="text-2xl font-bold text-slate-100">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Features */}
                            <div className="p-6 bg-slate-900">
                                <h4 className="text-sm font-semibold text-slate-50 mb-3">
                                    Key Features
                                </h4>
                                <ul className="space-y-2">
                                    {section.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="list-disc list-inside items-center gap-2 text-sm text-slate-400"
                                        >
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            < div className="px-6 pb-6 bg-slate-900" >
                                <button className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold" onClick={() => Navigate(`/${section.id}`)}>
                                    Start Trading
                                </button>
                            </div>

                        </motion.div>
                    ))}
                </div>
            </div >

            {/* Zero Brokerage Banner */}
            < motion.div
                initial={{ opacity: 0 }
                }
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="max-w-7xl mx-auto px-6 pb-20"
            >
                <div className="bg-slate-900 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-3xl font-bold mb-2">
                        Zero Brokerage Charges
                    </h3>
                    <p className="text-lg opacity-90">
                        Trade freely without worrying about extra costs
                    </p>
                </div>
            </motion.div >
        </div >
    );
}

export default Home;