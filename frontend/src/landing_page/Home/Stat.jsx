import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";

const stats = [
    { value: 5, suffix: "M+", label: "Happy Investors" },
    { value: 500, suffix: "Cr+", label: "Daily Trading Volume" },
    { value: 0, suffix: "%", label: "Brokerage Fee" },
    { value: 99.9, suffix: "%", label: "Uptime Guarantee" },
];

function AnimatedNumber({ value, suffix }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [isInView, value]);

    return (
        <span ref={ref}>
            {value === 99.9 ? count.toFixed(1) : Math.floor(count)}
            {suffix}
        </span>
    );
}

function Stats() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    return (
        <section
            ref={ref}
            className="py-24 bg-slate-800"
        >

            <div className="relative max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-white mb-4">Trusted by Millions</h2>
                    <p className="text-xl text-slate-300">
                        Join India's fastest-growing investment platform
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="text-center relative group"
                        >
                            <div className="text-5xl font-bold bg-gradient-to-r from-amber-200 to-slate-400 bg-clip-text text-transparent mb-2">
                                <AnimatedNumber
                                    value={stat.value}
                                    suffix={stat.suffix}
                                />
                            </div>

                            <p className="text-slate-300">{stat.label}</p>

                            <div className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-amber-300 to-slate-300 group-hover:w-full group-hover:left-0 transition-all duration-500 rounded-full" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Stats;