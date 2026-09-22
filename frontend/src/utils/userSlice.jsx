import { createSlice } from "@reduxjs/toolkit";

let savedUser = localStorage.getItem("user");

if (savedUser === "undefined") {
  localStorage.removeItem("user");
  savedUser = null;
}

const userSlice = createSlice({
  name: "user",

  initialState: savedUser ? JSON.parse(savedUser) : null,

  reducers: {
    addUser: (state, action) => {
      localStorage.setItem(
        "user",
        JSON.stringify(action.payload)
      );

      return action.payload;
    },

    removeUser: () => {
      localStorage.removeItem("user");

      return null;
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;

export default userSlice.reducer;