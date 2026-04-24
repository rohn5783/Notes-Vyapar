const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const normalizeBaseUrl = (value) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return "";
  }
};

const isLocalBaseUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return LOCAL_HOSTNAMES.has(parsed.hostname);
  } catch {
    return false;
  }
};

const resolveRequestOrigin = (req) => {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  if (!host) {
    return "";
  }

  return normalizeBaseUrl(`${proto}://${host}`);
};

export const resolveRequestBaseUrl = (req) => {
  const configuredCandidates = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL
  ]
    .map(normalizeBaseUrl)
    .filter(Boolean);

  const requestOrigin = resolveRequestOrigin(req);

  if (requestOrigin && !isLocalBaseUrl(requestOrigin)) {
    return requestOrigin;
  }

  const publicConfiguredOrigin = configuredCandidates.find((candidate) => !isLocalBaseUrl(candidate));
  if (publicConfiguredOrigin) {
    return publicConfiguredOrigin;
  }

  if (requestOrigin) {
    return requestOrigin;
  }

  if (configuredCandidates.length) {
    return configuredCandidates[0];
  }

  return "http://localhost:3000";
};

