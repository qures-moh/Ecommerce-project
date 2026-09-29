import { createSlice } from "@reduxjs/toolkit";

const savedWishlist = JSON.parse(
  localStorage.getItem("wishlist") || "[]"
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: savedWishlist,

  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;

      const exists = state.find(
        (item) =>
          String(item._id) === String(product._id)
      );

      if (exists) {
        const newWishlist = state.filter(
          (item) =>
            String(item._id) !== String(product._id)
        );

        localStorage.setItem(
          "wishlist",
          JSON.stringify(newWishlist)
        );

        return newWishlist;
      }

      state.push(product);

      localStorage.setItem(
        "wishlist",
        JSON.stringify(state)
      );
    },

    clearWishlist: () => {
      localStorage.removeItem("wishlist");
      return [];
    },
  },
});

export const {
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;