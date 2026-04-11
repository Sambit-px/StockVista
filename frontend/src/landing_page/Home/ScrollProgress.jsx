import { motion, useScroll, useSpring } from "motion/react";

function ScrollProgress() {
    const { scrollYProgress } = useScroll();

    return (
        <>

            {/* Scroll indicator */}
            <motion.div
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-slate-900 backdrop-blur-lg border-2 border-amber-300/30 flex items-center justify-center z-40 cursor-pointer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
                <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="text-amber-400"
                >
                    <motion.circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                            pathLength: scrollYProgress,
                        }}
                    />
                    <motion.path
                        d="M12 8L12 16M12 8L9 11M12 8L15 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 180 }}
                    />
                </motion.svg>
            </motion.div>
        </>
    );
}

export default ScrollProgress;