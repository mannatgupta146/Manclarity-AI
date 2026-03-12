import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator"
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
        id: user._id,
      },
      process.env.JWT_SECRET,
    )

    await sendEmail({
      to: email,
      subject: "Welcome to Manclarity AI",
      html: `
        <h2>Welcome to Manclarity AI, ${username}!</h2>
        <p>Thank you for registering. We're excited to have you on board!</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>,
        <p>Best regards,<br/>The Manclarity AI Team</p>`,
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

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  const user = await userModel.findOne({ email: decoded.email })
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "No user found with this email address",
    })
  }

  user.verified = true
  await user.save()

  const html = `
    <h2>Email Verified Successfully</h2>
    <p>Thank you for verifying your email address. Your account is now active.</p>
    <p>You can now log in to your account and start using Manclarity AI.</p>
    <p>Best regards,<br/>The Manclarity AI Team</p>
  `

  res.send(html)
}

export async function login(req, res) {
  const { email, password } = req.body

  try {
    const user = await userModel.findOne({ email }).select("+password")
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "No user found with this email address",
      })
    }
    if (!user.verified) {
      return res.status(400).json({
        message: "Email not verified",
        success: false,
        err: "Please verify your email address before logging in",
      })
    }
    if (!user.password) {
      return res.status(500).json({
        message: "User password not set. Please contact support.",
        success: false,
        err: "Password missing in user record",
      })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "Incorrect password",
      })
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Set token as httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
      err: "An error occurred while logging in the user",
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
        err: "No user found with this ID",
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
      err: "An error occurred while retrieving user information",
    })
  }
}
