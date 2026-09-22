import { createSlice } from "@reduxjs/toolkit";


const authSlice = createSlice({
  name: "auth",

  initialState: {
    token:  localStorage.getItem("token") || null,
  },

  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;

      localStorage.setItem("token", action.payload);
    },

    removeToken: (state) => {
      state.token = null;

      localStorage.removeItem("token");
    },
  },
});

export const { setToken, removeToken } = authSlice.actions;

export default authSlice.reducer;