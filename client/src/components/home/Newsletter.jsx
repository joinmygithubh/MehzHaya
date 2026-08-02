import { useState } from "react";
import { toast } from "react-toastify";
import { FiSend } from "react-icons/fi";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing! 💚");
    setEmail("");
  };

  return (
    <div className="border-b border-sand bg-champagne">
      <div className="container-px flex flex-col items-center gap-6 py-10 text-center lg:flex-row lg:justify-between lg:text-left">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-gold">
            Join the MehzHaya Family
          </h3>
          <p className="mt-1 text-sm text-taupe">
            Subscribe for exclusive offers, new arrivals & styling tips.
          </p>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-md gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 rounded-xl border border-sand bg-ivory px-5 py-3 text-sm text-espresso outline-none placeholder:text-taupe/60 focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            <FiSend /> Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
