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
    <div className="flex flex-col items-center justify-center min-h-screen relative px-4 bg-(--color-bg)">
      <ThemeToggleButton />

      <div className="p-10 rounded-3xl w-full max-w-lg border flex flex-col items-center text-center bg-(--color-card) border-(--color-border) shadow-[0_6px_24px_rgba(0,0,0,0.07)]">
        {/* TITLE */}
        <h2
          className={`text-3xl font-extrabold text-(--color-accent) tracking-[0.3px] ${verifyStatus === "error" ? "mb-3" : "mb-5"}`}
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
            <div className="flex items-center justify-center mb-5 w-18 h-18 rounded-full bg-yellow-400 [box-shadow:0_3px_10px_#fbbf2430]">
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

            <div className="text-(--color-accent) font-bold text-[20px] mb-2.5">
              Welcome{verifiedEmail ? `, ${verifiedEmail}` : "!"}
            </div>

            <div className="text-(--color-secondary) text-[15.5px] mb-3.5 max-w-105 leading-[1.6]">
              Your email has been successfully verified. You can now log in and
              enjoy all the features of Manclarity AI.
            </div>
            <Link
              to="/login"
              className="font-bold underline-offset-2 text-(--color-accent) text-[18px] mt-1.5 inline-block tracking-[0.2px]"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* ERROR / ALREADY VERIFIED */}
        {(verifyStatus === "error" || alreadyVerified) && (
          <div className="flex flex-col items-center mt-2">
            {/* ICON */}
            <div className="flex items-center justify-center mb-4.5 w-16 h-16 rounded-full bg-[rgba(251,191,36,0.13)]">
              <span
                role="img"
                aria-label="warning"
                className="text-[32px] leading-none"
              >
                ⚠️
              </span>
            </div>

            {/* MESSAGE */}
            <div className="text-(--color-warning-text,#b45309) text-[18.5px] font-extrabold mb-4.5 tracking-[0.2px]">
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
            <div className="bg-(--color-warning-info-bg,#fffbe6) text-(--color-warning-info-text,#222) text-[15.5px] rounded-[14px] px-5.5 py-4.5 mb-6.5 max-w-120 border-[1.5px] border-(--color-warning-border,#fde68a) leading-normal flex items-start">
              <span className="mr-1.5">ℹ️</span>
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
              className="font-bold underline-offset-2 text-(--color-accent) text-[18px] mt-1.5 inline-block tracking-[0.2px]"
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
