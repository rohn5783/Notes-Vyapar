import { registerUser } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const user = await registerUser(body);

    return Response.json({
      message: "User registered",
      user
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}