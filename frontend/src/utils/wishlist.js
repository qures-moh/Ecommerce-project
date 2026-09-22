import { createSlice } from "@reduxjs/toolkit";

const savedWishlist = JSON.parse(
  localStorage.getItem("wishlist") || "[]"
);

const wishlist = createSlice({
  name: "wishlist",

  initialState: savedWishlist,

  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;

      const exists = state.find(
        (item) => item._id === product._id
      );

      if (exists) {
        const newWishlist = state.filter(
          (item) => item._id !== product._id
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
  },
});

export const { toggleWishlist } = wishlist.actions;

export default wishlist.reducer;