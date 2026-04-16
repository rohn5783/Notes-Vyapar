export async function GET(req) {
  return new Response(JSON.stringify({ message: "src/app/api/admin/stats/route.js route" }), {
    headers: { "Content-Type": "application/json" },
  });
}
