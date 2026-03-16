import { getMeApi, loginApi, registerApi } from "../services/auth.api"
import { setUser, setLoading, setError } from "../auth.slice"
import { useDispatch } from "react-redux"

export function useAuth() {
  const dispatch = useDispatch()

  const handleRegister = async ({ email, password, username }) => {
    try {
      dispatch(setLoading(true))
      const data = await registerApi(username, email, password)
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Registration failed"))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleLogin = async ({ email, password, username }) => {
    try {
      dispatch(setLoading(true))
      const data = await loginApi(email, password)
      dispatch(setUser(data.user))
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleGetMe = async () => {
    try {
      dispatch(setLoading(true))
      const data = await getMeApi()
      dispatch(setUser(data.user))
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to get user information",
        ),
      )
    } finally {
      dispatch(setLoading(false))
    }
  }

  return { handleRegister, handleLogin, handleGetMe }
}
