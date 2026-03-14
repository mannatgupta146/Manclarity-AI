import React, { createContext, useContext, useState } from "react"
import { loginApi, registerApi } from "../services/auth.api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await loginApi(email, password)
      setUser(data.user || null)
      setLoading(false)
      return data
    } catch (err) {
      setUser(null)
      setLoading(false)
      // Try to extract backend error message
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message)
      }
      throw new Error("Login failed")
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const data = await registerApi(name, email, password)
      setUser(data.user || null)
    } catch (err) {
      // Optionally handle error
      setUser(null)
    }
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
