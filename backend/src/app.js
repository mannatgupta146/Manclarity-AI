import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"

const app = express()

// CORS middleware (must be first)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)

// Middleware
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRouter)

app.get("/", (req, res) => {
  res.send("Welcome to the Manclarity AI API")
})

export default app
