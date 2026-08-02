import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiMapPin, FiCreditCard, FiCheck, FiTruck, FiPlus } from "react-icons/fi";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import api from "../api/axios";
import { fetchCart } from "../redux/slices/cartSlice";
import { loadUser } from "../redux/slices/authSlice";
import { loadRazorpayScript } from "../utils/razorpay";
import { formatPrice } from "../utils/helpers";
import { STORE } from "../utils/constants";

const steps = ["Shipping", "Payment", "Review"];

const emptyAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, summary } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(emptyAddress);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [useNew, setUseNew] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (user?.addresses?.length) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddr(def._id);
    } else {
      setUseNew(true);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="container-px py-20 text-center">
        <SEO title="Checkout" />
        <p className="font-serif text-2xl font-semibold text-espresso">
          Your cart is empty
        </p>
        <button onClick={() => navigate("/shop")} className="btn-primary mt-6">
          Shop Now
        </button>
      </div>
    );
  }

  const getShippingAddress = () => {
    if (useNew) return address;
    const addr = user.addresses.find((a) => a._id === selectedAddr);
    return addr || address;
  };

  const validateAddress = (a) =>
    a.fullName && a.phone && a.line1 && a.city && a.state && a.postalCode;

  const next = () => {
    if (step === 0 && !validateAddress(getShippingAddress())) {
      return toast.error("Please fill in all required shipping fields");
    }
    setStep((s) => Math.min(2, s + 1));
  };

  const placeOrder = async () => {
    const shippingAddress = getShippingAddress();
    setPlacing(true);
    try {
      if (paymentMethod === "COD") {
        const { data } = await api.post("/orders", {
          shippingAddress,
          paymentMethod: "COD",
        });
        await dispatch(fetchCart());
        toast.success("Order placed successfully!");
        navigate(`/order-success/${data.order._id}`);
        return;
      }

      // Razorpay flow
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load Razorpay. Check your connection.");

      const { data: keyData } = await api.get("/payment/key");
      const { data: orderData } = await api.post("/payment/order", {
        amount: summary.totalPrice,
      });

      const options = {
        key: keyData.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: STORE.name,
        description: STORE.tagline,
        order_id: orderData.order.id,
        prefill: {
          name: shippingAddress.fullName,
          email: user.email,
          contact: shippingAddress.phone,
        },
        theme: { color: "#B8935A" },
        handler: async (response) => {
          try {
            await api.post("/payment/verify", response);
            const { data } = await api.post("/orders", {
              shippingAddress,
              paymentMethod: "Razorpay",
              paymentInfo: response,
            });
            await dispatch(fetchCart());
            toast.success("Payment successful! Order placed.");
            navigate(`/order-success/${data.order._id}`);
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (paymentMethod === "COD") setPlacing(false);
    }
  };

  const field = (key) => (e) => setAddress({ ...address, [key]: e.target.value });
  const shipping = getShippingAddress();

  return (
    <>
      <SEO title="Checkout" />
      <div className="container-px py-6">
        <Breadcrumb items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />

        {/* Steps */}
        <div className="mx-auto mt-6 flex max-w-xl items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                    i <= step ? "bg-gold text-espresso shadow-xs" : "bg-sand/40 text-taupe"
                  }`}
                >
                  {i < step ? <FiCheck /> : i + 1}
                </div>
                <span className={`mt-1 text-xs font-medium ${i <= step ? "text-espresso" : "text-taupe"}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-gold" : "bg-sand/40"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-espresso">
                  <FiMapPin className="text-gold" /> Shipping Address
                </h2>

                {user?.addresses?.length > 0 && !useNew && (
                  <div className="mb-4 space-y-3">
                    {user.addresses.map((a) => (
                      <label
                        key={a._id}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                          selectedAddr === a._id ? "border-gold bg-champagne/50 shadow-xs" : "border-sand/70 bg-ivory"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={selectedAddr === a._id}
                          onChange={() => setSelectedAddr(a._id)}
                          className="mt-1 accent-[#B8935A]"
                        />
                        <div className="text-sm">
                          <p className="font-semibold text-espresso">{a.fullName} · {a.phone}</p>
                          <p className="text-taupe">
                            {a.line1}, {a.line2 && `${a.line2}, `}{a.city}, {a.state} – {a.postalCode}
                          </p>
                        </div>
                      </label>
                    ))}
                    <button onClick={() => setUseNew(true)} className="flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
                      <FiPlus /> Add a new address
                    </button>
                  </div>
                )}

                {useNew && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full Name *" value={address.fullName} onChange={field("fullName")} />
                    <Input label="Phone *" value={address.phone} onChange={field("phone")} />
                    <div className="sm:col-span-2">
                      <Input label="Address Line 1 *" value={address.line1} onChange={field("line1")} />
                    </div>
                    <div className="sm:col-span-2">
                      <Input label="Address Line 2" value={address.line2} onChange={field("line2")} />
                    </div>
                    <Input label="City *" value={address.city} onChange={field("city")} />
                    <Input label="State *" value={address.state} onChange={field("state")} />
                    <Input label="Postal Code *" value={address.postalCode} onChange={field("postalCode")} />
                    <Input label="Country" value={address.country} onChange={field("country")} />
                    {user?.addresses?.length > 0 && (
                      <button onClick={() => setUseNew(false)} className="text-left text-sm font-semibold text-gold hover:underline">
                        Use a saved address instead
                      </button>
                    )}
                  </div>
                )}

                <button onClick={next} className="btn-primary mt-6 w-full">
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-espresso">
                  <FiCreditCard className="text-gold" /> Payment Method
                </h2>
                <div className="space-y-3">
                  <PayOption
                    selected={paymentMethod === "Razorpay"}
                    onClick={() => setPaymentMethod("Razorpay")}
                    icon={<FiCreditCard />}
                    title="Pay Online (Razorpay)"
                    desc="Cards, UPI, NetBanking, Wallets · Test Mode"
                  />
                  <PayOption
                    selected={paymentMethod === "COD"}
                    onClick={() => setPaymentMethod("COD")}
                    icon={<FiTruck />}
                    title="Cash on Delivery"
                    desc="Pay with cash when your order arrives"
                  />
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-outline flex-1">
                    Back
                  </button>
                  <button onClick={next} className="btn-primary flex-1">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
                <h2 className="mb-4 font-serif text-xl font-semibold text-espresso">
                  Review Your Order
                </h2>

                <div className="mb-4 rounded-xl bg-ivory border border-sand/70 p-4 text-sm">
                  <p className="font-semibold text-espresso">Ship to:</p>
                  <p className="text-taupe mt-1">
                    {shipping.fullName}, {shipping.phone}
                    <br />
                    {shipping.line1}, {shipping.line2 && `${shipping.line2}, `}
                    {shipping.city}, {shipping.state} – {shipping.postalCode}
                  </p>
                  <p className="mt-2 font-semibold text-espresso">Payment: <span className="font-normal text-taupe">{paymentMethod}</span></p>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-14 w-12 rounded-lg object-cover bg-champagne" />
                      <div className="flex-1 text-sm">
                        <p className="font-serif font-semibold text-espresso">{item.name}</p>
                        <p className="text-taupe text-xs">
                          Qty: {item.quantity}
                          {item.color && ` · ${item.color}`}
                          {item.size && ` · ${item.size}`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-espresso">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1">
                    Back
                  </button>
                  <button onClick={placeOrder} disabled={placing} className="btn-primary flex-1">
                    {placing ? "Processing..." : paymentMethod === "COD" ? "Place Order" : `Pay ${formatPrice(summary.totalPrice)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="h-fit lg:sticky lg:top-28">
            <div className="card p-6 bg-champagne/60 border border-sand/70 rounded-xl shadow-soft">
              <h2 className="mb-4 font-serif text-xl font-semibold text-espresso">
                Order Summary
              </h2>
              <div className="space-y-2.5 text-sm">
                <Row label={`Subtotal (${summary.totalItems} items)`} value={formatPrice(summary.itemsPrice)} />
                {summary.discount > 0 && <Row label="Discount" value={`- ${formatPrice(summary.discount)}`} green />}
                <Row label="Shipping" value={summary.shippingPrice === 0 ? "FREE" : formatPrice(summary.shippingPrice)} />
                <div className="flex justify-between border-t border-sand/60 pt-3 text-lg font-bold text-espresso">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(summary.totalPrice)}</span>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-taupe">
                📞 Need help? Call {STORE.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

const Row = ({ label, value, green }) => (
  <div className="flex justify-between">
    <span className="text-taupe">{label}</span>
    <span className={green ? "text-sage font-semibold" : "text-espresso font-medium"}>{value}</span>
  </div>
);

const PayOption = ({ selected, onClick, icon, title, desc }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
      selected ? "border-gold bg-champagne/50 shadow-xs" : "border-sand/70 bg-ivory"
    }`}
  >
    <span className="text-xl text-gold">{icon}</span>
    <div className="flex-1">
      <p className="font-serif font-semibold text-espresso">{title}</p>
      <p className="text-xs text-taupe">{desc}</p>
    </div>
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
        selected ? "border-gold bg-gold text-espresso font-bold" : "border-sand"
      }`}
    >
      {selected && <FiCheck size={12} />}
    </span>
  </button>
);

export default Checkout;
