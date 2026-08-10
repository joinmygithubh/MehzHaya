import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart, FiShoppingBag, FiZap } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { formatPrice, finalPrice, productImage } from "../../utils/helpers";
import RatingStars from "../common/RatingStars";
import { toggleWishlist } from "../../redux/slices/wishlistSlice";
import { addToCart, fetchCart } from "../../redux/slices/cartSlice";

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (outOfStock) return;

    const payload = {
      productId: product._id,
      quantity: 1,
      color: product.colors?.[0] || "",
      size: product.sizes?.[0] || "",
    };

    if (!isAuthenticated) {
      sessionStorage.setItem("mehzhaya_buy_now", JSON.stringify(payload));
      toast.info("Please log in to complete your purchase");
      return navigate("/login", { state: { from: { pathname: "/checkout" } } });
    }

    try {
      const res = await dispatch(addToCart(payload));
      if (addToCart.fulfilled.match(res)) {
        await dispatch(fetchCart());
        navigate("/checkout");
      } else {
        toast.error(res.payload || "Could not process Buy Now");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
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

          {/* Quick add / Buy Now hover overlay */}
          {!outOfStock && (
            <div className="absolute inset-x-2 bottom-2 z-10 hidden sm:flex gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gold py-2 text-xs font-semibold text-espresso shadow-soft hover:bg-gold-dark hover:text-ivory transition-colors"
              >
                <FiShoppingBag size={14} /> Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-espresso py-2 text-xs font-semibold text-ivory shadow-soft hover:bg-gold hover:text-espresso transition-colors"
              >
                <FiZap size={14} /> Buy Now
              </button>
            </div>
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

          {/* Card footer action buttons (mobile + desktop) */}
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-sand/40">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gold/70 bg-ivory py-1.5 text-xs font-medium text-espresso hover:bg-gold hover:text-espresso transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingBag size={13} /> Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-espresso py-1.5 text-xs font-semibold text-ivory hover:bg-gold hover:text-espresso transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              <FiZap size={13} /> Buy Now
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
