const DEFAULT_SECRET = "omnitools-secure-admin-session-secret-key-32chars!";
export const SESSION_COOKIE_NAME = "omnitools_admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "OmniToolsAdmin#2026",
  };
}

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface AdminSessionPayload {
  username: string;
  exp: number; // expiration timestamp in ms
}

export async function createSessionToken(username: string): Promise<string> {
  const payload: AdminSessionPayload = {
    username,
    exp: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  const payloadJson = JSON.stringify(payload);
  const enc = new TextEncoder();
  const payloadBytes = enc.encode(payloadJson);
  const payloadB64 = toBase64Url(payloadBytes);

  const key = await getCryptoKey(getSecretKey());
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  const signatureB64 = toBase64Url(signatureBuffer);

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;

  try {
    const key = await getCryptoKey(getSecretKey());
    const enc = new TextEncoder();
    const signatureBytes = fromBase64Url(signatureB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      enc.encode(payloadB64)
    );
    if (!isValid) return null;

    const payloadBytes = fromBase64Url(payloadB64);
    const dec = new TextDecoder();
    const payload: AdminSessionPayload = JSON.parse(dec.decode(payloadBytes));

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
