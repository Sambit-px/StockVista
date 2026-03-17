import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { TrendingUp, PieChart, BarChart3, Rocket, Shield, Zap } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Zero Brokerage",
        description: "Trade stocks with absolutely zero brokerage charges. Keep 100% of your profits.",
        color: "from-amber-400 to-orange-500",
    },
    {
        icon: TrendingUp,
        title: "Stocks Trading",
        description: "Access to 5000+ stocks across NSE and BSE with real-time market data.",
        color: "from-emerald-400 to-teal-500",
    },
    {
        icon: PieChart,
        title: "Mutual Funds",
        description: "Invest in 2000+ mutual funds from top AMCs with SIP starting at ₹100.",
        color: "from-teal-400 to-cyan-500",
    },
    {
        icon: BarChart3,
        title: "F&O Trading",
        description: "Trade futures and options with advanced charting tools and analytics.",
        color: "from-blue-400 to-indigo-500",
    },
    {
        icon: Rocket,
        title: "IPO Access",
        description: "Apply to upcoming IPOs directly from the app with seamless UPI integration.",
        color: "from-violet-400 to-purple-500",
    },
    {
        icon: Shield,
        title: "Bonds & NCDs",
        description: "Diversify your portfolio with government and corporate bonds.",
        color: "from-slate-400 to-slate-600",
    },
];


function Features() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <div id="features" ref={ref} className="py-24 bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="mb-4 text-xl font-medium text-slate-900">
                        Everything You Need to{" "}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Invest Smart
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        StockVista provides all the tools and features you need for successful investing in one powerful platform.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.02,
                                    transition: { duration: 0.3 }
                                }}
                                className="group relative bg-white rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 ease-in-out border border-slate-200"
                            >
                                {/* Icon */}
                                <div
                                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}
                                >
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="mb-3 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-600">{feature.description}</p>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity transition-colors pointer-events-none" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
export default Features;