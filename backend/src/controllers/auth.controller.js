import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { sendEmail } from "../services/mail.service.js"

export async function register(req, res) {
  const { username, email, password } = req.body

  try {
    let userExists = await userModel.findOne({
      $or: [{ email }, { username }],
    })

    if (userExists) {
      if (userExists.verified) {
        return res.status(400).json({
          message: "User already exists",
          success: false,
          err: "User with this email or username already exists",
        })
      } else {
        // Not verified: update username/password and resend verification
        userExists.username = username
        userExists.password = password
        await userExists.save()
        const emailVerificationToken = jwt.sign(
          {
            email: userExists.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "10m" },
        )
        try {
          await sendEmail({
            to: userExists.email,
            subject: "Verify your email - Manclarity AI",
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px #f59e0b33; padding: 36px 28px;">
                <h2 style="color: #1f2937; margin-bottom: 14px; font-size: 2rem; letter-spacing: 0.5px;">Verify Your Email</h2>
                <p style="font-size: 17px; margin-bottom: 10px; color: #1f2937;">Welcome, <span style="font-weight: bold; color: #f59e0b;">${username}</span>!</p>
                <p style="font-size: 15px; margin-bottom: 18px; color: #444;">Thank you for registering with <span style="font-weight: bold; color: #f59e0b;">Manclarity AI</span>.</p>
                <p style="font-size: 15px; margin-bottom: 20px; color: #444;">To activate your account, please verify your email address by clicking the button below.<br><span style="color: #E53E3E; font-weight: bold;">This link will expire in 10 minutes.</span></p>
                <a href="http://localhost:5173/verify-email?token=${emailVerificationToken}" style="display: inline-block; background: #f59e0b; color: #1f2937; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 22px; box-shadow: 0 2px 8px #fb923c55; transition: background 0.2s;">Verify Email</a>
                <p style="font-size: 13px; color: #888; margin-top: 22px;">If you did not request this, you can safely ignore this email.</p>
                <p style="font-size: 13px; color: #888;">Need help? Just reply to this email.</p>
                <p style="font-size: 13px; color: #1f2937; margin-top: 28px;">Best regards,<br><span style="font-weight: bold; color: #f59e0b;">The Manclarity AI Team</span></p>
              </div>
            `,
          })
        } catch (emailError) {
          return res.status(500).json({
            message:
              "Failed to send verification email. Please try again later.",
            success: false,
            err: emailError.message || emailError,
          })
        }
        return res.status(200).json({
          message: "Verification email resent. Please check your inbox.",
          success: true,
          user: {
            id: userExists._id,
            username: userExists.username,
            email: userExists.email,
          },
        })
      }
    }

    // Create a temp user object but do not save yet
    const tempUser = new userModel({ username, email, password })

    const emailVerificationToken = jwt.sign(
      {
        email: tempUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    )

    try {
      await sendEmail({
        to: tempUser.email,
        subject: "Verify your email - Manclarity AI",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px #f59e0b33; padding: 36px 28px;">
            <h2 style="color: #1f2937; margin-bottom: 14px; font-size: 2rem; letter-spacing: 0.5px;">Verify Your Email</h2>
            <p style="font-size: 17px; margin-bottom: 10px; color: #1f2937;">Welcome, <span style="font-weight: bold; color: #f59e0b;">${username}</span>!</p>
            <p style="font-size: 15px; margin-bottom: 18px; color: #444;">Thank you for registering with <span style="font-weight: bold; color: #f59e0b;">Manclarity AI</span>.</p>
            <p style="font-size: 15px; margin-bottom: 20px; color: #444;">To activate your account, please verify your email address by clicking the button below.<br><span style="color: #E53E3E; font-weight: bold;">This link will expire in 10 minutes.</span></p>
            <a href="http://localhost:5173/verify-email?token=${emailVerificationToken}" style="display: inline-block; background: #f59e0b; color: #1f2937; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 22px; box-shadow: 0 2px 8px #fb923c55; transition: background 0.2s;">Verify Email</a>
            <p style="font-size: 13px; color: #888; margin-top: 22px;">If you did not request this, you can safely ignore this email.</p>
            <p style="font-size: 13px; color: #888;">Need help? Just reply to this email.</p>
            <p style="font-size: 13px; color: #1f2937; margin-top: 28px;">Best regards,<br><span style="font-weight: bold; color: #f59e0b;">The Manclarity AI Team</span></p>
          </div>
        `,
      })
    } catch (emailError) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
        success: false,
        err: emailError.message || emailError,
      })
    }

    // Only save user if email sent successfully
    const user = await tempUser.save()

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
    user.resendAttempts = 0 // Reset attempts on successful verification
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

export async function getResendAttempts(req, res) {
  const { email } = req.query
  if (!email) {
    return res.status(400).json({ message: "Email required", success: false })
  }
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false })
    }
    return res.json({ resendAttempts: user.resendAttempts || 0, success: true })
  } catch (err) {
    return res.status(500).json({ message: "Server error", success: false })
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
    // 5 min cooldown logic: allow first resend immediately after registration
    const now = Date.now();
    // If cooldown has passed, reset attempts
    if (
      user.lastResend &&
      now - new Date(user.lastResend).getTime() >= 5 * 60 * 1000
    ) {
      user.resendAttempts = 0;
      await user.save();
    }
    // Only enforce cooldown if at least one resend has already happened
    if (user.resendAttempts >= 1) {
      if (
        user.lastResend &&
        now - new Date(user.lastResend).getTime() < 5 * 60 * 1000
      ) {
        const wait = 5 * 60 * 1000 - (now - new Date(user.lastResend).getTime());
        const min = Math.floor(wait / 60000);
        const sec = Math.floor((wait % 60000) / 1000);
        return res.status(429).json({
          message: `Please wait ${min}:${sec.toString().padStart(2, "0")} before resending.`,
          success: false,
        });
      }
      // If cooldown passed, allow resend and increment attempts
    }
    user.lastResend = new Date();
    user.resendAttempts = (user.resendAttempts || 0) + 1;
    await user.save();
    const emailVerificationToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    )
    await sendEmail({
      to: user.email,
      subject: "Verify your email - Manclarity AI",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px #f59e0b33; padding: 36px 28px;">
          <h2 style="color: #1f2937; margin-bottom: 14px; font-size: 2rem; letter-spacing: 0.5px;">Verify Your Email</h2>
          <p style="font-size: 17px; margin-bottom: 10px; color: #1f2937;">Welcome back, <span style="font-weight: bold; color: #f59e0b;">${user.username}</span>!</p>
          <p style="font-size: 15px; margin-bottom: 18px; color: #444;">To activate your account, please verify your email address by clicking the button below.<br><span style="color: #E53E3E; font-weight: bold;">This link will expire in 10 minutes.</span></p>
          <a href="http://localhost:5173/verify-email?token=${emailVerificationToken}" style="display: inline-block; background: #f59e0b; color: #1f2937; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 22px; box-shadow: 0 2px 8px #fb923c55; transition: background 0.2s;">Verify Email</a>
          <p style="font-size: 13px; color: #888; margin-top: 22px;">If you did not request this, you can safely ignore this email.</p>
          <p style="font-size: 13px; color: #888;">Need help? Just reply to this email.</p>
          <p style="font-size: 13px; color: #1f2937; margin-top: 28px;">Best regards,<br><span style="font-weight: bold; color: #f59e0b;">The Manclarity AI Team</span></p>
        </div>
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
      { expiresIn: "7d" },
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
