import os from "os";

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

const getLocalNetworkAddress = () => {
  const interfaces = os.networkInterfaces();

  for (const interfaceList of Object.values(interfaces)) {
    for (const iface of interfaceList || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "";
};

const getLocalNetworkBaseUrl = (defaultOrigin = "http://localhost:3000") => {
  const networkAddress = getLocalNetworkAddress();
  if (!networkAddress) {
    return "";
  }

  try {
    const parsed = new URL(defaultOrigin);
    const port = parsed.port || "3000";
    const protocol = parsed.protocol.replace(":", "");

    return `${protocol}://${networkAddress}:${port}`;
  } catch {
    return `http://${networkAddress}:3000`;
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
    const localNetworkOrigin = getLocalNetworkBaseUrl(requestOrigin);
    return localNetworkOrigin || requestOrigin;
  }

  const localNetworkOrigin = getLocalNetworkBaseUrl(configuredCandidates[0] || "http://localhost:3000");
  if (localNetworkOrigin) {
    return localNetworkOrigin;
  }

  if (configuredCandidates.length) {
    return configuredCandidates[0];
  }

  return "http://localhost:3000";
};

