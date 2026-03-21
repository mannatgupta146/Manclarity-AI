import React, { useEffect, useRef, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useAuth } from "../hooks/useAuth"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const { handleVerifyEmail } = useAuth()
  const verifyStatus = useSelector((state) => state.auth.verifyStatus)
  const verifyMessage = useSelector((state) => state.auth.verifyMessage)

  const alreadyVerified =
    verifyStatus === "error" &&
    verifyMessage &&
    verifyMessage.toLowerCase().includes("already verified")

  const attemptedToken = useRef(null)

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      handleVerifyEmail(null)
      attemptedToken.current = null
      return
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload.email) setVerifiedEmail(payload.email)
    } catch {
      setVerifiedEmail("")
    }

    if (attemptedToken.current === token) return

    attemptedToken.current = token
    handleVerifyEmail(token)
  }, [searchParams, handleVerifyEmail])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative px-4"
      style={{ background: "var(--color-bg)" }}
    >
      <ThemeToggleButton />

      <div
        className="p-10 rounded-3xl w-full max-w-lg border flex flex-col items-center text-center"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.07)",
        }}
      >
        {/* TITLE */}
        <h2
          className="text-3xl font-extrabold"
          style={{
            color: "var(--color-accent)",
            letterSpacing: 0.3,
            marginBottom: verifyStatus === "error" ? 12 : 20,
          }}
        >
          {verifyStatus === "success"
            ? "Email Verified!"
            : verifyStatus === "pending"
              ? "Verifying Email..."
              : verifyStatus === "error"
                ? "Verification Failed"
                : "Verify Email"}
        </h2>

        {/* SUCCESS */}
        {verifyStatus === "success" && (
          <div className="flex flex-col items-center">
            <div
              style={{
                background: "#fbbf24",
                borderRadius: "50%",
                width: 72,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                boxShadow: "0 3px 10px #fbbf2430",
              }}
            >
              <svg
                width="42"
                height="42"
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
                color: "var(--color-accent)",
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 10,
              }}
            >
              Welcome{verifiedEmail ? `, ${verifiedEmail}` : "!"}
            </div>

            <div
              style={{
                color: "var(--color-secondary)",
                fontSize: 15.5,
                marginBottom: 14,
                maxWidth: 420,
                lineHeight: 1.6,
              }}
            >
              Your email has been successfully verified. You can now log in and
              enjoy all the features of Manclarity AI.
            </div>

            <Link
              to="/login"
              className="font-semibold underline-offset-2"
              style={{
                color: "var(--color-accent)",
                fontSize: 18,
                marginTop: 6,
                display: "inline-block",
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* ERROR / ALREADY VERIFIED */}
        {(verifyStatus === "error" || alreadyVerified) && (
          <div className="flex flex-col items-center mt-2">
            
            {/* ICON */}
            <div
              style={{
                background: "rgba(251,191,36,0.13)",
                borderRadius: "50%",
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <span
                role="img"
                aria-label="warning"
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                }}
              >
                ⚠️
              </span>
            </div>

            {/* MESSAGE */}
            <div
              style={{
                color: "var(--color-warning-text, #b45309)",
                fontSize: 18.5,
                fontWeight: 800,
                marginBottom: 18,
                letterSpacing: 0.2,
              }}
            >
              {verifyMessage && verifyMessage.toLowerCase().includes("expired")
                ? "Verification link expired"
                : verifyMessage &&
                    verifyMessage.toLowerCase().includes("not found")
                  ? "Invalid or broken link"
                  : alreadyVerified
                    ? "Your email is already verified!"
                    : verifyMessage ||
                      "Verification failed. Please try again later."}
            </div>

            {/* INFO BOX */}
            <div
              style={{
                background: "var(--color-warning-info-bg, #fffbe6)",
                color: "var(--color-warning-info-text, #222)",
                fontSize: 15.5,
                borderRadius: 14,
                padding: "18px 22px",
                marginBottom: 26,
                maxWidth: 480,
                border: "1.5px solid var(--color-warning-border, #fde68a)",
                lineHeight: 1.5,
              }}
            >
              <span style={{ marginRight: 6 }}>ℹ️</span>
              <span>
                {verifyMessage &&
                verifyMessage.toLowerCase().includes("expired")
                  ? "Your verification link has expired. Please request a new verification email."
                  : verifyMessage &&
                      verifyMessage.toLowerCase().includes("not found")
                    ? "This verification link is invalid or has already been used. Please request a new one."
                    : alreadyVerified
                      ? "You can now log in and enjoy all the features of Manclarity AI."
                      : "This may be due to an invalid or already used link. Please try again or contact support."}
              </span>
            </div>

            <Link
              to="/login"
              className="font-semibold underline-offset-2"
              style={{
                color: "var(--color-accent)",
                fontSize: 18,
                marginTop: 6,
                display: "inline-block",
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail