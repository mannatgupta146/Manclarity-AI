import React, { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState("pending")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setStatus("error")
      setMessage("No verification token provided.")
      return
    }
    setStatus("pending")
    fetch(`http://localhost:3000/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const text = await res.text()
        if (res.ok) {
          setStatus("success")
          setMessage(text)
        } else {
          setStatus("error")
          setMessage(text)
        }
      })
      .catch((err) => {
        setStatus("error")
        setMessage("Verification failed. Please try again later.")
      })
  }, [searchParams])

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
        {status === "pending" && (
          <p style={{ color: "var(--color-secondary)" }}>
            Verifying your email...
          </p>
        )}
        {status !== "pending" && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: message }}
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
