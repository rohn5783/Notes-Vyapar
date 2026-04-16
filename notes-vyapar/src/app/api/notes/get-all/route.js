export async function GET(req) {
  return new Response(JSON.stringify({ message: "src/app/api/notes/get-all/route.js route" }), {
    headers: { "Content-Type": "application/json" },
  });
}
