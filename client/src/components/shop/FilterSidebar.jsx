import { FiX } from "react-icons/fi";
import { CATEGORY_GROUPS, COLORS, MATERIALS, COLOR_HEX } from "../../utils/constants";

const Section = ({ title, children }) => (
  <div className="border-b border-gray-100 py-4 dark:border-emerald-800">
    <h4 className="mb-3 font-semibold text-emerald-900 dark:text-gold">{title}</h4>
    {children}
  </div>
);

const FilterSidebar = ({ filters, setFilter, clearFilters, onClose }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="font-serif text-xl">Filters</h3>
        <button onClick={onClose} className="p-1">
          <FiX size={22} />
        </button>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">Refine results</span>
        <button
          onClick={clearFilters}
          className="text-xs font-medium text-gold-dark hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Category groups */}
      <Section title="Category">
        {Object.entries(CATEGORY_GROUPS).map(([group, items]) => (
          <div key={group} className="mb-3">
            <button
              onClick={() => setFilter("group", filters.group === group ? "" : group)}
              className={`text-sm font-medium ${
                filters.group === group ? "text-gold" : "text-emerald-900 dark:text-beige-light"
              }`}
            >
              {group}
            </button>
            <div className="mt-1 space-y-1 pl-3">
              {items.map((cat) => (
                <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-beige-light/70">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === cat}
                    onChange={() => setFilter("category", cat)}
                    className="accent-emerald-900"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* Price */}
      <Section title="Price Range (₹)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilter("minPrice", e.target.value)}
            className="input py-2"
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilter("maxPrice", e.target.value)}
            className="input py-2"
          />
        </div>
      </Section>

      {/* Colors */}
      <Section title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => setFilter("color", filters.color === c ? "" : c)}
              className={`h-7 w-7 rounded-full border-2 transition ${
                filters.color === c ? "border-gold scale-110" : "border-gray-200"
              }`}
              style={{ backgroundColor: COLOR_HEX[c] }}
            />
          ))}
        </div>
      </Section>

      {/* Material */}
      <Section title="Material">
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((m) => (
            <button
              key={m}
              onClick={() => setFilter("material", filters.material === m ? "" : m)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                filters.material === m
                  ? "border-emerald-900 bg-emerald-900 text-gold"
                  : "border-gray-300 text-gray-600 dark:text-beige-light/70"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Section>

      {/* Rating */}
      <Section title="Rating">
        {[4, 3, 2, 1].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input
              type="radio"
              name="rating"
              checked={Number(filters.rating) === r}
              onChange={() => setFilter("rating", String(r))}
              className="accent-emerald-900"
            />
            <span className="text-gold">{"★".repeat(r)}{"☆".repeat(5 - r)}</span>
            <span className="text-gray-500">& up</span>
          </label>
        ))}
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={filters.availability === "in"}
            onChange={(e) => setFilter("availability", e.target.checked ? "in" : "")}
            className="accent-emerald-900"
          />
          In stock only
        </label>
      </Section>
    </div>
  );
};

export default FilterSidebar;
