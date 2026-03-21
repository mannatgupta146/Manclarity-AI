import React, { useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useAuth } from "../hooks/useAuth"

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const { handleVerifyEmail } = useAuth()
  const verifyStatus = useSelector((state) => state.auth.verifyStatus)
  const verifyMessage = useSelector((state) => state.auth.verifyMessage)

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      handleVerifyEmail(null)
      return
    }
    handleVerifyEmail(token)
  }, [searchParams, handleVerifyEmail])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="p-8 rounded-3xl shadow-lg w-full max-w-lg border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--color-accent)" }}
        >
          Email Verification
        </h2>
        {verifyStatus === "pending" && (
          <p style={{ color: "var(--color-secondary)" }}>
            Verifying your email...
          </p>
        )}
        {verifyStatus !== "pending" && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: verifyMessage }}
          />
        )}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="font-medium underline-offset-2 custom-link"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
