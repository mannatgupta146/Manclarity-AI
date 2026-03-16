import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"
import { useAuth } from "../hooks/useAuth"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const { handleLogin } = useAuth()
  const navigate = useNavigate()

  const user = useSelector((state) => state.auth.user)
  const error = useSelector((state) => state.auth.error)
  const loading = useSelector((state) => state.auth.loading)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const togglePassword = () => setShowPassword((prev) => !prev)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleLogin(form)
    navigate("/")
  }

  if(!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      <ThemeToggleButton />

      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-3xl shadow-lg w-full max-w-105 border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="mb-6 text-center flex flex-col items-center">
          <img
            src="/brand.png"
            alt="Manclarity AI Logo"
            style={{ width: 45, height: 45 }}
            className="mb-2 mx-auto"
          />
          <h2
            className="text-3xl font-extrabold mb-2"
            style={{ color: "var(--color-accent)" }}
          >
            Welcome Back
          </h2>
          <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
            Sign in to your account to continue.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-500 text-center text-sm font-medium">
            {error}
          </div>
        )}
        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="login-email"
            className="block mb-1 font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            Email Address
          </label>

          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            style={{
              background: "var(--color-input-bg)",
              borderColor: "var(--color-input-border)",
              color: "var(--color-input-text)",
            }}
            required
            placeholder="Enter your email"
          />
        </div>

        {/* Password */}
        <div className="mb-6 relative">
          <label
            htmlFor="login-password"
            className="block mb-1 font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            Password
          </label>

          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            style={{
              background: "var(--color-input-bg)",
              borderColor: "var(--color-input-border)",
              color: "var(--color-input-text)",
            }}
            required
            placeholder="Enter your password"
          />

          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-9 text-gray-500 focus:outline-none"
            tabIndex={-1}
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.362m3.087-2.978A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 01-4.293 5.411M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3l18 18"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 rounded font-semibold transition duration-200 hover:brightness-110 active:scale-95"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
          }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Register */}
        <div className="mt-6 text-center">
          <span style={{ color: "var(--color-secondary)" }}>
            Don't have an account?
          </span>

          <Link
            to="/register"
            className="ml-1 font-medium underline-offset-2 custom-link"
          >
            Register
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Login
