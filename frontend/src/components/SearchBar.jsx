// SearchBar.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function SearchBar({ onSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [closing, setClosing] = useState(false);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            setExpanded(false);
            setQuery("");
            setResults([]);
        }, 200);
    };

    useEffect(() => {
        if (!query.trim()) return setResults([]);
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API}/search`, { params: { q: query } });
                setResults(res.data.slice(0, 5));
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        };
        const debounce = setTimeout(fetchData, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const showDropdown = expanded && query.trim().length > 0;

    const overlay = (
        <>
            {/* Backdrop — portaled to body */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-lg z-[1200]"
                style={{ animation: `${closing ? "fadeOut" : "fadeIn"} 0.2s ease forwards` }}
                onClick={handleClose}
            />

            {/* Spotlight panel — portaled to body, centered on screen */}
            <div className="fixed inset-0 flex items-center justify-center z-[1300] pointer-events-none">
                <div
                    className="pointer-events-auto flex flex-col overflow-hidden bg-slate-900 rounded-2xl w-[480px]"
                    style={{
                        transformOrigin: "center center",
                        animation: `${closing ? "panelOut 0.2s ease-in forwards" : "panelIn 0.25s cubic-bezier(0.22,1,0.36,1) forwards"}`,
                        border: "1.5px solid rgb(254 243 199)",
                        boxShadow: "0 0 24px 4px rgb(254 243 199), 0 24px 100px rgb(254 243 199)",
                    }}
                >
                    <div className="flex items-center gap-3 px-4 py-3">
                        <svg className="w-4 h-4 text-[#fee685] shrink-0 opacity-70" viewBox="0 0 20 20" fill="none">
                            <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Escape" && handleClose()}
                            placeholder="Search stocks..."
                            className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-slate-400 text-lg"
                        />
                        {loading && (
                            <div className="w-4 h-4 border-2 border-slate-700 rounded-full animate-spin shrink-0" />
                        )}
                    </div>

                    {showDropdown && (
                        <div className="border-2 border-slate-700/50 py-1 max-h-64 overflow-y-auto">
                            {!loading && results.length > 0 ? (
                                results.map((item, index) => (
                                    <div
                                        key={`${item.symbol}-${index}`}
                                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 text-white transition-colors"
                                        style={{ opacity: 0, animation: `fadeInUp 0.2s ease forwards ${index * 0.05}s` }}
                                        onMouseDown={() => { onSelect(item.symbol); handleClose(); }}
                                    >
                                        <span className="text-[#fee685] font-mono text-sm font-medium w-16 shrink-0">{item.symbol}</span>
                                        <span className="text-slate-300 text-sm truncate">{item.name || item.description}</span>
                                    </div>
                                ))
                            ) : !loading ? (
                                <div className="px-4 py-3 text-slate-400 text-sm">No results</div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes panelIn {
                    from { opacity: 0; transform: scale(0.92); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes panelOut {
                    from { opacity: 1; transform: scale(1); }
                    to   { opacity: 0; transform: scale(0.92); }
                }
                @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );

    return (
        <>
            {/* Trigger pill — always visible in the navbar */}
            <div
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 border-2 border-slate-700 rounded-xl cursor-text text-slate-400 text-base"
                onClick={() => setExpanded(true)}
            >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Search stocks...
            </div>

            {/* Portal: renders backdrop + panel directly into document.body */}
            {expanded && createPortal(overlay, document.body)}
        </>
    );
}