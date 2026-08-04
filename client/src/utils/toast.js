import { toast as reactToastify } from "react-toastify";
import CustomToast from "../components/common/Toast";

/**
 * Global E-Commerce Toast Notification Service & Interceptor
 * Intercepts react-toastify calls application-wide to render Myntra/Zara/Nike style CustomToast cards.
 */

const originalSuccess = reactToastify.success.bind(reactToastify);
const originalError = reactToastify.error.bind(reactToastify);
const originalInfo = reactToastify.info.bind(reactToastify);
const originalWarning = (reactToastify.warning || reactToastify.warn).bind(reactToastify);

// Intercept react-toastify methods globally
reactToastify.success = (content, options = {}) => {
  if (typeof content === "string" || typeof content === "number") {
    return originalSuccess(
      ({ closeToast }) => (
        <CustomToast type="success" title={String(content)} closeToast={closeToast} />
      ),
      { icon: false, ...options }
    );
  }
  return originalSuccess(content, options);
};

reactToastify.error = (content, options = {}) => {
  if (typeof content === "string" || typeof content === "number") {
    return originalError(
      ({ closeToast }) => (
        <CustomToast type="error" title={String(content)} closeToast={closeToast} />
      ),
      { icon: false, ...options }
    );
  }
  return originalError(content, options);
};

reactToastify.info = (content, options = {}) => {
  if (typeof content === "string" || typeof content === "number") {
    return originalInfo(
      ({ closeToast }) => (
        <CustomToast type="info" title={String(content)} closeToast={closeToast} />
      ),
      { icon: false, ...options }
    );
  }
  return originalInfo(content, options);
};

reactToastify.warning = (content, options = {}) => {
  if (typeof content === "string" || typeof content === "number") {
    return originalWarning(
      ({ closeToast }) => (
        <CustomToast type="warning" title={String(content)} closeToast={closeToast} />
      ),
      { icon: false, ...options }
    );
  }
  return originalWarning(content, options);
};

reactToastify.warn = reactToastify.warning;

export const showToast = {
  success: (title, subtitle = "") => {
    return originalSuccess(
      ({ closeToast }) => (
        <CustomToast type="success" title={title} subtitle={subtitle} closeToast={closeToast} />
      ),
      { icon: false }
    );
  },

  error: (title, subtitle = "") => {
    return originalError(
      ({ closeToast }) => (
        <CustomToast type="error" title={title} subtitle={subtitle} closeToast={closeToast} />
      ),
      { icon: false }
    );
  },

  warning: (title, subtitle = "") => {
    return originalWarning(
      ({ closeToast }) => (
        <CustomToast type="warning" title={title} subtitle={subtitle} closeToast={closeToast} />
      ),
      { icon: false }
    );
  },

  info: (title, subtitle = "") => {
    return originalInfo(
      ({ closeToast }) => (
        <CustomToast type="info" title={title} subtitle={subtitle} closeToast={closeToast} />
      ),
      { icon: false }
    );
  },

  // E-commerce Specific Presets
  cart: {
    added: (productName = "") => showToast.success("Added to Bag", productName),
    removed: (productName = "") => showToast.info("Removed from Bag", productName),
    updated: () => showToast.success("Bag updated"),
  },

  wishlist: {
    added: (productName = "") => showToast.success("Added to Wishlist", productName),
    removed: (productName = "") => showToast.info("Removed from Wishlist", productName),
  },

  order: {
    placed: () => showToast.success("Order placed successfully!"),
    cancelled: () => showToast.info("Order cancelled"),
    paymentSuccess: () => showToast.success("Payment successful!"),
    paymentFailed: () => showToast.error("Payment failed. Please try again."),
  },

  returnReq: {
    submitted: () => showToast.success("Return request submitted"),
    cancelled: () => showToast.info("Return request cancelled"),
  },

  exchange: {
    submitted: () => showToast.success("Exchange request submitted"),
    cancelled: () => showToast.info("Exchange request cancelled"),
  },

  auth: {
    loginSuccess: (name = "") => showToast.success("Login successful", name ? `Welcome back, ${name}!` : ""),
    loginFailed: (msg = "Invalid email or password") => showToast.error("Login failed", msg),
    registered: () => showToast.success("Account created successfully!"),
  },
};

export default showToast;
