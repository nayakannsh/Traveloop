"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BudgetCategory } from "@prisma/client";

/**
 * Updates or creates a budget entry for a trip category.
 */
export async function updateBudgetAction(
  tripId: string, 
  category: BudgetCategory, 
  data: { estimated?: number; actual?: number; isPaid?: boolean }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId, userId: session.user.id },
      select: { id: true }
    });
    if (!trip) return { error: "Trip not found" };

    // Build update data explicitly (avoid spread-boolean short-circuit bugs)
    const updateData: Record<string, unknown> = {};
    if (data.estimated !== undefined) updateData.amountEstimated = data.estimated;
    if (data.actual !== undefined) updateData.amountActual = data.actual;
    if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;

    // Upsert budget entry
    const budget = await prisma.budget.upsert({
      where: {
        tripId_category: {
          tripId,
          category
        }
      },
      update: updateData,
      create: {
        tripId,
        category,
        amountEstimated: data.estimated ?? 0,
        amountActual: data.actual ?? 0,
        isPaid: Boolean(data.isPaid ?? false)
      }
    });

    revalidatePath(`/trips/${tripId}/budget`);
    revalidatePath(`/dashboard`);
    return { success: true, budget };
  } catch (error) {
    console.error("Update budget error:", error);
    return { error: "Failed to update budget" };
  }
}

/**
 * Marks a budget category as fully paid.
 * Computes actual cost from real itinerary activities if no budget entry exists yet.
 */
export async function markAsPaidAction(tripId: string, category: BudgetCategory) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // First check existing budget entry
    const budget = await prisma.budget.findUnique({
      where: {
        tripId_category: { tripId, category }
      }
    });

    let paidAmount = 0;

    if (budget) {
      // Use existing values
      paidAmount = budget.amountActual > 0 ? budget.amountActual : budget.amountEstimated;
    } else {
      // No budget entry yet — compute from activities
      const categoryMapping: Record<string, BudgetCategory> = {
        FOOD: "FOOD",
        SHOPPING: "SHOPPING",
        ADVENTURE: "ACTIVITIES",
        HISTORICAL: "ACTIVITIES",
        NIGHTLIFE: "ACTIVITIES",
        NATURE: "ACTIVITIES",
      };

      // Get all activities for this trip
      const stops = await prisma.tripStop.findMany({
        where: { tripId },
        include: {
          activities: {
            include: {
              activity: { select: { category: true, cost: true } }
            }
          }
        }
      });

      for (const stop of stops) {
        for (const act of stop.activities) {
          const actCat = act.activity?.category || "ADVENTURE";
          const budgetCat = categoryMapping[actCat] || "ACTIVITIES";
          if (budgetCat === category) {
            paidAmount += act.customCost || act.activity?.cost || 0;
          }
        }
      }
    }

    return await updateBudgetAction(tripId, category, {
      actual: paidAmount,
      estimated: paidAmount,
      isPaid: true
    });
  } catch (error) {
    console.error("Mark as paid error:", error);
    return { error: "Failed to mark as paid" };
  }
}

/**
 * Updates the overall budget limit for a trip.
 */
export async function updateBudgetLimitAction(tripId: string, limit: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId, userId: session.user.id },
      select: { id: true }
    });
    if (!trip) return { error: "Trip not found" };

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { budgetLimit: limit }
    });

    revalidatePath(`/trips/${tripId}/budget`);
    revalidatePath(`/trips/${tripId}/builder`);
    revalidatePath(`/dashboard`);
    return { success: true, budgetLimit: updatedTrip.budgetLimit };
  } catch (error) {
    console.error("Update budget limit error:", error);
    return { error: "Failed to update budget limit" };
  }
}
