import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export const useLoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(form.email, form.password)
  }

  const togglePassword = () => setShowPassword((prev) => !prev)

  return {
    form,
    handleChange,
    handleSubmit,
    loading,
    showPassword,
    togglePassword,
  }
}

export const useRegisterForm = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const { register, loading } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await register(form.name, form.email, form.password)
  }

  const togglePassword = () => setShowPassword((prev) => !prev)

  return {
    form,
    handleChange,
    handleSubmit,
    loading,
    showPassword,
    togglePassword,
  }
}
