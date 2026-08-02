import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiHeart, FiTrash2, FiShoppingBag } from "react-icons/fi";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import RatingStars from "../components/common/RatingStars";
import {
  fetchWishlist,
  removeFromWishlist,
  moveToCart,
} from "../redux/slices/wishlistSlice";
import { fetchCart } from "../redux/slices/cartSlice";
import { formatPrice, finalPrice, productImage } from "../utils/helpers";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((s) => s.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleMove = async (id) => {
    const res = await dispatch(moveToCart(id));
    if (moveToCart.fulfilled.match(res)) {
      dispatch(fetchCart());
      toast.success("Moved to cart");
    } else toast.error(res.payload || "Could not move to cart");
  };

  const handleRemove = async (id) => {
    await dispatch(removeFromWishlist(id));
    toast.success("Removed from wishlist");
  };

  if (products.length === 0) {
    return (
      <div className="container-px py-20 text-center">
        <SEO title="Wishlist" />
        <FiHeart className="mx-auto text-6xl text-gold/60" />
        <h1 className="mt-4 font-serif text-3xl font-semibold text-espresso">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-taupe">Save your favourite items for later.</p>
        <Link to="/shop" className="btn-primary mt-6">
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO title="Wishlist" />
      <div className="container-px py-6">
        <Breadcrumb items={[{ label: "Wishlist" }]} />
        <h1 className="mt-4 font-serif text-3xl font-semibold text-espresso">
          My Wishlist ({products.length})
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p._id} className="card flex gap-4 p-4 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
              <Link to={`/product/${p.slug}`} className="shrink-0">
                <img
                  src={productImage(p)}
                  alt={p.name}
                  className="h-32 w-28 rounded-xl object-cover bg-champagne"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    to={`/product/${p.slug}`}
                    className="font-serif text-base font-semibold text-espresso hover:text-gold transition-colors"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-1">
                    <RatingStars value={p.ratings} count={p.numReviews} size={12} />
                  </div>
                  <p className="mt-1 text-lg font-semibold text-espresso">
                    {formatPrice(finalPrice(p))}
                  </p>
                  {p.stock <= 0 && (
                    <p className="text-xs font-semibold text-terracotta">Out of stock</p>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleMove(p._id)}
                    disabled={p.stock <= 0}
                    className="btn-primary flex-1 px-3 py-2 text-xs"
                  >
                    <FiShoppingBag size={14} /> Move to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(p._id)}
                    className="btn-outline px-3 py-2"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
