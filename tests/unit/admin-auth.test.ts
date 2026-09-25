import { describe, it, expect } from "vitest";
import {
  getAdminCredentials,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth/adminAuth";

describe("Admin Authentication Service", () => {
  it("should provide valid default credentials", () => {
    const creds = getAdminCredentials();
    expect(creds.username).toBeDefined();
    expect(creds.username.length).toBeGreaterThan(0);
    expect(creds.password).toBeDefined();
    expect(creds.password.length).toBeGreaterThan(6);
  });

  it("should create and verify valid session tokens", async () => {
    const username = "admin";
    const token = await createSessionToken(username);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.includes(".")).toBe(true);

    const session = await verifySessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.username).toBe(username);
    expect(session?.exp).toBeGreaterThan(Date.now());
  });

  it("should reject tampered or invalid session tokens", async () => {
    const token = await createSessionToken("admin");
    const [payload, signature] = token.split(".");

    // Tamper with payload
    const tamperedPayload = payload + "tamper";
    const tamperedToken = `${tamperedPayload}.${signature}`;
    const result1 = await verifySessionToken(tamperedToken);
    expect(result1).toBeNull();

    // Tamper with signature
    const tamperedSignature = signature.slice(0, -4) + "XXXX";
    const result2 = await verifySessionToken(`${payload}.${tamperedSignature}`);
    expect(result2).toBeNull();

    // Random string
    const result3 = await verifySessionToken("random-string-not-token");
    expect(result3).toBeNull();

    // Empty or null
    expect(await verifySessionToken("")).toBeNull();
    expect(await verifySessionToken(null)).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });

  it("should export correct session cookie settings", () => {
    expect(SESSION_COOKIE_NAME).toBe("omnitools_admin_session");
    expect(SESSION_DURATION_SECONDS).toBeGreaterThan(0);
  });
});
