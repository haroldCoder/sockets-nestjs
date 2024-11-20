import { store } from "./store";

// RootState se basa en el estado global del store
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch se basa en el método dispatch del store
export type AppDispatch = typeof store.dispatch;