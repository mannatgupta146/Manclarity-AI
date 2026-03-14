import React from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./app.routes"
import { AuthProvider } from "./features/auth/context/AuthContext"

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
