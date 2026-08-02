import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const RatingStars = ({ value = 0, size = 14, count }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push(<FaStar key={i} className="text-gold" size={size} />);
    else if (value >= i - 0.5)
      stars.push(<FaStarHalfAlt key={i} className="text-gold" size={size} />);
    else stars.push(<FaRegStar key={i} className="text-gold/40" size={size} />);
  }
  return (
    <span className="inline-flex items-center gap-0.5">
      {stars}
      {count !== undefined && (
        <span className="ml-1 text-xs text-taupe">
          ({count})
        </span>
      )}
    </span>
  );
};

export default RatingStars;
