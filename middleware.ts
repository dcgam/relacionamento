import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs", // 👈 Força execução no Node em vez do Edge
};

export function middleware(request: NextRequest) {
  return NextResponse.next();
}
