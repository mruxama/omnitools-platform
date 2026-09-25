import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/adminAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "Logged out successfully" });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
