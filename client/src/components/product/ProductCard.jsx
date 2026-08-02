import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { formatPrice, finalPrice, productImage } from "../../utils/helpers";
import RatingStars from "../common/RatingStars";
import { toggleWishlist } from "../../redux/slices/wishlistSlice";
import { addToCart } from "../../redux/slices/cartSlice";

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { ids } = useSelector((s) => s.wishlist);
  const wished = ids.includes(product._id);
  const price = finalPrice(product);
  const outOfStock = product.stock <= 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.info("Please log in to use your wishlist");
    const res = await dispatch(toggleWishlist(product._id));
    if (toggleWishlist.fulfilled.match(res)) toast.success(res.payload.message);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.info("Please log in to add items to cart");
    if (outOfStock) return;
    const res = await dispatch(
      addToCart({ productId: product._id, quantity: 1 })
    );
    if (addToCart.fulfilled.match(res)) toast.success("Added to cart");
    else toast.error(res.payload || "Could not add to cart");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      className="group card overflow-hidden bg-champagne/40 border border-sand/70 rounded-xl shadow-soft hover:shadow-gold transition-all duration-300"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-champagne/60">
          <img
            src={productImage(product)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
            {product.discount > 0 && (
              <span className="rounded-full border border-terracotta bg-ivory/95 px-2.5 py-0.5 text-[10px] font-semibold text-terracotta uppercase tracking-wider shadow-xs">
                -{product.discount}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="rounded-full border border-gold bg-ivory/95 px-2.5 py-0.5 text-[10px] font-semibold text-espresso uppercase tracking-wider shadow-xs">
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-full border border-gold bg-gold/90 px-2.5 py-0.5 text-[10px] font-semibold text-espresso uppercase tracking-wider shadow-xs">
                BESTSELLER
              </span>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-espresso/40 backdrop-blur-xs z-20">
              <span className="rounded-full border border-sand bg-ivory px-4 py-1 text-xs font-semibold text-terracotta shadow-soft">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className="absolute right-3 top-3 rounded-full border border-sand/60 bg-ivory/95 p-2 text-espresso shadow-soft transition hover:scale-110 hover:text-terracotta z-10"
          >
            {wished ? <FaHeart className="text-terracotta" /> : <FiHeart />}
          </button>

          {/* Quick add */}
          {!outOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute inset-x-3 bottom-3 flex translate-y-4 items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-sm font-semibold text-espresso opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-gold-dark hover:text-ivory z-10"
            >
              <FiShoppingBag size={16} /> Add to Cart
            </button>
          )}
        </div>

        <div className="p-4">
          <p className="eyebrow text-[10px]">
            {product.categoryName}
          </p>
          <h3 className="mt-1 line-clamp-1 font-serif text-base font-semibold text-espresso transition-colors group-hover:text-gold-deep">
            {product.name}
          </h3>
          <div className="mt-1.5">
            <RatingStars value={product.ratings} count={product.numReviews} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base sm:text-lg font-semibold text-espresso">
              {formatPrice(price)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs sm:text-sm text-taupe line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
