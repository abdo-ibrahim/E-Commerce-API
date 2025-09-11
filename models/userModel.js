const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      trim: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "firstName is required"],
    },
    lastName: {
      type: String,
      required: [true, "lastName is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    confirmPassword: {
      type: String,
      required: [true, "confirmPassword is required"],
      select: false,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords does not match",
      },
    },
    profilePicture: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        public_id: null,
      },
    },
    role: { type: String, default: "User", enum: ["User", "Admin"] },
    addresses: [
      {
        addressLine1: { type: String, required: [true, "addressLine1 is required"], trim: true },
        addressLine2: { type: String, trim: true },
        phone: { type: String, trim: true },
        country: { type: String, required: [true, "country is required"], trim: true },
        city: { type: String, required: [true, "city is required"], trim: true },
      },
    ],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});
// compare the password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// hash the password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
  }

  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});
// to check if the password was changed
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
// create a reset token
userSchema.methods.createResetPasswordToken = function () {
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
