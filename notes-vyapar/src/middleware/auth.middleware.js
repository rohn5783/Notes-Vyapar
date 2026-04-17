import jwt from "jsonwebtoken";

const unauthorizedResponse = (message) =>
  Response.json(
    {
      success: false,
      message
    },
    { status: 401 }
  );

export function authMiddleware(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return {
        success: false,
        response: unauthorizedResponse("Authorization token is required")
      };
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return {
        success: false,
        response: unauthorizedResponse("Authorization token is required")
      };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return {
        success: false,
        response: Response.json(
          {
            success: false,
            message: "JWT secret is not configured"
          },
          { status: 500 }
        )
      };
    }

    const decodedToken = jwt.verify(token, secret);

    return {
      success: true,
      userId: decodedToken.userId
    };
  } catch {
    return {
      success: false,
      response: unauthorizedResponse("Invalid or expired token")
    };
  }
}
