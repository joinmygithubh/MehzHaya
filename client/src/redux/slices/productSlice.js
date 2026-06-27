import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (params = {}, thunk) => {
    try {
      const res = await api.get("/products", { params });
      return { ...res.data, append: params.append || false };
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const fetchProduct = createAsyncThunk(
  "products/fetchOne",
  async (idOrSlug, thunk) => {
    try {
      const res = await api.get(`/products/${idOrSlug}`);
      return res.data;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const fetchHomeSections = createAsyncThunk(
  "products/home",
  async (_, thunk) => {
    try {
      const res = await api.get("/products/sections/home");
      return res.data.sections;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    product: null,
    related: [],
    sections: {},
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    clearProduct: (state) => {
      state.product = null;
      state.related = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.append
          ? [...state.items, ...action.payload.products]
          : action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProduct.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.product = action.payload.product;
        state.related = action.payload.related;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchHomeSections.fulfilled, (state, action) => {
        state.sections = action.payload;
      });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
