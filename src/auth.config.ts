import type { NextAuthConfig } from "next-auth";

// Notice this is only an object, not a full Auth.js instance
export const authConfig = {
  pages: {
    signIn: "/auth/login",
    // We can also define custom error pages or new user sign-up pages
    error: "/auth/login", 
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Define protected route prefixes
      const isProtectedRoute = 
        nextUrl.pathname.startsWith("/dashboard") || 
        nextUrl.pathname.startsWith("/trips") ||
        nextUrl.pathname.startsWith("/admin");

      const isAuthRoute = 
        nextUrl.pathname.startsWith("/auth/login") || 
        nextUrl.pathname.startsWith("/auth/signup");

      if (isProtectedRoute) {
        if (isLoggedIn) return true; // Allowed
        return false; // Redirect to /login
      } else if (isAuthRoute) {
        if (isLoggedIn) {
          // If logged in and trying to hit login/register, redirect to dashboard
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true; // Allowed to see login page
      }

      // Allow all other public routes (e.g., home page, about, features)
      return true;
    },
    // We add user ID to the JWT token so it's accessible everywhere without DB lookup
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Providers are added in auth.ts to avoid Edge Runtime issues with Prisma/Bcrypt
} satisfies NextAuthConfig;
