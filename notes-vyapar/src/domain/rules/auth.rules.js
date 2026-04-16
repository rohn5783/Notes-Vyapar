export function validateAuthPayload(payload) {
  return payload && payload.email && payload.password;
}
