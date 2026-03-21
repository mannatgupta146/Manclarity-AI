import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000/api/auth",
  withCredentials: true,
})

export const loginApi = async (email, password) => {
  const res = await api.post("/login", { email, password })
  return res.data
}

export const registerApi = async (username, email, password) => {
  const res = await api.post("/register", { username, email, password })
  return res.data
}

export const getMeApi = async () => {
  const res = await api.get("/get-me")
  return res.data
}

export const logoutApi = async () => {
  const res = await api.post("/logout")
  return res.data
}

// Email verification API
export const verifyEmailApi = async (token) => {
  const res = await api.get(`/verify-email?token=${token}`)
  return res.data
}

// Resend verification email API
export const resendVerificationEmailApi = async (email) => {
  const res = await api.post("/resend-verification", { email })
  return res.data
}

// Get current resend attempts for a user
export const getResendAttemptsApi = async (email) => {
  const res = await api.get(
    `/resend-attempts?email=${encodeURIComponent(email)}`,
  )
  return res.data
}
