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