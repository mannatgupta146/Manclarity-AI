import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastResend: {
      type: Date,
      default: null,
    },
    resendAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error("Password is not set for this user.")
  }
  return await bcrypt.compare(candidatePassword, this.password)
}

const userModel = mongoose.model("users", userSchema)

export default userModel
