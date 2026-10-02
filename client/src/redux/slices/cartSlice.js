import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartService from "../../services/cartService.js";

export const fetchCartThunk = createAsyncThunk("cart/fetch", async () => {
  const res = await cartService.fetchCart();
  return res.data;
});

export const addToCartThunk = createAsyncThunk("cart/add", async ({ productId, quantity }) => {
  const res = await cartService.addToCartApi(productId, quantity);
  return res.data;
});

export const updateCartItemThunk = createAsyncThunk("cart/update", async ({ productId, quantity }) => {
  const res = await cartService.updateCartItemApi(productId, quantity);
  return res.data;
});

export const removeCartItemThunk = createAsyncThunk("cart/remove", async (productId) => {
  const res = await cartService.removeCartItemApi(productId);
  return res.data;
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        state.items = action.payload.items;
      });
  },
});

export default cartSlice.reducer;
