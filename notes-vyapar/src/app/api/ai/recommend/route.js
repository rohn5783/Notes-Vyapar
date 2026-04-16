export async function POST(req) {
  return new Response(JSON.stringify({ message: "src/app/api/ai/recommend/route.js route" }), {
    headers: { "Content-Type": "application/json" },
  });
}
