import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CounterState {
  success: number;
  failure: number;
  lastMessage: string;
}

const initialState: CounterState = {
  success: 0,
  failure: 0,
  lastMessage: "",
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    addSuccess(state, action: PayloadAction<string | undefined>) {
      state.success += 1;
      state.lastMessage = action.payload ?? "Success";
    },
    addFailure(state, action: PayloadAction<string | undefined>) {
      state.failure += 1;
      state.lastMessage = action.payload ?? "Failure";
    },
    resetCounter(state) {
      state.success = 0;
      state.failure = 0;
      state.lastMessage = "";
    },
  },
});

export const { addSuccess, addFailure, resetCounter } = counterSlice.actions;
export default counterSlice.reducer;
