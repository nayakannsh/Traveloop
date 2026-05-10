"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserProfileAction(data: {
  name?: string;
  phone?: string;
  city?: string;
  country?: string;
  currency?: string;
  theme?: string;
  defaultPrivacy?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
        city: data.city,
        country: data.country,
        currency: data.currency,
        theme: data.theme,
        defaultPrivacy: data.defaultPrivacy as any,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
