export async function POST(req) {
  return new Response(JSON.stringify({ message: "src/app/api/auth/logout/route.js route" }), {
    headers: { "Content-Type": "application/json" },
  });
}
