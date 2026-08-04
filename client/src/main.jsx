import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import store from "./redux/store";
import App from "./App";
import "./index.css";
import "./utils/toast.jsx";

// Apply persisted theme before paint
const theme = localStorage.getItem("mehzhaya_theme") || "light";
if (theme === "dark") document.documentElement.classList.add("dark");

const position = window.innerWidth >= 768 ? "top-right" : "bottom-center";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
          <ToastContainer
            position={position}
            autoClose={3000}
            limit={3}
            hideProgressBar
            closeButton={false}
            toastClassName={() => "p-0 min-h-0 bg-transparent shadow-none border-0 mb-3"}
            bodyClassName={() => "p-0 flex items-center w-full"}
            newestOnTop
          />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
