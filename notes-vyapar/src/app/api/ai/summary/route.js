export async function POST(req) {
  return new Response(JSON.stringify({ message: "src/app/api/ai/summary/route.js route" }), {
    headers: { "Content-Type": "application/json" },
  });
}
