import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useChat } from "../hooks/useChat"

const Dashboard = () => {
  const chat = useChat()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true })
      return
    }
    chat.initializeSocketConnection()
  }, [user, navigate, chat])

  if (!user) {
    // Optionally render nothing or a loading spinner while redirecting
    return null
  }

  return <div>Dashboard</div>
}

export default Dashboard
