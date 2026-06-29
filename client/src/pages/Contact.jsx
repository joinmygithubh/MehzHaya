import { useState } from "react";
import { toast } from "react-toastify";
import { FiPhone, FiMapPin, FiMail, FiClock, FiSend } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import SEO from "../components/common/SEO";
import Breadcrumb from "../components/common/Breadcrumb";
import { STORE } from "../utils/constants";
import { whatsappLink } from "../utils/helpers";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you shortly. 💚");
    setForm({ name: "", email: "", message: "" });
  };

  const info = [
    {
      Icon: FiMapPin,
      title: "Visit Us",
      lines: [
        STORE.address.line1,
        `${STORE.address.city}, ${STORE.address.state} – ${STORE.address.pincode}`,
      ],
    },
    { Icon: FiPhone, title: "Call Us", lines: [STORE.phone], href: `tel:${STORE.phone}` },
    {
      Icon: FaWhatsapp,
      title: "Book on WhatsApp",
      lines: [STORE.phone],
      href: whatsappLink("Hello MehzHaya! 🌸 I'd like to book / enquire about your products."),
      external: true,
    },
    { Icon: FiMail, title: "Email Us", lines: [STORE.email], href: `mailto:${STORE.email}` },
    { Icon: FiClock, title: "Working Hours", lines: ["Mon – Sat: 10am – 8pm", "Sunday: Closed"] },
  ];

  return (
    <>
      <SEO title="Contact Us" description="Get in touch with MehzHaya" />
      <div className="container-px py-6">
        <Breadcrumb items={[{ label: "Contact" }]} />

        <div className="mt-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">
            We'd love to hear from you
          </p>
          <h1 className="section-title mt-1">Get in Touch</h1>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {info.map(({ Icon, title, lines, href, external }) => (
            <div key={title} className="card p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900 text-gold">
                <Icon size={24} />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-emerald-900 dark:text-gold">
                {title}
              </h3>
              {lines.map((l, i) =>
                href ? (
                  <a
                    key={i}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="mt-1 block text-sm text-gray-600 hover:text-gold dark:text-beige-light/70"
                  >
                    {l}
                  </a>
                ) : (
                  <p key={i} className="mt-1 text-sm text-gray-600 dark:text-beige-light/70">
                    {l}
                  </p>
                )
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="card p-8">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900 dark:text-gold">
              Send us a Message
            </h2>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                <FiSend /> Send Message
              </button>
            </form>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl shadow-soft">
            <iframe
              title="MehzHaya location"
              src="https://maps.google.com/maps?q=Faridabad%20Haryana&t=&z=12&ie=UTF8&iwloc=&output=embed"
              className="h-full min-h-[420px] w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
