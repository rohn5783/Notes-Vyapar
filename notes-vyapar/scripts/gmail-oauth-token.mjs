import fs from "fs";
import path from "path";
import "dotenv/config";

const projectRoot = process.cwd();
const envFilePath = path.join(projectRoot, ".env");
const defaultRedirectUri = "https://developers.google.com/oauthplayground";
const defaultScope = "https://www.googleapis.com/auth/gmail.send";

const args = process.argv.slice(2);
const hasArg = (name) => args.includes(name);
const getArgValue = (name) => {
  const index = args.indexOf(name);
  if (index === -1) {
    return "";
  }

  return args[index + 1] || "";
};

const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri;
const redirectUri = getArgValue("--redirect-uri") || configuredRedirectUri;
const scope = getArgValue("--scope") || defaultScope;
const code = getArgValue("--code");

if (!clientId || !clientSecret) {
  console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
  process.exit(1);
}

if (hasArg("--auth-url")) {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  console.log("Open this URL and approve access:");
  console.log(authUrl.toString());
  console.log("");
  console.log("Then run:");
  console.log("npm run oauth:gmail -- --code \"<PASTE_AUTH_CODE>\"");
  process.exit(0);
}

if (!code) {
  console.error("Missing --code argument. Run with --auth-url first.");
  process.exit(1);
}

const tokenBody = new URLSearchParams({
  code,
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uri: redirectUri,
  grant_type: "authorization_code"
});

let tokenPayload;

try {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: tokenBody
  });

  tokenPayload = await response.json();

  if (!response.ok) {
    console.error(
      `Token exchange failed: ${tokenPayload.error || "unknown_error"} - ${tokenPayload.error_description || "No description"}`
    );
    process.exit(1);
  }
} catch (error) {
  console.error(`Token exchange request failed: ${error.message}`);
  process.exit(1);
}

const refreshToken = tokenPayload.refresh_token;
if (!refreshToken) {
  console.error("No refresh_token returned. Re-consent with prompt=consent and access_type=offline.");
  process.exit(1);
}

let envRaw = "";
try {
  envRaw = fs.readFileSync(envFilePath, "utf8");
} catch (error) {
  console.error(`Could not read .env at ${envFilePath}: ${error.message}`);
  process.exit(1);
}

const upsertEnvVar = (content, key, value) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matcher = new RegExp(`^\\s*${escapedKey}\\s*=.*$`, "m");
  const nextLine = `${key}=${value}`;

  if (matcher.test(content)) {
    return content.replace(matcher, nextLine);
  }

  const trimmed = content.endsWith("\n") ? content : `${content}\n`;
  return `${trimmed}${nextLine}\n`;
};

let updatedEnv = envRaw;
updatedEnv = upsertEnvVar(updatedEnv, "GOOGLE_REFRESH_TOKEN", refreshToken);
updatedEnv = upsertEnvVar(updatedEnv, "GOOGLE_REDIRECT_URI", redirectUri);

try {
  fs.writeFileSync(envFilePath, updatedEnv, "utf8");
} catch (error) {
  console.error(`Could not update .env: ${error.message}`);
  process.exit(1);
}

console.log("GOOGLE_REFRESH_TOKEN updated in .env successfully.");
console.log("Restart your dev server before testing registration/resend.");
