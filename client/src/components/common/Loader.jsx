const Loader = ({ full = false }) => (
  <div
    className={`flex flex-col items-center justify-center gap-5 ${
      full ? "min-h-[60vh]" : "py-16"
    }`}
  >
    {full && (
      <img
        src="/logo.jpg"
        alt="MehzHaya"
        className="h-20 w-20 animate-float rounded-2xl object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    )}
    <div className="relative h-14 w-14">
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-900/20 border-t-gold" />
    </div>
  </div>
);

export default Loader;
