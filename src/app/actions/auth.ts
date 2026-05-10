"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { z } from "zod";

// --- Validation Schemas ---
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// --- Server Actions ---

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong." };
      }
    }
    // Required to allow redirect to work inside a try/catch block
    throw error;
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  try {
    const parsed = registerSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User with this email already exists." };
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 12);
    
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
      },
    });

    // Automatically log in the user after registration
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Something went wrong during sign in." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
