import { useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const Navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();
    const backgroundColor = useTransform(
        scrollY,
        [0, 100],
        ["rgba(15, 23, 42, 0.5)", "rgba(15, 23, 42, 0.98)"]
    );
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ backgroundColor }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-slate-800"
        >

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-amber-200 to-amber-50 bg-clip-text text-transparent">
                            StockVista
                        </span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {["Features", "Benefits", "Pricing", "About"].map((item, index) => (
                            <motion.a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-slate-300 hover:text-amber-400 transition-colors relative"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -2 }}
                            >
                                {item}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                                    initial={{ scaleX: 0 }}
                                    whileHover={{ scaleX: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.a>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => Navigate('/auth')}
                            className="px-4 py-2 text-slate-300 hover:text-amber-400 transition-colors"
                        >
                            Login
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(254, 243, 199, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => Navigate('/auth', { state: { register: true } })}
                            className="px-6 py-2 bg-gradient-to-r from-amber-200/80 to-slate-600 text-white rounded-full"
                        >
                            Get Started
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-300"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </motion.button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden py-4 border-t border-slate-800"
                    >
                        <nav className="flex flex-col gap-4">
                            {["Features", "Benefits", "Pricing", "About"].map((item, index) => (
                                <motion.a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-slate-300 hover:text-amber-400"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    {item}
                                </motion.a>
                            ))}
                            <button className="px-4 py-2 text-slate-300 hover:text-amber-400 transition-colors text-left">
                                Login
                            </button>
                            <button
                                onClick={() => Navigate('/auth', { state: { register: true } })}
                                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
                            >
                                Get Started
                            </button>
                        </nav>
                    </motion.div>
                )}
            </div>
            <motion.div
                className="fixed bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-600 to-slate-200 origin-left z-[9999]"
                style={{ scaleX }}
            />
        </motion.header>
    );
}

export default Navbar;