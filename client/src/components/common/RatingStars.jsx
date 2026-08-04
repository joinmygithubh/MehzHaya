import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const RatingStars = ({ value = 0, size = 14, count, showScore = true }) => {
  const numValue = Number(value) || 0;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (numValue >= i) stars.push(<FaStar key={i} className="text-gold" size={size} />);
    else if (numValue >= i - 0.5)
      stars.push(<FaStarHalfAlt key={i} className="text-gold" size={size} />);
    else stars.push(<FaRegStar key={i} className="text-gold/40" size={size} />);
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5">{stars}</span>
      {numValue > 0 && showScore && (
        <span className="text-xs font-semibold text-espresso">{numValue.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-xs text-taupe font-medium">
          ({count})
        </span>
      )}
    </span>
  );
};

export default RatingStars;
