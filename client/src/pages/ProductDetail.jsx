import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiHeart,
  FiShoppingBag,
  FiMinus,
  FiPlus,
  FiShare2,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import { FaHeart, FaWhatsapp } from "react-icons/fa";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import RatingStars from "../components/common/RatingStars";
import Loader from "../components/common/Loader";
import ProductCard from "../components/product/ProductCard";
import Reviews from "../components/product/Reviews";
import { fetchProduct } from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist } from "../redux/slices/wishlistSlice";
import { addRecentlyViewed } from "../redux/slices/uiSlice";
import { formatPrice, finalPrice, productImage, whatsappLink } from "../utils/helpers";
import { COLOR_HEX } from "../utils/constants";

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, related, detailLoading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { ids } = useSelector((s) => s.wishlist);
  const { recentlyViewed } = useSelector((s) => s.ui);

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [ratings, setRatings] = useState(0);
  const [numReviews, setNumReviews] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (product) {
      setActiveImg(0);
      setColor(product.colors?.[0] || "");
      setSize(product.sizes?.[0] || "");
      setQty(1);
      setRatings(product.ratings);
      setNumReviews(product.numReviews);
      dispatch(
        addRecentlyViewed({
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          discount: product.discount,
          images: product.images,
          categoryName: product.categoryName,
          ratings: product.ratings,
          numReviews: product.numReviews,
          stock: product.stock,
        })
      );
    }
  }, [product, dispatch]);

  if (detailLoading || !product) return <Loader full />;

  const wished = ids.includes(product._id);
  const price = finalPrice(product);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart");
      return navigate("/login");
    }
    const res = await dispatch(
      addToCart({ productId: product._id, quantity: qty, color, size })
    );
    if (addToCart.fulfilled.match(res)) toast.success("Added to cart");
    else toast.error(res.payload || "Could not add to cart");
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) return toast.info("Please log in to use your wishlist");
    const res = await dispatch(toggleWishlist(product._id));
    if (toggleWishlist.fulfilled.match(res)) toast.success(res.payload.message);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const recent = recentlyViewed.filter((p) => p._id !== product._id);

  return (
    <>
      <SEO title={product.name} description={product.shortDescription} />
      <div className="container-px py-6">
        <Breadcrumb
          items={[
            { label: "Shop", to: "/shop" },
            { label: product.categoryName, to: `/shop?category=${encodeURIComponent(product.categoryName)}` },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <div className="flex gap-3 overflow-x-auto sm:flex-col">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImg === i ? "border-gold" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <motion.div
              key={activeImg}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="relative flex-1 overflow-hidden rounded-2xl bg-beige"
            >
              <img
                src={productImage(product, activeImg)}
                alt={product.name}
                className="aspect-[3/4] w-full object-cover"
              />
              {product.discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                  -{product.discount}% OFF
                </span>
              )}
            </motion.div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-dark">
              {product.categoryName} · {product.group}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-emerald-900 dark:text-gold sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <RatingStars value={ratings} count={numReviews} size={16} />
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-gray-500">SKU: {product.sku}</span>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-3xl font-bold text-emerald-900 dark:text-gold">
                {formatPrice(price)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="mb-1 text-sm font-semibold text-green-600">
                    Save {formatPrice(product.price - price)}
                  </span>
                </>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-beige-light/80">
              {product.description}
            </p>

            {/* Material */}
            {product.material && (
              <p className="mt-4 text-sm">
                <span className="font-medium text-emerald-900 dark:text-gold">Material: </span>
                {product.material}
              </p>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-emerald-900 dark:text-gold">
                  Color: <span className="text-gray-500">{color}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      title={c}
                      onClick={() => setColor(c)}
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        color === c ? "border-gold scale-110" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: COLOR_HEX[c] || "#ccc" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-emerald-900 dark:text-gold">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm transition ${
                        size === s
                          ? "border-emerald-900 bg-emerald-900 text-gold"
                          : "border-gray-300 text-gray-600 dark:text-beige-light/70"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock counter */}
            <div className="mt-5 text-sm">
              {outOfStock ? (
                <span className="font-medium text-red-500">Out of stock</span>
              ) : product.stock < 10 ? (
                <span className="font-medium text-orange-500">
                  Hurry! Only {product.stock} left in stock
                </span>
              ) : (
                <span className="font-medium text-green-600">In stock</span>
              )}
            </div>

            {/* Qty + actions */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-gray-300">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-3"
                >
                  <FiMinus />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="p-3"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="btn-primary flex-1"
              >
                <FiShoppingBag /> Add to Cart
              </button>

              <button onClick={handleWishlist} className="btn-outline px-4">
                {wished ? <FaHeart className="text-red-500" /> : <FiHeart />}
              </button>

              <button onClick={handleShare} className="btn-outline px-4">
                <FiShare2 />
              </button>
            </div>

            {/* Book on WhatsApp */}
            <a
              href={whatsappLink(
                `Hello MehzHaya! 🌸 I'd like to book "${product.name}" (SKU: ${product.sku})` +
                  `${color ? `, Color: ${color}` : ""}${size ? `, Size: ${size}` : ""}.\n${
                    typeof window !== "undefined" ? window.location.href : ""
                  }`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-medium text-white transition hover:brightness-95"
            >
              <FaWhatsapp size={20} /> Book on WhatsApp
            </a>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-gray-100 pt-6 text-center dark:border-emerald-800">
              {[
                { Icon: FiTruck, t: "Free Shipping", s: "Above ₹999" },
                { Icon: FiRefreshCw, t: "Easy Returns", s: "7 days" },
                { Icon: FiShield, t: "Secure", s: "Payments" },
              ].map(({ Icon, t, s }) => (
                <div key={t} className="flex flex-col items-center gap-1">
                  <Icon className="text-gold" size={22} />
                  <span className="text-xs font-medium">{t}</span>
                  <span className="text-[11px] text-gray-400">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <Reviews
          productId={product._id}
          initialReviews={product.reviews || []}
          onRatingChange={(r, n) => {
            setRatings(r);
            setNumReviews(n);
          }}
        />

        {/* Related */}
        {related?.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title mb-6 text-2xl">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        {recent.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title mb-6 text-2xl">Recently Viewed</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recent.slice(0, 4).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
