import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator"
import { sendEmail } from "../services/mail.service.js"

export async function register(req, res) {

  const { username, email, password } = req.body

  try {
    const userExists = await userModel.findOne(
        { $or: [{ email }, { username }] },
    )
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
        err: 'User with this email or username already exists',
      })
    }

    const user = await userModel.create({ username, email, password })

    const emailVerificationToken = jwt.sign({
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
        email: user.email
      }
    })

  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({
      message: "Server error",
      success: false,
      err: 'An error occurred while registering the user',
    })
  }
}

export async function verifyEmail(req, res) {
  const { token } = req.query

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  const user = await userModel.findOne({email: decoded.email })
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: 'No user found with this email address',
    })
  }

  user.verified = true
  await user.save()

  const html = 
  `
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
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: 'No user found with this email address',
      })
    } 
    if (!user.verified) {
      return res.status(400).json({
        message: "Email not verified",
        success: false,
        err: 'Please verify your email address before logging in',
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: 'Incorrect password',
      })
    } 
    const token = jwt.sign({
      id: user._id,
      username: user.username,
      email: user.email,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    })
  } catch (error) {
    console.error("Error logging in user:", error)
    res.status(500).json({
      message: "Server error",
      success: false,
      err: 'An error occurred while logging in the user',
    })
  }

}