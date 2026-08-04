import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { CATEGORY_GROUPS as DEFAULT_CATEGORY_GROUPS } from "../../utils/constants";

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, thunk) => {
    try {
      const res = await api.get("/categories");
      return res.data.categories || [];
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

export const buildGroupedCategories = (categoriesList) => {
  if (!categoriesList || categoriesList.length === 0) {
    return DEFAULT_CATEGORY_GROUPS;
  }
  const grouped = {
    Hijabs: [],
    "Islamic Wear": [],
    Accessories: [],
  };

  categoriesList.forEach((cat) => {
    const groupName = cat.group || "Hijabs";
    if (!grouped[groupName]) grouped[groupName] = [];
    grouped[groupName].push(cat.name);
  });

  return grouped;
};

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
    grouped: DEFAULT_CATEGORY_GROUPS,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.grouped = buildGroupedCategories(action.payload);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
