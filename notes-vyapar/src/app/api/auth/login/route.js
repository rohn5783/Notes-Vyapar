import { loginUser } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";

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

    return Response.json({
      success: true,
      message: "Login successful",
      token,
      user:{
        id: user._id,
        role: user.role,
        email: user.email,
      }
    });
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
