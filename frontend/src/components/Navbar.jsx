import { motion } from "framer-motion";
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import UserMenu from "./UserMenu.jsx";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 z-[1100] backdrop-blur-md bg-slate-950/50 border-2 border-slate-900">
            <div className="max-w-7xl mx-auto px-6 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                        {/* Back */}
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-amber-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button className="text-xl font-bold tracking-tight" onClick={() => navigate('/stocks', { state: { tab: 'explore' } })}>
                            <span className="text-amber-200">Stock</span>
                            <span className="text-white">Vista</span>
                        </button>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4">
                        <div className="w-[300px]">
                            <SearchBar onSelect={(symbol) => navigate(`/stock/${symbol}`)} />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 text-gray-400 hover:text-amber-200 transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                        </motion.button>

                        <div className="p-3 text-gray-400 hover:text-amber-200 transition-colors">
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}