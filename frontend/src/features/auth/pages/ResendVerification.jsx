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
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--color-bg)" }}
      >
        <ThemeToggleButton />
        <div
          className="p-7 rounded-3xl w-full max-w-105 border flex flex-col items-center justify-center shadow-lg"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            minHeight: 0,
            boxShadow: "0 6px 32px 0 rgba(0,0,0,0.13)",
          }}
        >
          <img
            src="/brand.png"
            alt="Manclarity AI Logo"
            style={{
              width: 64,
              height: 64,
              marginBottom: 18,
              marginTop: 6,
              filter: "drop-shadow(0 2px 8px #f59e0b33)",
            }}
            className="mx-auto"
          />
          <h2
            className="text-4xl font-extrabold mb-3 text-center tracking-tight"
            style={{
              color: "var(--color-accent)",
              letterSpacing: 0.5,
              lineHeight: 1.08,
              fontWeight: 800,
            }}
          >
            Email Already Verified
          </h2>
          <div className="mb-4 w-full flex flex-col items-center gap-2">
            <div
              style={{
                color: "var(--color-info-text, #222)",
                fontWeight: 500,
                fontSize: 18,
                textAlign: "center",
                marginBottom: 10,
                lineHeight: 1.7,
                letterSpacing: 0.01,
                opacity: 0.92,
              }}
            >
              Your email is already verified.
              <br />
              You can now log in to your account.
            </div>
            <Link
              to="/login"
              className="font-semibold"
              style={{
                color: "var(--color-accent)",
                fontSize: 18,
                marginTop: 18,
                display: "inline-block",
                fontWeight: 700,
                letterSpacing: 0.2,
                textDecoration: "none",
                borderRadius: 6,
                padding: "0 2px",
                background: "none",
                boxShadow: "none",
                transition: "color 0.18s",
              }}
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      <ThemeToggleButton />
      <div
        className="p-5 rounded-3xl w-full max-w-105 border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          minHeight: 0,
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
        }}
      >
        <div className="mb-6 text-center flex flex-col items-center">
          <img
            src="/brand.png"
            alt="Manclarity AI Logo"
            style={{ width: 48, height: 48 }}
            className="mb-5 mx-auto"
          />
          <h2
            className="text-4xl font-bold mb-4 text-center tracking-tight"
            style={{
              color: "var(--color-accent)",
              letterSpacing: 0.5,
              lineHeight: 1.08,
              fontWeight: 700,
            }}
          >
            Verify Your Email
          </h2>
          <div className="mb-4 w-full flex flex-col items-center gap-2">
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  textAlign: "center",
                  letterSpacing: 0.2,
                  marginBottom: 6,
                  display: "block",
                  fontWeight: 600,
                  color: "var(--color-info-text, #222)",
                }}
              >
                Verification email sent to{" "}
                <span
                  style={{
                    color: "var(--color-accent, #fbbf24)",
                    fontWeight: 700,
                  }}
                >
                  {email}
                </span>
                .
              </span>
              <div
                style={{
                  width: 40,
                  height: 3,
                  background:
                    "linear-gradient(90deg, var(--color-accent) 60%, transparent)",
                  borderRadius: 2,
                  margin: "0 auto 10px auto",
                  opacity: 0.7,
                }}
              />
              <span
                style={{
                  color: "var(--color-info-text, #222)",
                  fontWeight: 500,
                  fontSize: 16,
                  textAlign: "center",
                  display: "block",
                  marginTop: 2,
                  opacity: 0.85,
                  lineHeight: 1.7,
                  letterSpacing: 0.01,
                }}
              >
                Please check your inbox and follow the instructions to verify
                your account.
              </span>
            </div>
            <div
              className="flex items-center justify-center mt-1"
              style={{ width: "100%" }}
            >
              <div
                style={{
                  background: "var(--color-warning-bg, #fffbe6)",
                  color: "var(--color-warning-text, #b45309)",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: "10px 18px",
                  maxWidth: 440,
                  textAlign: "center",
                  // boxShadow: "0 4px 16px #fde68a33",
                  display: "inline-block",
                  marginTop: 2,
                  border: "1.5px solid var(--color-warning-border, #fde68a)",
                  letterSpacing: 0.1,
                  opacity: 0.97,
                }}
              >
                <span
                  role="img"
                  aria-label="warning"
                  style={{
                    fontSize: 18,
                    verticalAlign: "middle",
                    marginRight: 7,
                  }}
                >
                  ⚠️
                </span>
                <span
                  style={{
                    color: "var(--color-warning-text, #b45309)",
                    fontWeight: 800,
                  }}
                >
                  Don't reload this page or the timer will reset.
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          {resent ? (
            <div className="flex flex-col items-center mb-6">
              <div
                style={{
                  background: "var(--color-accent)",
                  borderRadius: "50%",
                  width: 70,
                  height: 70,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                  boxShadow: "0 2px 8px #f59e0b33",
                }}
              >
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
              <div
                style={{
                  color: "var(--color-primary)",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Verification email resent!
              </div>
              <div style={{ color: "var(--color-secondary)", fontSize: 13 }}>
                Please check your inbox.
              </div>
            </div>
          ) : error ? (
            <div
              className="text-base font-semibold mb-4"
              style={{
                fontSize: 16,
                color: "var(--color-error-text, #b91c1c)",
                background: "var(--color-error-bg, #fef2f2)",
                borderRadius: 12,
                padding: "13px 20px",
                margin: "0 auto",
                maxWidth: 440,
                marginBottom: 12,
                border: "1.5px solid var(--color-error-border, #fecaca)",
                // boxShadow: "0 6px 18px #fecaca33",
                letterSpacing: 0.1,
                opacity: 0.98,
              }}
            >
              <span
                role="img"
                aria-label="error"
                style={{
                  fontSize: 18,
                  verticalAlign: "middle",
                  marginRight: 7,
                }}
              >
                ❌
              </span>
              {error}
            </div>
          ) : showResend ? (
            <form onSubmit={handleResend}>
              <button
                type="submit"
                className="py-2 px-6 rounded font-bold transition hover:brightness-110 active:scale-95"
                style={{
                  background: "var(--color-accent)",
                  color: "#fff",
                  fontSize: 16,
                }}
                disabled={hasResent && timer > 0}
              >
                Resend Verification Email
              </button>
            </form>
          ) : (
            <div className="text-base text-gray-500" style={{ fontSize: 15 }}>
              You can resend in {formatTimer(timer)}
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="font-semibold underline-offset-2"
            style={{
              color: "var(--color-accent)",
              fontSize: 16,
              marginTop: 8,
              display: "inline-block",
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResendVerification
