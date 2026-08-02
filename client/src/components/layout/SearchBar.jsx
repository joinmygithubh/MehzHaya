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
            className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-xs"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed inset-x-0 top-0 z-50 bg-ivory border-b border-sand p-4 shadow-soft sm:p-6"
          >
            <div className="container-px mx-auto max-w-3xl">
              <form onSubmit={submit} className="flex items-center gap-3">
                <FiSearch className="text-gold" size={22} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hijabs, abayas, accessories..."
                  className="flex-1 bg-transparent text-lg text-espresso placeholder:text-taupe/60 outline-none font-sans"
                />
                <button type="button" onClick={onClose} className="text-taupe hover:text-gold">
                  <FiX size={24} />
                </button>
              </form>

              {query.length >= 2 && (
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  {loading && <p className="py-4 text-center text-sm text-taupe">Searching…</p>}
                  {!loading && suggestions.length === 0 && (
                    <p className="py-4 text-center text-sm text-taupe">
                      No products found for "{query}"
                    </p>
                  )}
                  {suggestions.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => goToProduct(s.slug)}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-champagne/60"
                    >
                      <img
                        src={productImage(s)}
                        alt={s.name}
                        className="h-12 w-12 rounded-lg bg-champagne object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-espresso">{s.name}</p>
                        <p className="text-xs text-gold font-semibold">
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
