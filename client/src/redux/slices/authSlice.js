import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "../../services/authService.js";

const userInfoRaw = localStorage.getItem("userInfo");

export const loginUser = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const updateProfileThunk = createAsyncThunk("auth/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const res = await authService.updateProfile(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Update failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userInfo: userInfoRaw ? JSON.parse(userInfoRaw) : null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        // /auth/me returns the fresh user doc but no token — keep the existing token.
        state.userInfo = { ...state.userInfo, ...action.payload };
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
