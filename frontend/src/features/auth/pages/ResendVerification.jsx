import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"
import { useAuth } from "../hooks/useAuth.js"
import { getResendAttemptsApi } from "../services/auth.api"

const RESEND_TIMER = 300 // 5 minutes

// Only 1 resend allowed per cooldown, but backend enforces
const MAX_RESEND_ATTEMPTS = 1
const ResendVerification = () => {
  const [timer, setTimer] = useState(RESEND_TIMER)
  const [resent, setResent] = useState(false)
  const [showResend, setShowResend] = useState(true)
  const [hasResent, setHasResent] = useState(false)
  // Use backend value for resend attempts
  const [resendCount, setResendCount] = useState(null)
  const [error, setError] = useState("")
  const [alreadyVerified, setAlreadyVerified] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { handleResendVerificationEmail } = useAuth()

  // Get email from location state or query param
  const email =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    ""

  // Format timer as mm:ss
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  // Fetch resend attempts, cooldown, and verified status on mount
  useEffect(() => {
    if (email) {
      fetch(
        `http://localhost:3000/api/auth/check-verified?email=${encodeURIComponent(email)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.verified) {
            setAlreadyVerified(true)
            return
          }
          getResendAttemptsApi(email).then((data) => {
            setResendCount(data.resendAttempts ?? 0)
            // If user has already resent and cooldown is active, set timer and hide button
            if (data.resendAttempts >= 1 && data.lastResend) {
              const last = new Date(data.lastResend).getTime()
              const now = Date.now()
              const elapsed = Math.floor((now - last) / 1000)
              if (elapsed < RESEND_TIMER) {
                setTimer(RESEND_TIMER - elapsed)
                setShowResend(false)
                setHasResent(true)
              } else {
                setShowResend(true)
                setHasResent(false)
                setTimer(RESEND_TIMER)
              }
            } else {
              setShowResend(true)
              setHasResent(false)
              setTimer(RESEND_TIMER)
            }
          })
        })
    }
  }, [email])

  // Timer countdown
  useEffect(() => {
    if (hasResent) {
      if (!showResend && timer > 0) {
        const interval = setInterval(() => setTimer((t) => t - 1), 1000)
        return () => clearInterval(interval)
      } else if (timer <= 0) {
        setShowResend(true)
      }
    }
  }, [timer, showResend, hasResent])

  // Resend handler
  const handleResend = async (e) => {
    e.preventDefault()
    setError("")
    setResent(false)
    try {
      await handleResendVerificationEmail(email)
      setResent(true)
      setHasResent(true)
      setTimer(RESEND_TIMER)
      setShowResend(false)
      // After resend, fetch updated count from backend
      getResendAttemptsApi(email).then((data) =>
        setResendCount(data.resendAttempts ?? resendCount + 1),
      )
      setTimeout(() => setResent(false), 2000)
    } catch (err) {
      // If backend returns max attempts/cooldown error, show it
      if (err?.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Failed to resend email. Please try again later.")
      }
    }
  }

  if (alreadyVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-bg)">
        <ThemeToggleButton />
        <div className="p-7 rounded-3xl w-full max-w-105 border flex flex-col items-center justify-center bg-(--color-card)] border-(--color-border)] min-h-0 shadow-[0_6px_32px_0_rgba(0,0,0,0.13)]">
          <img
            src="/brand.png"
            alt="Manclarity AI Logo"
            className="mx-auto w-16 h-16 mb-4.5 mt-1.5 filter-[drop-shadow(0_2px_8px_#f59e0b33)]"
          />
          <h2 className="text-4xl font-extrabold mb-3 text-center tracking-tight text-(--color-accent)] letter-spacing:0.5px line-height:1.08">
            Email Already Verified
          </h2>
          <div className="mb-4 w-full flex flex-col items-center gap-2">
            <div className="text-(--color-info-text,#222)] font-medium text-[18px] text-center mb-2.5line-height:1.7 letter-spacing:0.01em opacity-92">
              Your email is already verified.
              <br />
              You can now log in to your account.
            </div>
            <Link
              to="/login"
              className="font-semibold text-(--color-accent)] text-[18px] mt-4.5 inline-block letter-spacing:0.2px no-underline rounded-md px-1 bg-none shadow-none transition-colors duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-(--color-bg)]">
      <ThemeToggleButton />
      <div className="p-5 rounded-3xl w-full max-w-105 border bg-(--color-card)] border-(--color-border)] min-h-0 shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
        <div className="mb-6 text-center flex flex-col items-center">
          <img
            src="/brand.png"
            alt="Manclarity AI Logo"
            className="mb-5 mx-auto w-12 h-12"
          />
          <h2 className="text-4xl mb-4 text-center tracking-tight text-(--color-accent)] letter-spacing:0.5px line-height:1.08 font-bold">
            Verify Your Email
          </h2>
          <div className="mb-4 w-full flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center mb-1">
              <span className="text-[18px] text-center letter-spacing:0.2px mb-1.5 block font-semibold text-(--color-info-text,#222)]">
                Verification email sent to{" "}
                <span className="text-(--color-accent,#fbbf24)] font-bold">
                  {email}
                </span>
                .
              </span>
              <div
                className="w-10 h-1 rounded-md mx-auto mb-2.5 opacity-70"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-accent) 60%, transparent)",
                }}
              />
              <span className="text-(--color-info-text,#222)] font-medium text-[16px] text-center block mt-1 opacity-85 line-height:1.7 letter-spacing:0.01em">
                Please check your inbox and follow the instructions to verify
                your account.
              </span>
            </div>
            <div className="flex items-center justify-center mt-1 w-full">
              <div className="inline-block mt-1 max-w-110 rounded-[10px] px-4.5 py-2.5 font-bold text-[15px] text-(--color-warning-text,#b45309)] bg-(--color-warning-bg,#fffbe6)] border-[1.5px] border-(--color-warning-border,#fde68a) letter-spacing:0.1em opacity-97 text-center">
                <span
                  role="img"
                  aria-label="warning"
                  className="text-[18px] align-middle mr-2"
                >
                  ⚠️
                </span>
                <span className="text-(--color-warning-text,#b45309)] font-extrabold">
                  Don't reload this page or the timer will reset.
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          {resent ? (
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center justify-center mb-4.5 w-18 h-18 rounded-full bg-(--color-accent)] [box-shadow:0_2px_8px_#f59e0b33]">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 10.8 17 4 11.2"></polyline>
                </svg>
              </div>
              <div className="text-(--color-primary)] text-[16px] font-bold mb-1.5">
                Verification email resent!
              </div>
              <div className="text-(--color-secondary)] text-[13px]">
                Please check your inbox.
              </div>
            </div>
          ) : error ? (
            <div className="text-base font-semibold mb-4 text-[16px] text-(--color-error-text,#b91c1c) bg-(--color-error-bg,#fef2f2)] rounded-xl px-5 py-3 mx-auto max-w-110 border-[1.5px] border-(--color-error-border,#fecaca) letter-spacing:0.1em opacity-98">
              <span
                role="img"
                aria-label="error"
                className="text-[18px] align-middle mr-2"
              >
                ❌
              </span>
              {error}
            </div>
          ) : showResend ? (
            <form onSubmit={handleResend}>
              <button
                type="submit"
                className="py-2 px-6 rounded font-bold transition hover:brightness-110 active:scale-95 bg-(--color-accent)] text-white text-[16px]"
                disabled={hasResent && timer > 0}
              >
                Resend Verification Email
              </button>
            </form>
          ) : (
            <div className="text-base text-gray-500 text-[15px]">
              You can resend in {formatTimer(timer)}
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="font-semibold underline-offset-2 text-(--color-accent)] text-[16px] mt-2 inline-block letter-spacing:0.2px"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResendVerification
