import { NextRequest, NextResponse } from "next/server";
import {
  getAdminCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    const creds = getAdminCredentials();

    if (
      !username ||
      !password ||
      username.trim() !== creds.username.trim() ||
      password !== creds.password
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username.trim());
    const response = NextResponse.json({
      ok: true,
      message: "Authentication successful",
      user: username.trim(),
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Login failed" },
      { status: 500 }
    );
  }
}
