"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createTripSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budgetLimit: z.coerce.number().optional().default(0),
});

export async function createTripAction(prevState: any, formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "You must be logged in to create a trip." };
  }

  const parsed = createTripSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { title, startDate, endDate, budgetLimit } = parsed.data;

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return { error: "End date cannot be before start date." };
  }

  let newTrip;

  try {
    newTrip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        title,
        startDate: start,
        endDate: end,
        budgetLimit,
        status: "DRAFT",
        privacy: "PRIVATE",
      },
    });
  } catch (error) {
    console.error("Failed to create trip:", error);
    return { error: "Failed to create trip. Please try again." };
  }

  // Redirect to the trip builder page for the new trip
  revalidatePath("/dashboard");
  revalidatePath("/trips");
  redirect(`/trips/${newTrip.id}/builder`);
}

/**
 * Updates the status of a trip.
 */
export async function updateTripStatusAction(
  tripId: string,
  status: "DRAFT" | "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED"
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.trip.update({
      where: { id: tripId, userId: session.user.id },
      data: { status },
    });

    revalidatePath("/trips");
    revalidatePath("/dashboard");
    revalidatePath(`/trips/${tripId}/builder`);
    return { success: true };
  } catch (error) {
    console.error("Update trip status error:", error);
    return { error: "Failed to update status" };
  }
}

/**
 * Deletes a trip.
 */
export async function deleteTripAction(tripId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.trip.delete({
      where: { id: tripId, userId: session.user.id },
    });

    revalidatePath("/trips");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete trip error:", error);
    return { error: "Failed to delete trip" };
  }
}
