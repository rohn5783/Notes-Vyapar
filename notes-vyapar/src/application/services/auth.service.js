import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "@/domain/entities/User";
import { sendEmail } from "@/infrastructure/email/mailer";

const VERIFICATION_TOKEN_TTL_MS = 60 * 60 * 1000;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return secret;
};

const getAppUrl = () =>
  process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  isVerified: user.isVerified
});

const generateVerificationToken = () => crypto.randomBytes(32).toString("hex");

const sendVerificationMailToUser = async (user) => {
  const verificationUrl = `${getAppUrl()}/verify-email?token=${user.verificationToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your Notes Vyapar account",
    html: `
      <p>Hi ${user.name},</p>
      <p>Thank you for registering at <strong>Notes Vyapar</strong>.</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Best regards,<br />The Notes Vyapar Team</p>
    `,
    text: `Hi ${user.name}, verify your email by visiting: ${verificationUrl}`
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

export const registerUser = async (data) => {
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
  await sendVerificationMailToUser(savedUser);

  return {
    user: sanitizeUser(savedUser),
    emailVerificationSent: true
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
