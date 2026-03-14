import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

const THEME_KEY = "manclarity_theme"

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || "light")

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    // Add or remove .dark class on <body> for correct dark mode background
    if (theme === "dark") {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
