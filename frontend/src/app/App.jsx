import React, { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./app.routes"
import { useAuth } from "../features/auth/hooks/useAuth.js"

const App = () => {
  const auth = useAuth()

  useEffect(() => {
    auth.handleGetMe()
    // eslint-disable-next-line
  }, [])

  return <RouterProvider router={router} />
}

export default App
