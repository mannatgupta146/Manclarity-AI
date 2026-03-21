import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"
import { useAuth } from "../hooks/useAuth.js"
import { getResendAttemptsApi } from "../services/auth.api"

const RESEND_TIMER = 120 // 2 minutes

const MAX_RESEND_ATTEMPTS = 1 // Only 1 resend allowed
const ResendVerification = () => {
  const [timer, setTimer] = useState(RESEND_TIMER)
  const [resent, setResent] = useState(false)
  const [showResend, setShowResend] = useState(false)
  // Use backend value for resend attempts
  const [resendCount, setResendCount] = useState(null)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { handleResendVerificationEmail } = useAuth()

  // Get email from location state or query param
  const email =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    ""

  useEffect(() => {
    if (!email) {
      navigate("/register")
      return
    }
    // Fetch resend attempts from backend
    getResendAttemptsApi(email)
      .then((data) => {
        setResendCount(data.resendAttempts ?? 0)
      })
      .catch(() => setResendCount(0))
  }, [email, navigate])

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    } else {
      setShowResend(true)
    }
    return () => clearInterval(interval)
  }, [timer])

  const formatTimer = (t) => {
    const m = String(Math.floor(t / 60)).padStart(2, "0")
    const s = String(t % 60).padStart(2, "0")
    return `${m}:${s}`
  }

  const handleResend = async (e) => {
    e.preventDefault()
    if (resendCount >= MAX_RESEND_ATTEMPTS) {
      setError(
        "You have reached the maximum number of attempts. Please check your email details carefully and try again after some time.",
      )
      return
    }
    try {
      const result = await handleResendVerificationEmail(email)
      // If backend returns error, show it and do not increment count
      if (result && result.success === false && result.message) {
        setError(result.message)
        return
      }
      setResent(true)
      setTimer(RESEND_TIMER)
      setShowResend(false)
      // After resend, fetch updated count from backend
      getResendAttemptsApi(email).then((data) =>
        setResendCount(data.resendAttempts ?? resendCount + 1),
      )
      // If this was the last allowed attempt, show error after short delay
      if (resendCount + 1 >= MAX_RESEND_ATTEMPTS) {
        setTimeout(() => {
          setResent(false)
          setError(
            "You have reached the maximum number of attempts. Please check your email details carefully and try again after some time.",
          )
        }, 1000)
      } else {
        setTimeout(() => setResent(false), 2000)
      }
    } catch (err) {
      setError("Failed to resend email. Please try again later.")
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      <ThemeToggleButton />
      <div
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
            Verify Your Email
          </h2>
          <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
            An email has been sent to{" "}
            <span className="font-semibold">{email}</span>.<br />
            Please check your inbox and follow the instructions to verify your
            account.
          </p>
        </div>
        <div className="mt-6 text-center">
          {error ? (
            <div className="text-red-500 text-sm font-medium mb-2">{error}</div>
          ) : showResend ? (
            resendCount !== null && resendCount < MAX_RESEND_ATTEMPTS ? (
              <form onSubmit={handleResend}>
                <button
                  type="submit"
                  className="py-2 px-4 rounded font-semibold transition hover:brightness-110 active:scale-95"
                  style={{ background: "var(--color-accent)", color: "#fff" }}
                  disabled={timer > 0}
                >
                  {resent ? "Resent!" : `Resend Verification Email`}
                </button>
              </form>
            ) : (
              <div className="text-red-500 text-sm font-medium">
                You have reached the maximum number of attempts. Please check
                your email details carefully and try again after some time.
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500">
              You can resend in {formatTimer(timer)}
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="font-medium underline-offset-2 custom-link"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResendVerification
