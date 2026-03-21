import { Router } from "express"

import {
  getMe,
  login,
  register,
  resendVerificationEmail,
  verifyEmail,
  getResendAttempts,
  checkVerified,
} from "../controllers/auth.controller.js"
import {
  loginValidator,
  registerValidator,
  validate,
} from "../validators/auth.validators.js"
import { authUser } from "../middlewares/auth.middleware.js"

const authRouter = Router()

// Public endpoint to check if an email is already verified
authRouter.get("/check-verified", checkVerified)

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/register", registerValidator, validate, register)

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.get("/resend-attempts", getResendAttempts)
authRouter.post("/login", loginValidator, login)

/**
 * @route GET /api/auth/logout
 * @desc Logout a user
 * @access Private
 */
/* authRouter.get("/logout")
 */
/**
 * @route GET /api/auth/get-me
 * @desc Get current user info
 * @access Private
 */
authRouter.get("/get-me", authUser, getMe)

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 */

authRouter.get("/verify-email", verifyEmail)

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend email verification link
 * @access Public
 */

authRouter.post("/resend-verification", resendVerificationEmail)

export default authRouter
