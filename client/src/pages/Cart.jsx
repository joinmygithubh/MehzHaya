import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag, FiX } from "react-icons/fi";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import api from "../api/axios";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
} from "../redux/slices/cartSlice";
import { formatPrice } from "../utils/helpers";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, coupon, summary } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [code, setCode] = useState("");

  const restoreToken = searchParams.get("restore");

  useEffect(() => {
    if (restoreToken) {
      (async () => {
        try {
          const { data } = await api.get(`/cart/restore/${restoreToken}`);
          toast.success(data.message || "Your cart has been restored!");
          dispatch(fetchCart());
        } catch (err) {
          toast.error("Cart restoration link expired or invalid.");
        }
      })();
    }
  }, [restoreToken, dispatch]);

  const handleQty = (itemId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleRemove = async (itemId) => {
    await dispatch(removeCartItem(itemId));
    toast.success("Item removed");
  };

  const handleCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const res = await dispatch(applyCoupon(code.trim()));
    if (applyCoupon.fulfilled.match(res)) {
      toast.success(res.payload.message);
      setCode("");
    } else toast.error(res.payload || "Invalid coupon");
  };

  const checkout = () => {
    if (!isAuthenticated) return navigate("/login");
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container-px py-20 text-center">
        <SEO title="Cart" />
        <FiShoppingBag className="mx-auto text-6xl text-gold/60" />
        <h1 className="mt-4 font-serif text-3xl font-semibold text-espresso">
          Your cart is empty
        </h1>
        <p className="mt-2 text-taupe">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary mt-6">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO title="Shopping Cart" />
      <div className="container-px py-6">
        <Breadcrumb items={[{ label: "Cart" }]} />
        <h1 className="mt-4 font-serif text-3xl font-semibold text-espresso">
          Shopping Cart ({summary.totalItems})
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item._id} className="card flex gap-4 p-4 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-28 w-24 shrink-0 rounded-xl object-cover bg-champagne"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-serif text-base font-semibold text-espresso">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-taupe hover:text-terracotta transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-taupe">
                      {item.color && `Color: ${item.color}`}
                      {item.size && ` · Size: ${item.size}`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-xl border border-sand bg-ivory">
                      <button onClick={() => handleQty(item._id, item.quantity - 1)} className="p-2 text-espresso hover:text-gold">
                        <FiMinus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-espresso">{item.quantity}</span>
                      <button onClick={() => handleQty(item._id, item.quantity + 1)} className="p-2 text-espresso hover:text-gold">
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <span className="text-lg font-semibold text-espresso">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit lg:sticky lg:top-28">
            <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
              <h2 className="mb-4 font-serif text-xl font-semibold text-espresso">
                Order Summary
              </h2>

              {/* Coupon */}
              {coupon?.code ? (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-blush/60 border border-sand/70 p-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-espresso">
                    <FiTag className="text-gold" /> {coupon.code} applied
                  </span>
                  <button
                    onClick={() => dispatch(removeCoupon())}
                    className="text-taupe hover:text-terracotta"
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCoupon} className="mb-4 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="input py-2 text-sm"
                  />
                  <button type="submit" className="btn-outline whitespace-nowrap px-4 py-2 text-sm">
                    Apply
                  </button>
                </form>
              )}

              <div className="space-y-2.5 border-t border-sand/60 pt-4 text-sm">
                <Row label="Subtotal" value={formatPrice(summary.itemsPrice)} />
                {summary.discount > 0 && (
                  <Row label="Discount" value={`- ${formatPrice(summary.discount)}`} green />
                )}
                <Row
                  label="Shipping"
                  value={summary.shippingPrice === 0 ? "FREE" : formatPrice(summary.shippingPrice)}
                />
                <div className="flex justify-between border-t border-sand/60 pt-3 text-lg font-bold text-espresso">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(summary.totalPrice)}</span>
                </div>
              </div>

              <button onClick={checkout} className="btn-primary mt-6 w-full">
                Proceed to Checkout
              </button>
              <Link
                to="/shop"
                className="mt-3 block text-center text-sm font-semibold text-gold hover:underline"
              >
                Continue Shopping
              </Link>

              <p className="mt-4 text-center text-xs text-taupe">
                💡 Try codes: WELCOME10, FESTIVE25, MEHZ200
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Row = ({ label, value, green }) => (
  <div className="flex justify-between">
    <span className="text-taupe">{label}</span>
    <span className={green ? "text-sage font-semibold" : "text-espresso font-medium"}>
      {value}
    </span>
  </div>
);

export default Cart;
