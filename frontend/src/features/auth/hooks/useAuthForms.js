import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export const useLoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      setError("")
      navigate("/")
    } catch (err) {
      // Log the error object and response for debugging
      console.error("Login error:", err)
      if (err && err.response) {
        console.error("Error response:", err.response)
        // Try to show backend error message if available
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message)
          return
        }
      }
      setError(err?.message || "Login failed")
    }
  }

  const togglePassword = () => setShowPassword((prev) => !prev)

  return {
    form,
    handleChange,
    handleSubmit,
    loading,
    showPassword,
    togglePassword,
    error,
    setError,
  }
}

export const useRegisterForm = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { register, loading } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log("Registering with:", form)
      await register(form.username, form.email, form.password)
      setError("Registration successful! Please check your email to verify your account.")
    } catch (err) {
      console.error("Register error:", err)
      if (err && err.response) {
        console.error("Error response:", err.response)
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message)
          return
        }
        if (err.response.data && err.response.data.errors && Array.isArray(err.response.data.errors)) {
          setError(err.response.data.errors[0].msg)
          return
        }
      }
      setError(err?.message || "Registration failed")
    }
  }

  const togglePassword = () => setShowPassword((prev) => !prev)

  return {
    form,
    handleChange,
    handleSubmit,
    loading,
    showPassword,
    togglePassword,
    error,
    setError,
  }
}
