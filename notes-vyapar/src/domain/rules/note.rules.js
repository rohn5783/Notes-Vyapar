export function validateNotePayload(payload) {
  return payload && payload.title && payload.content;
}
