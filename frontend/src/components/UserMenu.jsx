import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, ClipboardList, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("accessToken"); // check login

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/auth");
    };

    return (
        <div className="relative" ref={menuRef}>
            <motion.button onClick={() => setOpen(!open)}>
                <User className="h-5 w-5" />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={menuVariants}
                        className="absolute right-0 mt-2 w-40 bg-slate-900 rounded-xl shadow-lg z-[9999]"
                    >
                        {isLoggedIn ? (
                            <>
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        navigate("/allorders");
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-700 rounded-xl flex items-center gap-2 text-slate-200"
                                >
                                    <ClipboardList className="h-4 w-4" />
                                    All Orders
                                </button>

                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-700 rounded-xl flex items-center gap-2 text-red-400"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    navigate("/auth"); // go to login page
                                }}
                                className="w-full px-4 py-2 hover:bg-slate-700 rounded-xl flex items-center gap-2 text-green-400"
                            >
                                <LogIn className="h-4 w-4" />
                                Login
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}