import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    error: null,
    verifyStatus: "pending",
    verifyMessage: "",
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    setVerifyStatus: (state, action) => {
      state.verifyStatus = action.payload
    },
    setVerifyMessage: (state, action) => {
      state.verifyMessage = action.payload
    },
  },
})

export const {
  setUser,
  setLoading,
  setError,
  setVerifyStatus,
  setVerifyMessage,
} = authSlice.actions
export default authSlice.reducer
