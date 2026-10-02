import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as productService from "../../services/productService.js";

export const fetchProductsThunk = createAsyncThunk("products/fetch", async (params) => {
  const res = await productService.fetchProducts(params);
  return res;
});

const productSlice = createSlice({
  name: "products",
  initialState: { list: [], pagination: {}, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProductsThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default productSlice.reducer;
