import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "./socketSlice";

export const store = configureStore({
  reducer: {
    socket: socketReducer,
  },
  middleware: (getDefault) =>
    getDefault({
        immutableCheck: false,
        serializableCheck: false,
    })
});

export type AppDispatch = typeof store.dispatch;