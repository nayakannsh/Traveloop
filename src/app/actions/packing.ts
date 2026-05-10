"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PackingCategory } from "@prisma/client";

/**
 * Adds a new packing item to a trip.
 */
export async function addPackingItemAction(tripId: string, title: string, category: PackingCategory) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId, userId: session.user.id },
      select: { id: true }
    });
    if (!trip) return { error: "Trip not found" };

    const item = await prisma.packingItem.create({
      data: {
        tripId,
        title,
        category,
        completed: false
      }
    });

    revalidatePath(`/trips/${tripId}/packing`);
    return { success: true, item };
  } catch (error) {
    console.error("Add packing item error:", error);
    return { error: "Failed to add item" };
  }
}

/**
 * Toggles the completion status of a packing item.
 */
export async function togglePackingItemAction(tripId: string, itemId: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const item = await prisma.packingItem.update({
      where: { id: itemId, tripId },
      data: { completed }
    });

    revalidatePath(`/trips/${tripId}/packing`);
    return { success: true, item };
  } catch (error) {
    console.error("Toggle packing item error:", error);
    return { error: "Failed to update item" };
  }
}

/**
 * Removes a packing item.
 */
export async function removePackingItemAction(tripId: string, itemId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.packingItem.delete({
      where: { id: itemId, tripId }
    });

    revalidatePath(`/trips/${tripId}/packing`);
    return { success: true };
  } catch (error) {
    console.error("Remove packing item error:", error);
    return { error: "Failed to remove item" };
  }
}

/**
 * Resets all packing items for a trip (sets completed to false).
 */
export async function resetPackingItemsAction(tripId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.packingItem.updateMany({
      where: { tripId },
      data: { completed: false }
    });

    revalidatePath(`/trips/${tripId}/packing`);
    return { success: true };
  } catch (error) {
    console.error("Reset packing items error:", error);
    return { error: "Failed to reset items" };
  }
}
