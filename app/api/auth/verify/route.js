import { NextResponse } from "next/server";
export async function POST(request) {
  const { password } = await request.json();
  const correct = process.env.APP_PASSWORD;
  if (!correct) return NextResponse.json({ error:"No password set" }, { status:500 });
  if (password === correct) {
    const response = NextResponse.json({ ok:true });
    response.cookies.set("app-auth", "true", { httpOnly:true, secure:true, sameSite:"lax", maxAge:60*60*24*30 });
    return response;
  }
  return NextResponse.json({ error:"Wrong password" }, { status:401 });
}