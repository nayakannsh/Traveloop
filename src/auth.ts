import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";

import type { Provider } from "next-auth/providers";
import { compare } from "bcryptjs";

import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";

// Add providers that require Node.js features (Prisma, Bcrypt) here,
// keeping them out of auth.config.ts so the middleware can run on Edge.

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      // If user doesn't exist or registered via OAuth (no password)
      if (!user || !user.passwordHash) return null;

      const passwordsMatch = await compare(
        credentials.password as string,
        user.passwordHash
      );

      if (passwordsMatch) {
        return user;
      }

      return null;
    },
  }),
];



export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
});
