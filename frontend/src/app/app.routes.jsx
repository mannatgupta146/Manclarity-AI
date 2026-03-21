import { createBrowserRouter } from "react-router-dom"
import Login from "../features/auth/pages/Login"
import Register from "../features/auth/pages/Register"
import VerifyEmail from "../features/auth/pages/VerifyEmail"
import ResendVerification from "../features/auth/pages/ResendVerification"
import Dashboard from "../features/chat/pages/Dashboard"
import Protected from "../features/auth/components/Protected"
import { Navigate } from "react-router-dom"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
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

  {
    path: "/resend-verification",
    element: <ResendVerification />,
  },

  {
    path: "/dashboard",
    element: <Navigate to="/" replace />,
  },
])
