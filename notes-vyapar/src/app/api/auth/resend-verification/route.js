import connectDB from "@/infrastructure/database/mongodb";
import User from "@/domain/entities/User";
import crypto from "crypto";
import { sendVerificationEmail } from "@/infrastructure/email/mailer";
import { resolveRequestBaseUrl } from "@/lib/request-url";

export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return Response.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return Response.json({ success: true, message: "Already verified" });
    }

    if (user.lastResend && Date.now() - user.lastResend < 60_000) {
      return Response.json(
        { success: false, message: "Wait 1 minute before retry" },
        { status: 429 }
      );
    }

    if (user.resendCount >= 5) {
      return Response.json(
        { success: false, message: "Too many attempts" },
        { status: 429 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;
    user.verificationTokenExpiry = Date.now() + 10 * 60 * 1000;
    user.lastResend = Date.now();
    user.resendCount += 1;

    await user.save();

    const appUrl = resolveRequestBaseUrl(req);
    const verifyLink = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;

    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl: verifyLink
    });

    return Response.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
