export async function DELETE(req) {
  return new Response(JSON.stringify({ message: "src/app/api/notes/delete/route.js route" }), {
    headers: { "Content-Type": "application/json" },
  });
}
