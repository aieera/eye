import { createSlice } from "@reduxjs/toolkit";

const brandSlice = createSlice({
  name: "brands",
  initialState: {
    brands: []
  },
  reducers: {}
});

export default brandSlice.reducer;