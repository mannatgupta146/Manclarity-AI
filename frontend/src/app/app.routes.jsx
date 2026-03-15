import { createBrowserRouter } from "react-router-dom"
import Login from "../features/auth/pages/Login"
import Register from "../features/auth/pages/Register"
import VerifyEmail from "../features/auth/pages/VerifyEmail"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <h1>Home Page</h1>,
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
])
