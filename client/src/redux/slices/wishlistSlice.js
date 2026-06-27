import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, thunk) => {
    try {
      const res = await api.get("/wishlist");
      return res.data.products;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (productId, thunk) => {
    try {
      const res = await api.post(`/wishlist/${productId}`);
      return res.data;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId, thunk) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      return { ...res.data, productId };
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const moveToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async (productId, thunk) => {
    try {
      const res = await api.post(`/wishlist/${productId}/move-to-cart`);
      return { ...res.data, productId };
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    products: [], // full product objects (for wishlist page)
    ids: [], // just ids (for quick toggle checks)
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.products = action.payload;
        state.ids = action.payload.map((p) => p._id);
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.ids = action.payload.productIds;
        // remove from product list if unfavorited
        state.products = state.products.filter((p) =>
          action.payload.productIds.includes(p._id)
        );
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.ids = action.payload.productIds;
        state.products = state.products.filter(
          (p) => p._id !== action.payload.productId
        );
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.ids = action.payload.productIds;
        state.products = state.products.filter(
          (p) => p._id !== action.payload.productId
        );
      });
  },
});

export default wishlistSlice.reducer;
