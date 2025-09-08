import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "./socketSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    socket: socketReducer,
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault({
        immutableCheck: false,
        serializableCheck: false,
    })
});

export type AppDispatch = typeof store.dispatch;