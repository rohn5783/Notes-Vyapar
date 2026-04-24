import { NextResponse } from "next/server";

import { verifyEmail } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";
import { resolveRequestBaseUrl } from "@/lib/request-url";

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

const createLoginRedirectUrl = (req, params = {}) => {
  const loginUrl = new URL("/login", resolveRequestBaseUrl(req));

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      loginUrl.searchParams.set(key, value);
    }
  });

  return loginUrl;
};

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        createLoginRedirectUrl(req, {
          verifyError: "Verification token is required"
        })
      );
    }

    const result = await verifyEmail(token);

    return NextResponse.redirect(
      createLoginRedirectUrl(req, {
        verified: "1",
        email: result.user?.email || ""
      })
    );
  } catch (error) {
    return NextResponse.redirect(
      createLoginRedirectUrl(req, {
        verifyError: error.message || "Email verification failed"
      })
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
