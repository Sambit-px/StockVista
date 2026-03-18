import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function SearchBar({ onSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Fetch search results
    useEffect(() => {
        if (!query.trim()) return setResults([]);

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API}/search`, {
                    params: { q: query },
                });
                setResults(res.data.slice(0, 5)); // top 5
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchData, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <>
            {expanded && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1200]"
                    onClick={() => setExpanded(false)}
                />
            )}

            <div className="relative z-[1300] flex justify-center">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setExpanded(true)}
                    placeholder="Search stocks..."
                    className={`pl-4 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-[#fee685] focus:border-[#fee685]
            text-white placeholder:text-slate-400 text-lg relative z-[1301]
            transition-all duration-500 ease-out origin-center
            ${expanded ? "w-[400px]" : "w-64"}`}
                />

                {/* Dropdown */}
                {expanded && query.trim().length > 0 && (
                    <ul className="absolute top-full left-0 bg-slate-900 border border-slate-700 w-full mt-2 rounded-md max-h-60 overflow-y-auto z-[1301] shadow-lg">
                        {loading ? (
                            <li className="flex justify-center items-center py-4">
                                <div className="w-6 h-6 border-4 border-t-[#fee685] border-slate-700 rounded-full animate-spin"></div>
                            </li>
                        ) : results.length > 0 ? (
                            results.map((item, index) => (
                                <li
                                    key={`${item.symbol}-${index}`}
                                    className="px-4 py-2 cursor-pointer hover:bg-slate-700/50 text-white transition-colors duration-150"
                                    onMouseDown={() => {
                                        onSelect(item.symbol);
                                        setQuery("");
                                        setResults([]);
                                        setExpanded(false);
                                    }}
                                    style={{
                                        opacity: 0,
                                        animation: `fadeIn 0.3s forwards ${index * 0.07}s`
                                    }}
                                >
                                    {item.symbol} - {item.name || item.description}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-slate-400">No results</li>
                        )}
                    </ul>
                )}
            </div>

            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>
        </>
    );
}