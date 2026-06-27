import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiFilter, FiGrid, FiList } from "react-icons/fi";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import ProductGrid from "../components/product/ProductGrid";
import FilterSidebar from "../components/shop/FilterSidebar";
import { fetchProducts } from "../redux/slices/productSlice";
import { SORT_OPTIONS } from "../utils/constants";

const emptyFilters = {
  keyword: "",
  group: "",
  category: "",
  color: "",
  material: "",
  rating: "",
  minPrice: "",
  maxPrice: "",
  availability: "",
  isFeatured: "",
  isNewArrival: "",
  isTrending: "",
  isFlashSale: "",
};

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading, totalProducts, totalPages, currentPage } = useSelector(
    (s) => s.products
  );

  const [filters, setFilters] = useState({ ...emptyFilters });
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  // Hydrate filters from URL on mount / param change
  useEffect(() => {
    const next = { ...emptyFilters };
    for (const key of Object.keys(emptyFilters)) {
      if (searchParams.get(key)) next[key] = searchParams.get(key);
    }
    setFilters(next);
    if (searchParams.get("sort")) setSort(searchParams.get("sort"));
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const buildParams = useCallback(
    (pageNum) => {
      const params = { page: pageNum, limit: 12, sort };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      return params;
    },
    [filters, sort]
  );

  // Fetch on filter/sort change (reset to page 1)
  useEffect(() => {
    dispatch(fetchProducts({ ...buildParams(1), append: false }));
    setPage(1);
  }, [dispatch, buildParams]);

  // Infinite scroll
  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          const nextPage = page + 1;
          dispatch(fetchProducts({ ...buildParams(nextPage), append: true }));
          setPage(nextPage);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [dispatch, page, totalPages, loading, buildParams]);

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    // group & category are mutually exclusive-ish: clear category if group changes
    if (key === "group") params.delete("category");
    setSearchParams(params);
  };

  const handleSort = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const heading =
    filters.category || filters.group || filters.keyword || "All Products";

  return (
    <>
      <SEO title={heading} />
      <div className="container-px py-6">
        <Breadcrumb items={[{ label: "Shop", to: "/shop" }, { label: heading }]} />

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          {/* Sidebar (desktop) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterSidebar
              filters={filters}
              setFilter={setFilter}
              clearFilters={clearFilters}
            />
          </aside>

          {/* Main */}
          <div className="flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-3xl font-semibold text-emerald-900 dark:text-gold">
                  {heading}
                </h1>
                <p className="text-sm text-gray-500">
                  {totalProducts} products found
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="btn-outline px-4 py-2 text-sm lg:hidden"
                >
                  <FiFilter /> Filters
                </button>

                <select
                  value={sort}
                  onChange={(e) => handleSort(e.target.value)}
                  className="input w-auto py-2"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <div className="hidden items-center gap-1 rounded-lg border border-gray-300 p-1 sm:flex">
                  <button
                    onClick={() => setView("grid")}
                    className={`rounded p-1.5 ${view === "grid" ? "bg-emerald-900 text-gold" : ""}`}
                  >
                    <FiGrid size={18} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`rounded p-1.5 ${view === "list" ? "bg-emerald-900 text-gold" : ""}`}
                  >
                    <FiList size={18} />
                  </button>
                </div>
              </div>
            </div>

            <ProductGrid products={items} loading={loading} view={view} />

            {/* Infinite scroll sentinel */}
            <div ref={loaderRef} className="h-10" />
            {page >= totalPages && items.length > 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                You've reached the end ✦
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-5 dark:bg-emerald-950">
            <FilterSidebar
              filters={filters}
              setFilter={setFilter}
              clearFilters={clearFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Shop;
