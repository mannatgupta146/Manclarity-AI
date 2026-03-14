import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000/api/auth",
})

export const loginApi = async (email, password) => {
  const res = await api.post("/login", { email, password })
  return res.data
}

export const registerApi = async (name, email, password) => {
  const res = await api.post("/register", { name, email, password })
  return res.data
}
