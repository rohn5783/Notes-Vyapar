import User from "@/domain/entities/User";
import connectDB from "@/infrastructure/database/mongodb";
import { authMiddleware } from "@/middleware/auth.middleware";

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
  createdAt: user.createdAt
});

export async function GET(req) {
  const authResult = authMiddleware(req);

  if (!authResult.success) {
    return authResult.response;
  }

  try {
    await connectDB();

    const user = await User.findById(authResult.userId);

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found"
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || "Something went wrong"
      },
      { status: 500 }
    );
  }
}
