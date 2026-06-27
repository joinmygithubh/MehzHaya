import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const storedUser = JSON.parse(localStorage.getItem("mehzhaya_user") || "null");

const persist = (user, token) => {
  if (user) localStorage.setItem("mehzhaya_user", JSON.stringify(user));
  if (token) localStorage.setItem("mehzhaya_token", token);
};
const clearPersist = () => {
  localStorage.removeItem("mehzhaya_user");
  localStorage.removeItem("mehzhaya_token");
};

export const register = createAsyncThunk("auth/register", async (data, thunk) => {
  try {
    const res = await api.post("/auth/register", data);
    persist(res.data.user, res.data.token);
    return res.data;
  } catch (e) {
    return thunk.rejectWithValue(e.message);
  }
});

export const login = createAsyncThunk("auth/login", async (data, thunk) => {
  try {
    const res = await api.post("/auth/login", data);
    persist(res.data.user, res.data.token);
    return res.data;
  } catch (e) {
    return thunk.rejectWithValue(e.message);
  }
});

export const loadUser = createAsyncThunk("auth/loadUser", async (_, thunk) => {
  try {
    const res = await api.get("/auth/me");
    return res.data.user;
  } catch (e) {
    return thunk.rejectWithValue(e.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.get("/auth/logout");
  } catch {
    /* ignore */
  }
  clearPersist();
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunk) => {
    try {
      const res = await api.put("/users/profile", data);
      persist(res.data.user);
      return res.data.user;
    } catch (e) {
      return thunk.rejectWithValue(e.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    isAuthenticated: !!storedUser,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    const authed = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    };

    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, authed)
      .addCase(register.rejected, rejected)
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, authed)
      .addCase(login.rejected, rejected)
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
