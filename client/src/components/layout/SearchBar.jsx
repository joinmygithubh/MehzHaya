import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { formatPrice, finalPrice, productImage } from "../../utils/helpers";

const SearchBar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else {
      setQuery("");
      setSuggestions([]);
    }
  }, [open]);

  // debounced live search
  const fetchSuggestions = useCallback(async (q) => {
    if (q.trim().length < 2) return setSuggestions([]);
    setLoading(true);
    try {
      const res = await api.get("/products/suggestions", { params: { keyword: q } });
      setSuggestions(res.data.suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(t);
  }, [query, fetchSuggestions]);

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?keyword=${encodeURIComponent(query)}`);
    onClose();
  };

  const goToProduct = (slug) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed inset-x-0 top-0 z-50 bg-white p-4 shadow-soft dark:bg-emerald-950 sm:p-6"
          >
            <div className="container-px mx-auto max-w-3xl">
              <form onSubmit={submit} className="flex items-center gap-3">
                <FiSearch className="text-gold" size={22} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hijabs, abayas, accessories..."
                  className="flex-1 bg-transparent text-lg outline-none"
                />
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gold">
                  <FiX size={24} />
                </button>
              </form>

              {query.length >= 2 && (
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  {loading && <p className="py-4 text-center text-sm text-gray-400">Searching…</p>}
                  {!loading && suggestions.length === 0 && (
                    <p className="py-4 text-center text-sm text-gray-400">
                      No products found for "{query}"
                    </p>
                  )}
                  {suggestions.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => goToProduct(s.slug)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-beige-light dark:hover:bg-emerald-900"
                    >
                      <img
                        src={productImage(s)}
                        alt={s.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-gold-dark">
                          {formatPrice(finalPrice(s))}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
