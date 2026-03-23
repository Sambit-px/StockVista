import { motion } from "framer-motion";

export function Lamp({ isOn, toggle }) {
    return (
        <div
            className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-[100] origin-top cursor-pointer"
            onClick={toggle}
        >
            <motion.div
                className="flex flex-col items-center origin-top relative z-20"
                animate={{ rotate: isOn ? [0, 2, -1, 1, 0] : [0, -2, 1, -1, 0] }}
                transition={{ duration: 2, ease: "easeInOut" }}
            >
                {/* Sleek Cord */}
                <div className="w-[2px] h-12 sm:h-16 bg-neutral-800 shadow-[0_0_2px_rgba(0,0,0,0.5)]" />

                {/* Lamp Fixture & Shade */}
                <div className="relative flex flex-col items-center">
                    <motion.div
                        className="relative flex flex-col items-center z-10"
                        whileHover={{ y: 2 }}
                        whileTap={{ y: 8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        {/* Top Cap */}
                        <div className="w-3 h-3 bg-neutral-700 rounded-t-sm z-20 shadow-sm" />

                        {/* Dome Shade */}
                        <div className="w-16 sm:w-20 h-8 sm:h-10 bg-[#1a1c23] rounded-t-[2rem] relative z-10 border-b-2 border-neutral-700 shadow-2xl flex justify-center items-end pb-1.5">
                            {/* Inner reflection */}
                            <div
                                className={`absolute bottom-0 w-full h-2 rounded-b-[50%] transition-opacity duration-700 ${isOn
                                    ? "opacity-100 bg-amber-200/40 blur-[2px]"
                                    : "opacity-0"
                                    }`}
                            />

                            {/* Bulb */}
                            <div
                                className={`absolute -bottom-2.5 w-5 h-5 rounded-full transition-all duration-500 ease-out z-0
                ${isOn
                                        ? "bg-amber-100 shadow-[0_0_40px_15px_rgba(253,230,138,0.6)] scale-110"
                                        : "bg-neutral-600 shadow-none scale-100"
                                    }`}
                            />
                        </div>
                    </motion.div>

                    {/* Pull Chain */}
                    <motion.div
                        className="w-[1px] h-16 absolute top-[100%] ml-6 origin-top z-0 bg-neutral-500/80"
                        whileHover={{ scaleY: 1.15 }}
                    >
                        <div className="w-2 h-2 rounded-full absolute -bottom-1 -left-[3.5px] bg-neutral-400 shadow-sm" />
                    </motion.div>
                </div>
            </motion.div>


        </div>
    );
}