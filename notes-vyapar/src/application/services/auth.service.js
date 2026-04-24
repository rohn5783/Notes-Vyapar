import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "@/domain/entities/User";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/infrastructure/email/mailer";

const VERIFICATION_TOKEN_TTL_MS = 60 * 60 * 1000;
const RESET_PASSWORD_TOKEN_TTL_MS = 60 * 60 * 1000;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return secret;
};

const getAppUrl = () =>
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

const resolveAppUrl = (appUrl) => appUrl || getAppUrl();

const buildVerificationUrl = (token, appUrl) =>
  `${resolveAppUrl(appUrl)}/verify-email?token=${encodeURIComponent(token)}`;

const buildResetPasswordUrl = (token, appUrl) =>
  `${resolveAppUrl(appUrl)}/reset-password?token=${encodeURIComponent(token)}`;

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
  createdAt: user.createdAt
});

const generateVerificationToken = () => crypto.randomBytes(32).toString("hex");
const generateResetPasswordToken = () => crypto.randomBytes(32).toString("hex");

const isStrongPassword = (value) => typeof value === "string" && value.length >= 8 && /[^A-Za-z0-9]/.test(value);

const safeDecodeURIComponent = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeOpaqueToken = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const decodedOnce = safeDecodeURIComponent(value.trim());
  const decodedTwice = safeDecodeURIComponent(decodedOnce);
  const matchedToken = decodedTwice.toLowerCase().match(/[a-f0-9]{64}/);

  return matchedToken?.[0] || "";
};

const sendVerificationMailToUser = async (user, options = {}) => {
  const verificationUrl = buildVerificationUrl(user.verificationToken, options.appUrl);

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl
  });
};

const cleanupDuplicateUsers = async (savedUser, users = []) => {
  const duplicateIds = users
    .map((user) => user._id)
    .filter((id) => id.toString() !== savedUser._id.toString());

  if (duplicateIds.length) {
    await User.deleteMany({ _id: { $in: duplicateIds } });
  }
};

export const registerUser = async (data, options = {}) => {
  const name = data?.name?.trim();
  const normalizedEmail = data?.email?.trim().toLowerCase();
  const password = data?.password;

  if (!name || !normalizedEmail || !password) {
    throw new Error("Name, email, and password are required");
  }

  const users = await User.find({ email: normalizedEmail }).sort({
    isVerified: -1,
    updatedAt: -1,
    createdAt: -1
  });

  const verifiedUser = users.find((user) => user.isVerified);
  if (verifiedUser) {
    throw new Error("User already exists");
  }

  let user = users[0];

  if (!user) {
    user = new User({
      name,
      email: normalizedEmail,
      password,
      isVerified: false
    });
  } else {
    user.name = name;
    user.email = normalizedEmail;
    user.password = password;
    user.isVerified = false;
  }

  user.verificationToken = generateVerificationToken();
  user.verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  const savedUser = await user.save();
  await cleanupDuplicateUsers(savedUser, users.slice(1));
  let emailVerificationSent = false;

  try {
    await sendVerificationMailToUser(savedUser, options);
    emailVerificationSent = true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  return {
    user: sanitizeUser(savedUser),
    emailVerificationSent
  };
};

export const loginUser = async (data) => {
  const normalizedEmail = data?.email?.trim().toLowerCase();
  const password = data?.password;

  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required");
  }

  const users = await User.find({ email: normalizedEmail }).sort({
    isVerified: -1,
    updatedAt: -1,
    createdAt: -1
  });

  if (!users.length) {
    throw new Error("Account not found. Please register first");
  }

  const verifiedUsers = users.filter((user) => user.isVerified);

  if (!verifiedUsers.length) {
    throw new Error("Please verify your email before logging in");
  }

  let matchedUser = null;

  for (const user of verifiedUsers) {
    const isPasswordValid = await user.comparePassword(password);

    if (isPasswordValid) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { userId: matchedUser._id.toString() },
    getJwtSecret(),
    { expiresIn: "7d" }
  );

  return {
    token,
    user: sanitizeUser(matchedUser)
  };
};

export const requestPasswordReset = async (data, options = {}) => {
  const normalizedEmail = data?.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  const users = await User.find({ email: normalizedEmail }).sort({
    isVerified: -1,
    updatedAt: -1,
    createdAt: -1
  });

  if (!users.length) {
    return {
      success: true,
      message: "If an account exists for this email, password reset instructions have been sent."
    };
  }

  const user = users.find((account) => account.isVerified) || users[0];

  if (!user.isVerified) {
    return {
      success: false,
      requiresVerification: true,
      message: "Please verify your email first. You can resend the verification link below."
    };
  }

  const hasValidExistingResetToken =
    Boolean(user.passwordResetToken) &&
    user.passwordResetTokenExpiry &&
    new Date(user.passwordResetTokenExpiry).getTime() > Date.now();

  if (!hasValidExistingResetToken) {
    user.passwordResetToken = generateResetPasswordToken();
    user.passwordResetTokenExpiry = new Date(Date.now() + RESET_PASSWORD_TOKEN_TTL_MS);
  }

  await user.save();

  const resetUrl = buildResetPasswordUrl(user.passwordResetToken, options.appUrl);

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl
  });

  return {
    success: true,
    message: "Password reset link sent successfully."
  };
};

export const resetPassword = async (data) => {
  const token = normalizeOpaqueToken(data?.token);
  const password = data?.password;

  if (!token || !password) {
    throw new Error("Reset token and password are required");
  }

  if (!isStrongPassword(password)) {
    throw new Error("Password must be at least 8 characters long and include one symbol.");
  }

  const user = await User.findOne({ passwordResetToken: token });

  if (!user) {
    throw new Error("Invalid reset token. Please request a new password reset link.");
  }

  if (!user.passwordResetTokenExpiry || new Date(user.passwordResetTokenExpiry).getTime() <= Date.now()) {
    throw new Error("Reset token has expired. Please request a new password reset link.");
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetTokenExpiry = null;
  await user.save();

  return {
    success: true,
    message: "Password has been reset successfully."
  };
};

export const verifyEmail = async (token) => {
  if (!token) {
    throw new Error("Verification token is required");
  }

  const user = await User.findOneAndUpdate(
    {
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    },
    {
      $set: { isVerified: true },
      $unset: {
        verificationToken: 1,
        verificationTokenExpiry: 1
      }
    },
    { new: true }
  );

  if (!user) {
    throw new Error("Invalid, expired, or already used verification token");
  }

  await cleanupDuplicateUsers(user);

  return {
    success: true,
    message: "Email verified successfully",
    user: sanitizeUser(user)
  };
};
