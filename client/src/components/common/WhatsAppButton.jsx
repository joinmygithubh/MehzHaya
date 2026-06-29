import { FaWhatsapp } from "react-icons/fa";
import { STORE } from "../../utils/constants";

/**
 * Floating "Book on WhatsApp" button.
 * Opens a WhatsApp chat with the store number and a pre-filled message.
 */
const WhatsAppButton = () => {
  // India country code (91) + store number
  const number = `91${STORE.phone}`;
  const message = encodeURIComponent(
    "Hello MehzHaya! 🌸 I'd like to book / enquire about your products."
  );
  const href = `https://wa.me/${number}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book on WhatsApp"
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl"
    >
      <FaWhatsapp size={24} className="animate-float" />
      <span className="hidden text-sm font-semibold sm:inline">
        Book on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
