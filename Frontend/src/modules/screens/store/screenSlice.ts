import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {  Screen } from "@/shared/types/db";

interface ScreenState {
  screens: Screen[];
  selectedScreen: Screen | null;
  isLoading: boolean;
}

const initialState: ScreenState = {
  screens: [],
  selectedScreen: null,
  isLoading: false,
};

const screenSlice = createSlice({
  name: "screens",
  initialState,
  reducers: {
    setScreens: (state, action: PayloadAction<Screen[]>) => {
      state.screens = action.payload;
      state.isLoading = false;
    },

    addScreen: (state, action: PayloadAction<Screen>) => {
      state.screens.push(action.payload);
    },

    updateScreen: (state, action: PayloadAction<Screen>) => {
      const index = state.screens.findIndex(
        (screen) => screen.id === action.payload.id
      );

      if (index !== -1) {
        state.screens[index] = action.payload;
      }
    },

    deleteScreen: (state, action: PayloadAction<string>) => {
      state.screens = state.screens.filter(
        (screen) => screen.id !== action.payload
      );
    },

    setSelectedScreen: (state, action: PayloadAction<Screen | null>) => {
      state.selectedScreen = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setScreens,
  addScreen,
  updateScreen,
  deleteScreen,
  setSelectedScreen,
  setLoading,
} = screenSlice.actions;

export default screenSlice.reducer;