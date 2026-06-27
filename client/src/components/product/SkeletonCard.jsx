const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="skeleton aspect-[3/4] w-full" />
    <div className="space-y-2 p-4">
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  </div>
);

export default SkeletonCard;
