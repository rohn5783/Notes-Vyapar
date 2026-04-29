import { loginUser } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";
import { AUTH_COOKIE_NAME } from "@/middleware/auth.middleware";
import { NextResponse } from "next/server";

const getStatusCode = (message) => {
  switch (message) {
    case "Email and password are required":
      return 400;
    case "Account not found. Please register first":
      return 404;
    case "Invalid email or password":
      return 401;
    case "Please verify your email before logging in":
      return 403;
    case "JWT secret is not configured":
      return 500;
    default:
      return 500;
  }
};

export async function POST(req) {



  // if (!user.isVerified) {
  // return Response.json(
  //   {
  //     message: "Email not verified",
  //     isVerified: false,
  //     email: user.email
  //   },
  //   { status: 403 }
  // );

  try {
    await connectDB();

    const body = await req.json();
    const { token, user } = await loginUser(body);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || "Something went wrong"
      },
      { status: getStatusCode(error.message) }
    );
  }
  
}
