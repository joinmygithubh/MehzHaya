import { createSlice } from "@reduxjs/toolkit";

const storedTheme = localStorage.getItem("mehzhaya_theme") || "light";
const storedViewed = JSON.parse(
  localStorage.getItem("mehzhaya_recently_viewed") || "[]"
);

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    theme: storedTheme,
    mobileMenuOpen: false,
    searchOpen: false,
    recentlyViewed: storedViewed,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("mehzhaya_theme", state.theme);
    },
    setMobileMenu: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    addRecentlyViewed: (state, action) => {
      const product = action.payload;
      state.recentlyViewed = [
        product,
        ...state.recentlyViewed.filter((p) => p._id !== product._id),
      ].slice(0, 8);
      localStorage.setItem(
        "mehzhaya_recently_viewed",
        JSON.stringify(state.recentlyViewed)
      );
    },
  },
});

export const {
  toggleTheme,
  setMobileMenu,
  setSearchOpen,
  addRecentlyViewed,
} = uiSlice.actions;
export default uiSlice.reducer;
