import React, { useEffect, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useAuth } from "../hooks/useAuth"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const { handleVerifyEmail } = useAuth()
  const verifyStatus = useSelector((state) => state.auth.verifyStatus)
  const verifyMessage = useSelector((state) => state.auth.verifyMessage)

  // Detect if the backend message is 'already verified'
  const alreadyVerified =
    verifyStatus === "error" &&
    verifyMessage &&
    verifyMessage.toLowerCase().includes("already verified")

  // Prevent repeated API calls for the same token
  const attemptedToken = useRef(null)
  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      handleVerifyEmail(null)
      attemptedToken.current = null
      return
    }
    if (attemptedToken.current === token) return
    attemptedToken.current = token
    handleVerifyEmail(token)
  }, [searchParams, handleVerifyEmail])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative"
      style={{ background: "var(--color-bg)" }}
    >
      <ThemeToggleButton />
      <div
        className="p-10 rounded-3xl w-full max-w-lg border flex flex-col items-center"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
        }}
      >
        <h2
          className="text-2xl font-extrabold text-center"
          style={{
            color: "var(--color-accent)",
            letterSpacing: 0.2,
            marginBottom: verifyStatus === "error" ? 8 : 16,
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
        {(verifyStatus === "error" || alreadyVerified) && (
          <div className="text-center mt-2 flex flex-col items-center">
            <div
              style={{
                background: "rgba(251,191,36,0.13)",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "8px 0 18px 0",
                boxShadow: "0 1px 6px 0 rgba(251,191,36,0.10)",
                opacity: 1,
              }}
            >
              <span
                role="img"
                aria-label="warning"
                style={{
                  fontSize: 30,
                  display: "block",
                }}
              >
                ⚠️
              </span>
            </div>
            <div
              style={{
                color: "var(--color-warning-text, #b45309)",
                fontSize: 19,
                fontWeight: 800,
                marginBottom: 22,
                textAlign: "center",
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
            <div
              style={{
                background: "var(--color-warning-info-bg, #fffbe6)",
                color: "var(--color-warning-info-text, #222)",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 16,
                padding: "22px 28px",
                marginBottom: 28,
                marginTop: 0,
                maxWidth: 520,
                textAlign: "center",
                boxShadow: "0 1.5px 8px 0 rgba(251,191,36,0.10)",
                border: "1.5px solid var(--color-warning-border, #fde68a)",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              <span
                role="img"
                aria-label="info"
                style={{
                  fontSize: 18,
                  verticalAlign: "middle",
                  marginRight: 10,
                }}
              >
                ℹ️
              </span>
              <span style={{ color: "inherit", fontWeight: 500 }}>
                {verifyMessage &&
                verifyMessage.toLowerCase().includes("expired")
                  ? "Your verification link has expired. Please request a new verification email."
                  : verifyMessage &&
                      verifyMessage.toLowerCase().includes("not found")
                    ? "This verification link is invalid or has already been used. Please request a new one."
                    : alreadyVerified
                      ? "You can now log in and enjoy all the features of Manclarity AI."
                      : "This may be due to an invalid, broken, or already used verification link, or a server issue. Please check your email for the correct link or contact support if the problem persists."}
              </span>
            </div>
            <Link
              to="/login"
              className="font-semibold underline-offset-2"
              style={{
                color: "var(--color-accent)",
                fontSize: 18,
                marginTop: 8,
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
