import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator"
import { sendEmail } from "../services/mail.service.js"

export async function register(req, res) {
  // Handle validation errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

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

    await sendEmail({
        to: email,
        subject: "Welcome to Manclarity AI",
        html: `
        <h1>Welcome to Manclarity AI, ${username}!</h1>
        <p>Thank you for registering. We're excited to have you on board!</p>
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
