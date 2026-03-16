import { createSlice } from "@reduxjs/toolkit"

const THEME_KEY = "manclarity_theme"
const initialTheme = localStorage.getItem(THEME_KEY) || "light"

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    theme: initialTheme,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"
      localStorage.setItem(THEME_KEY, state.theme)
      if (state.theme === "dark") {
        document.body.classList.add("dark")
      } else {
        document.body.classList.remove("dark")
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem(THEME_KEY, state.theme)
      if (state.theme === "dark") {
        document.body.classList.add("dark")
      } else {
        document.body.classList.remove("dark")
      }
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
