import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// We initialize NextAuth with the edge-compatible config
// This sets up the req.auth property for the authorized callback
export default NextAuth(authConfig).auth;

export const config = {
  // Matcher ignoring API routes, static files, images, etc.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
