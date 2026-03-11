import { Router } from "express"
import { registerValidator, validate } from "../validators/auth.validators.js"
import { register } from "../controllers/auth.controller.js"

const authRouter = Router()

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
/* authRouter.post("/login") */

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
/* authRouter.get("/get-me") */

export default authRouter
