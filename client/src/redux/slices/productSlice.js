import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { removeRecentlyViewed } from "./uiSlice";

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

export const createProduct = createAsyncThunk(
  "products/create",
  async (formData, thunk) => {
    try {
      const res = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.product;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, formData }, thunk) => {
    try {
      const res = await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.product;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, thunk) => {
    try {
      const res = await api.delete(`/products/${id}`);
      thunk.dispatch(removeRecentlyViewed(id));
      return { id, product: res.data.product };
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const restoreProduct = createAsyncThunk(
  "products/restore",
  async (id, thunk) => {
    try {
      const res = await api.put(`/products/${id}/restore`);
      return res.data.product;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const permanentDeleteProduct = createAsyncThunk(
  "products/permanentDelete",
  async (id, thunk) => {
    try {
      await api.delete(`/products/${id}/permanent`);
      thunk.dispatch(removeRecentlyViewed(id));
      return id;
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
      state.error = null;
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
        state.product = null;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.product = action.payload.product;
        state.related = action.payload.related;
        state.error = null;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.detailLoading = false;
        state.product = null;
        state.error = action.payload;
      })
      .addCase(fetchHomeSections.fulfilled, (state, action) => {
        state.sections = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.items = state.items.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        if (state.product?._id === action.payload._id) {
          state.product = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const id = action.payload.id;
        state.items = state.items.filter((p) => p._id !== id);
        if (state.product?._id === id) {
          state.product = null;
        }
        if (state.sections) {
          Object.keys(state.sections).forEach((k) => {
            if (Array.isArray(state.sections[k])) {
              state.sections[k] = state.sections[k].filter(
                (p) => p._id !== id
              );
            }
          });
        }
      })
      .addCase(restoreProduct.fulfilled, (state, action) => {
        const restored = action.payload;
        state.items = state.items.map((p) =>
          p._id === restored._id ? restored : p
        );
        if (state.product?._id === restored._id) {
          state.product = restored;
        }
      })
      .addCase(permanentDeleteProduct.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((p) => p._id !== id);
        if (state.product?._id === id) {
          state.product = null;
        }
        if (state.sections) {
          Object.keys(state.sections).forEach((k) => {
            if (Array.isArray(state.sections[k])) {
              state.sections[k] = state.sections[k].filter(
                (p) => p._id !== id
              );
            }
          });
        }
      });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
