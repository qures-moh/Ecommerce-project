import { createSlice } from "@reduxjs/toolkit";

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem("cart");

    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    return [];
  }
};

const getCartItemKey = (item) => {
  if (item.variantId) {
    return `${item._id}-${item.variantId}`;
  }

  return item._id;
};

const cartSlice = createSlice({
  name: "cart",

  initialState: getInitialCart(),

  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;

      const stock = Number(product.stock) || 0;

      if (stock <= 0) {
        return state;
      }

      if (!product.variantId) {
        return state;
      }

      const existingProduct = state.find(
        (item) =>
          getCartItemKey(item) === getCartItemKey(product)
      );

      if (existingProduct) {
        if (existingProduct.quantity < stock) {
          existingProduct.quantity += 1;
        }
      } else {
        state.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(state)
      );
    },

    increaseQuantity: (state, action) => {
      const { productId, variantId } = action.payload;

      const product = state.find(
        (item) =>
          String(item._id) === String(productId) &&
          String(item.variantId) === String(variantId)
      );

      if (product) {
        const stock = Number(product.stock) || 0;

        if (product.quantity < stock) {
          product.quantity += 1;
        }
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(state)
      );
    },

    decreaseQuantity: (state, action) => {
      const { productId, variantId } = action.payload;

      const product = state.find(
        (item) =>
          String(item._id) === String(productId) &&
          String(item.variantId) === String(variantId)
      );

      if (product && product.quantity > 1) {
        product.quantity -= 1;
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(state)
      );
    },

    removeFromCart: (state, action) => {
      const { productId, variantId } = action.payload;

      const newCart = state.filter(
        (item) =>
          !(
            String(item._id) === String(productId) &&
            String(item.variantId) === String(variantId)
          )
      );

      localStorage.setItem(
        "cart",
        JSON.stringify(newCart)
      );

      return newCart;
    },

    clearCart: () => {
      localStorage.removeItem("cart");

      return [];
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;