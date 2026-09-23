import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./axios";

export const getProducts = createAsyncThunk(
  "products/getProducts",
  async (category = "") => {
    const response = await api.get("/products", {
      params: {
        category,
      },
    });

    return response.data.products;
  }
);

const productSlice = createSlice({
  name: "products",

  initialState: {
    products: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })

      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;