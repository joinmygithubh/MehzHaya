import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunk) => {
  try {
    const res = await api.get("/cart");
    return res.data;
  } catch (e) {
    return thunk.rejectWithValue(e.message);
  }
});

export const addToCart = createAsyncThunk("cart/add", async (payload, thunk) => {
  try {
    const res = await api.post("/cart", payload);
    return res.data;
  } catch (e) {
    return thunk.rejectWithValue(e.message);
  }
});

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ itemId, quantity }, thunk) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      return res.data;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/remove",
  async (itemId, thunk) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      return res.data;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const clearCart = createAsyncThunk("cart/clear", async (_, thunk) => {
  try {
    const res = await api.delete("/cart");
    return res.data;
  } catch (e) {
    return thunk.rejectWithValue(e.message);
  }
});

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (code, thunk) => {
    try {
      const res = await api.post("/cart/coupon", { code });
      return res.data;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const removeCoupon = createAsyncThunk(
  "cart/removeCoupon",
  async (_, thunk) => {
    try {
      const res = await api.delete("/cart/coupon");
      return res.data;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

const emptySummary = {
  itemsPrice: 0,
  discount: 0,
  shippingPrice: 0,
  totalPrice: 0,
  totalItems: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    coupon: { code: "", discount: 0 },
    summary: emptySummary,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      if (action.payload.cart) {
        state.items = action.payload.cart.items;
        state.coupon = action.payload.cart.coupon;
      }
      if (action.payload.summary) state.summary = action.payload.summary;
    };
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(clearCart.fulfilled, setCart)
      .addCase(applyCoupon.fulfilled, setCart)
      .addCase(removeCoupon.fulfilled, setCart);
  },
});

export default cartSlice.reducer;
