import React from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./app.routes"
import { ThemeProvider } from "../theme/ThemeContext"

const App = () => {
  return (
    <ThemeProvider>
        <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
