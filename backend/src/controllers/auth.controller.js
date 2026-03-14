import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { sendEmail } from "../services/mail.service.js"

export async function register(req, res) {
  const { username, email, password } = req.body

  try {
    const userExists = await userModel.findOne({
      $or: [{ email }, { username }],
    })

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
        err: "User with this email or username already exists",
      })
    }

    const user = await userModel.create({ username, email, password })

    const emailVerificationToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    )

    await sendEmail({
      to: user.email,
      subject: "Welcome to Manclarity AI",
      html: `
        <h2>Welcome to Manclarity AI, ${username}!</h2>
        <p>Thank you for registering. We're excited to have you on board!</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="http://localhost:5173/verify-email?token=${emailVerificationToken}">
          Verify Email
        </a>
        <p>If you have any questions or need assistance, feel free to reach out.</p>
        <p>Best regards,<br/>The Manclarity AI Team</p>
      `,
    })

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Error registering user:", error)

    res.status(500).json({
      message: "Server error",
      success: false,
      err: "An error occurred while registering the user",
    })
  }
}

export async function verifyEmail(req, res) {
  const { token } = req.query

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userModel.findOne({ email: decoded.email })

    if (!user) {
      return res.status(404).send(`
        <h2>User not found</h2>
        <p>No account exists for this verification link.</p>
      `)
    }

    // If already verified
    if (user.verified) {
      return res.send(`
        <html>
          <body style="font-family:sans-serif;text-align:center;padding-top:50px">
            <h2>Email Already Verified</h2>
            <p>Your email is already verified.</p>
            <a href="http://localhost:5173/login">Go to Login</a>
          </body>
        </html>
      `)
    }

    user.verified = true
    await user.save()

    return res.send(`
      <html>
        <body style="font-family:sans-serif;text-align:center;padding-top:50px">
          <h2>Email Verified Successfully</h2>
          <p>Your account is now active.</p>
          <a href="http://localhost:5173/login">Login to Manclarity</a>
        </body>
      </html>
    `)

  } catch (err) {
    return res.status(400).send(`
      <html>
        <body style="font-family:sans-serif;text-align:center;padding-top:50px">
          <h2>Invalid or Expired Link</h2>
          <p>This verification link is invalid or has expired.</p>
          <a href="http://localhost:5173/resend-verification">Resend verification email</a>
        </body>
      </html>
    `)
  }
}

export async function resendVerificationEmail(req, res) {
  const { email } = req.body

  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      })
    }

    if (user.verified) {
      return res.status(400).json({
        message: "Email already verified",
        success: false,
      })
    }

    const emailVerificationToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    )

    await sendEmail({
      to: user.email,
      subject: "Verify your email - Manclarity AI",
      html: `
        <h2>Hello ${user.username}</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">
          Verify Email
        </a>
      `,
    })

    res.json({
      message: "Verification email resent",
      success: true,
    })

  } catch (error) {
    console.error("Error resending verification email:", error)

    res.status(500).json({
      message: "Server error",
      success: false,
    })
  }
}

export async function login(req, res) {
  const { email, password } = req.body

  try {
    const user = await userModel.findOne({ email }).select("+password")

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      })
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Email not verified",
        success: false,
      })
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })

  } catch (error) {
    console.error("Error logging in user:", error)

    res.status(500).json({
      message: "Server error",
      success: false,
    })
  }
}

export async function getMe(req, res) {
  const userId = req.user.id

  try {
    const user = await userModel.findById(userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      })
    }

    res.json({
      message: "User info retrieved successfully",
      success: true,
      user,
    })

  } catch (error) {
    console.error("Error retrieving user info:", error)

    res.status(500).json({
      message: "Server error",
      success: false,
    })
  }
}