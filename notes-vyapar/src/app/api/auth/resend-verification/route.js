import {connectDB} from "@/lib/db";
import User from "@models/User";
import crypto from "crypto";
import {sendEmail} from "@/lib/email";




export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return Response.json({ message: "Already verified" });
    }

    // ⏳ Cooldown check (1 min)
    if (user.lastResend && Date.now() - user.lastResend < 60000) {
      return Response.json(
        { message: "Wait 1 minute before retry" },
        { status: 429 }
      );
    }

    // 🛑 Limit attempts
    if (user.resendCount >= 5) {
      return Response.json(
        { message: "Too many attempts" },
        { status: 429 }
      );
    }

    // 🔐 New token generate
    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;
    user.verificationTokenExpiry = Date.now() + 10 * 60 * 1000;
    user.lastResend = Date.now();
    user.resendCount += 1;

    await user.save();

    // 📩 Send email
    const verifyLink = `http://localhost:3000/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `<a href="${verifyLink}">Click to verify</a>`
    });

    return Response.json({ message: "Verification email sent" });

  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}