import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag, FiX } from "react-icons/fi";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import {
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
} from "../redux/slices/cartSlice";
import { formatPrice } from "../utils/helpers";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, coupon, summary } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [code, setCode] = useState("");

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
        <FiShoppingBag className="mx-auto text-6xl text-gold/40" />
        <h1 className="mt-4 font-serif text-3xl text-emerald-900 dark:text-gold">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
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
        <h1 className="mt-4 font-serif text-3xl font-semibold text-emerald-900 dark:text-gold">
          Shopping Cart ({summary.totalItems})
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item._id} className="card flex gap-4 p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-28 w-24 shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-emerald-900 dark:text-beige-light">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.color && `Color: ${item.color}`}
                      {item.size && ` · Size: ${item.size}`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-gray-300">
                      <button onClick={() => handleQty(item._id, item.quantity - 1)} className="p-2">
                        <FiMinus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => handleQty(item._id, item.quantity + 1)} className="p-2">
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <span className="text-lg font-semibold text-emerald-900 dark:text-gold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit lg:sticky lg:top-28">
            <div className="card p-6">
              <h2 className="mb-4 font-serif text-xl font-semibold text-emerald-900 dark:text-gold">
                Order Summary
              </h2>

              {/* Coupon */}
              {coupon?.code ? (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-emerald-900/40">
                  <span className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                    <FiTag /> {coupon.code} applied
                  </span>
                  <button
                    onClick={() => dispatch(removeCoupon())}
                    className="text-gray-400 hover:text-red-500"
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
                    className="input py-2"
                  />
                  <button type="submit" className="btn-outline whitespace-nowrap px-4 py-2 text-sm">
                    Apply
                  </button>
                </form>
              )}

              <div className="space-y-2 border-t border-gray-100 pt-4 text-sm dark:border-emerald-800">
                <Row label="Subtotal" value={formatPrice(summary.itemsPrice)} />
                {summary.discount > 0 && (
                  <Row label="Discount" value={`- ${formatPrice(summary.discount)}`} green />
                )}
                <Row
                  label="Shipping"
                  value={summary.shippingPrice === 0 ? "FREE" : formatPrice(summary.shippingPrice)}
                />
                <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-bold text-emerald-900 dark:border-emerald-800 dark:text-gold">
                  <span>Total</span>
                  <span>{formatPrice(summary.totalPrice)}</span>
                </div>
              </div>

              <button onClick={checkout} className="btn-primary mt-6 w-full">
                Proceed to Checkout
              </button>
              <Link
                to="/shop"
                className="mt-3 block text-center text-sm text-gold-dark hover:underline"
              >
                Continue Shopping
              </Link>

              <p className="mt-4 text-center text-xs text-gray-400">
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
    <span className="text-gray-500 dark:text-beige-light/60">{label}</span>
    <span className={green ? "text-green-600" : "text-emerald-900 dark:text-beige-light"}>
      {value}
    </span>
  </div>
);

export default Cart;
