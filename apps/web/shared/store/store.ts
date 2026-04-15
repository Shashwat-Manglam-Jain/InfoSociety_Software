import { configureStore } from "@reduxjs/toolkit";
import { uiPreferencesReducer } from "@/shared/store/slices/ui-preferences-slice";

export const store = configureStore({
  reducer: {
    uiPreferences: uiPreferencesReducer
  }
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
