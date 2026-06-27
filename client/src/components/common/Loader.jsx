const Loader = ({ full = false }) => (
  <div
    className={`flex items-center justify-center ${
      full ? "min-h-[60vh]" : "py-16"
    }`}
  >
    <div className="relative h-14 w-14">
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-900/20 border-t-gold" />
    </div>
  </div>
);

export default Loader;
