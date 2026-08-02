import { FiX } from "react-icons/fi";
import { CATEGORY_GROUPS, COLORS, MATERIALS, COLOR_HEX } from "../../utils/constants";

const Section = ({ title, children }) => (
  <div className="border-b border-sand/60 py-4">
    <h4 className="mb-3 font-serif text-base font-semibold text-espresso">{title}</h4>
    {children}
  </div>
);

const FilterSidebar = ({ filters, setFilter, clearFilters, onClose }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between lg:hidden pb-3 border-b border-sand">
        <h3 className="font-serif text-xl font-semibold text-espresso">Filters</h3>
        <button onClick={onClose} className="p-1 text-espresso hover:text-gold">
          <FiX size={22} />
        </button>
      </div>

      <div className="my-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-semibold text-taupe">Refine results</span>
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-gold hover:underline"
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
              className={`text-sm font-semibold transition-colors ${
                filters.group === group ? "text-gold" : "text-espresso hover:text-gold"
              }`}
            >
              {group}
            </button>
            <div className="mt-1.5 space-y-1.5 pl-3">
              {items.map((cat) => (
                <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm text-taupe hover:text-espresso">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === cat}
                    onChange={() => setFilter("category", cat)}
                    className="accent-[#B8935A]"
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
            className="input py-2 text-sm"
          />
          <span className="text-sand font-bold">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilter("maxPrice", e.target.value)}
            className="input py-2 text-sm"
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
                filters.color === c ? "border-gold scale-110 shadow-xs" : "border-sand/70"
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
              className={`rounded-xl border px-3 py-1 text-xs font-medium transition ${
                filters.material === m
                  ? "border-gold bg-gold text-espresso font-semibold shadow-xs"
                  : "border-sand text-taupe hover:border-gold hover:text-espresso"
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
          <label key={r} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-taupe hover:text-espresso">
            <input
              type="radio"
              name="rating"
              checked={Number(filters.rating) === r}
              onChange={() => setFilter("rating", String(r))}
              className="accent-[#B8935A]"
            />
            <span className="text-gold">{"★".repeat(r)}{"☆".repeat(5 - r)}</span>
            <span className="text-taupe">& up</span>
          </label>
        ))}
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-taupe hover:text-espresso">
          <input
            type="checkbox"
            checked={filters.availability === "in"}
            onChange={(e) => setFilter("availability", e.target.checked ? "in" : "")}
            className="accent-[#B8935A]"
          />
          In stock only
        </label>
      </Section>
    </div>
  );
};

export default FilterSidebar;
