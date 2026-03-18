import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import morgan from "morgan"
import chatRouter from "./routes/chat.routes.js"

const app = express()

// CORS middleware (must be first)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
)

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))

// Routes
app.use("/api/auth", authRouter)
app.use("/api/chats", chatRouter)

app.get("/", (req, res) => {
  res.send("Welcome to the Manclarity AI API")
})

export default app
