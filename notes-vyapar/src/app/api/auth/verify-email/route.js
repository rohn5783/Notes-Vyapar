import { NextResponse } from "next/server";

import User from "@/domain/entities/User";
import connectDB from "@/infrastructure/database/mongodb";

const getStatusCode = (message) => {
  switch (message) {
    case "Verification token is required":
      return 400;
    case "Invalid, expired, or already used verification token":
      return 401;
    default:
      return 500;
  }
};

const removeDuplicateUsers = async (user) => {
  await User.deleteMany({
    email: user.email,
    _id: { $ne: user._id }
  });
};

const verifyEmail = async (token) => {
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

  await removeDuplicateUsers(user);
  return user;
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Verification token is required"
        },
        { status: 400 }
      );
    }

    const redirectUrl = new URL(`/verify-email?token=${encodeURIComponent(token)}`, req.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const message = error.message || "Something went wrong";

    return Response.json(
      {
        success: false,
        message
      },
      { status: getStatusCode(message) }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    await verifyEmail(body.token);

    return Response.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    const message = error.message || "Something went wrong";

    return Response.json(
      {
        success: false,
        message
      },
      { status: getStatusCode(message) }
    );
  }
}
