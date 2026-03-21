import {
  getMeApi,
  loginApi,
  registerApi,
  verifyEmailApi,
} from "../services/auth.api"
import { resendVerificationEmailApi } from "../services/auth.api"
import {
  setUser,
  setLoading,
  setError,
  setVerifyStatus,
  setVerifyMessage,
} from "../auth.slice"
import { useDispatch } from "react-redux"

export function useAuth() {
  const dispatch = useDispatch()

  const handleRegister = async ({ email, password, username }) => {
    try {
      dispatch(setLoading(true))
      const data = await registerApi(username, email, password)
      if (
        data &&
        data.success === false &&
        data.message === "User already exists"
      ) {
        dispatch(setError(data.message))
        return false
      }
      return data
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Registration failed"))
      return false
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

  // Email verification handler
  const handleVerifyEmail = async (token) => {
    try {
      dispatch(setVerifyStatus("pending"))
      const data = await verifyEmailApi(token)
      dispatch(setVerifyStatus("success"))
      dispatch(setVerifyMessage(data.message || "Email verified successfully."))
    } catch (error) {
      dispatch(setVerifyStatus("error"))
      dispatch(
        setVerifyMessage(
          error.response?.data?.message ||
            "Verification failed. Please try again later.",
        ),
      )
    }
  }

  // Resend verification email handler
  const handleResendVerificationEmail = async (email) => {
    try {
      dispatch(setVerifyStatus("pending"))
      const data = await resendVerificationEmailApi(email)
      dispatch(setVerifyStatus("success"))
      dispatch(setVerifyMessage(data.message || "Verification email resent."))
      return data
    } catch (error) {
      dispatch(setVerifyStatus("error"))
      const msg =
        error.response?.data?.message ||
        "Resend failed. Please try again later."
      dispatch(setVerifyMessage(msg))
      return { success: false, message: msg }
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    handleVerifyEmail,
    handleResendVerificationEmail,
  }
}
