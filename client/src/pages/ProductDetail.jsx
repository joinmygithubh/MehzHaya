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
  FiZap,
} from "react-icons/fi";
import { FaHeart, FaWhatsapp } from "react-icons/fa";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import RatingStars from "../components/common/RatingStars";
import Loader from "../components/common/Loader";
import ProductCard from "../components/product/ProductCard";
import Reviews from "../components/product/Reviews";
import ProductImageZoom from "../components/product/ProductImageZoom";
import { fetchProduct } from "../redux/slices/productSlice";
import { addToCart, fetchCart } from "../redux/slices/cartSlice";
import { toggleWishlist } from "../redux/slices/wishlistSlice";
import { addRecentlyViewed } from "../redux/slices/uiSlice";
import { formatPrice, finalPrice, productImage, whatsappLink, buildProductWhatsAppMessage } from "../utils/helpers";
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
      if (product.colors?.length) setColor(product.colors[0]);
      if (product.sizes?.length) setSize(product.sizes[0]);
      setNumReviews(product.numReviews);
      setRatings(product.ratings);
      setQty(1);
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

  const handleBuyNow = async () => {
    if (outOfStock) return;

    const payload = {
      productId: product._id,
      quantity: qty,
      color: color || "",
      size: size || "",
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
          {/* Gallery with Zoom & Fullscreen Lightbox */}
          <ProductImageZoom
            images={product.images || []}
            activeIndex={activeImg}
            onSelectIndex={setActiveImg}
            alt={product.name}
            discount={product.discount}
          />

          {/* Info */}
          <div>
            <p className="eyebrow text-xs">
              {product.categoryName} · {product.group}
            </p>
            <div className="gold-divider my-2" />
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-espresso">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-3">
              <RatingStars value={ratings} count={numReviews} size={16} />
              <span className="text-sm text-sand">·</span>
              <span className="text-sm text-taupe">SKU: {product.sku}</span>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-3xl font-semibold text-espresso">
                {formatPrice(price)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-taupe line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="mb-1 text-sm font-semibold text-sage">
                    Save {formatPrice(product.price - price)}
                  </span>
                </>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-taupe font-sans">
              {product.description}
            </p>

            {/* Material */}
            {product.material && (
              <p className="mt-4 text-sm">
                <span className="font-medium text-espresso font-serif text-base">Material: </span>
                <span className="text-taupe">{product.material}</span>
              </p>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-espresso font-serif text-base">
                  Color: <span className="font-sans text-sm font-normal text-taupe">{color}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      title={c}
                      onClick={() => setColor(c)}
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        color === c ? "border-gold scale-110 shadow-xs" : "border-sand/70"
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
                <p className="mb-2 text-sm font-semibold text-espresso font-serif text-base">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-[3rem] rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        size === s
                          ? "border-gold bg-gold text-espresso font-semibold shadow-xs"
                          : "border-sand text-taupe hover:border-gold hover:text-espresso"
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
                <span className="font-medium text-terracotta">Out of stock</span>
              ) : product.stock < 10 ? (
                <span className="font-medium text-terracotta">
                  Hurry! Only {product.stock} left in stock
                </span>
              ) : (
                <span className="font-medium text-sage">In stock</span>
              )}
            </div>

            {/* Qty + actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center rounded-xl border border-sand bg-ivory">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-3 text-espresso hover:text-gold"
                >
                  <FiMinus />
                </button>
                <span className="w-10 text-center font-semibold text-espresso">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="p-3 text-espresso hover:text-gold"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="btn-primary flex-1 min-w-[130px]"
              >
                <FiShoppingBag /> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 rounded-xl bg-espresso text-ivory font-medium px-5 py-2.5 sm:py-3 text-sm sm:text-base border border-espresso hover:bg-gold hover:border-gold hover:text-espresso transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
              >
                <FiZap /> Buy Now
              </button>

              <button onClick={handleWishlist} className="btn-outline px-4">
                {wished ? <FaHeart className="text-terracotta" /> : <FiHeart />}
              </button>

              <button onClick={handleShare} className="btn-outline px-4">
                <FiShare2 />
              </button>
            </div>

            {/* Book on WhatsApp */}
            <a
              href={whatsappLink(
                buildProductWhatsAppMessage({ product, qty, color, size })
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-semibold text-white shadow-soft transition hover:brightness-95"
            >
              <FaWhatsapp size={20} /> Book on WhatsApp
            </a>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-sand/60 pt-6 text-center">
              {[
                { Icon: FiTruck, t: "Free Shipping", s: "Above ₹999" },
                { Icon: FiRefreshCw, t: "Easy Returns", s: "7 days" },
                { Icon: FiShield, t: "Secure", s: "Payments" },
              ].map(({ Icon, t, s }) => (
                <div key={t} className="flex flex-col items-center gap-1">
                  <Icon className="text-gold" size={22} />
                  <span className="text-xs font-semibold text-espresso">{t}</span>
                  <span className="text-[11px] text-taupe">{s}</span>
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
            <h2 className="section-title mb-2 text-2xl">You May Also Like</h2>
            <div className="gold-divider mb-6" />
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
            <h2 className="section-title mb-2 text-2xl">Recently Viewed</h2>
            <div className="gold-divider mb-6" />
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
