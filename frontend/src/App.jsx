import React from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./app.routes"
import { AuthProvider } from "./features/auth/context/AuthContext"
import { ThemeProvider } from "./theme/ThemeContext"

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
