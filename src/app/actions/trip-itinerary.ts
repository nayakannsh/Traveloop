"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Adds a city/stop to a trip.
 */
export async function addStopAction(tripId: string, cityId: string, arrivalDate: string, departureDate: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Verify ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId, userId: session.user.id },
      include: { stops: true }
    });

    if (!trip) return { error: "Trip not found" };

    const newStop = await prisma.tripStop.create({
      data: {
        tripId,
        cityId,
        arrivalDate: new Date(arrivalDate),
        departureDate: new Date(departureDate),
        position: trip.stops.length,
      },
      include: {
        city: true,
        activities: true
      }
    });

    revalidatePath(`/trips/${tripId}/builder`);
    return { success: true, stop: newStop };
  } catch (error) {
    console.error("Add stop error:", error);
    return { error: "Failed to add stop" };
  }
}

/**
 * Creates a new city and adds it to a trip.
 */
export async function addCustomCityAction(
  tripId: string, 
  cityName: string, 
  countryName: string,
  arrivalDate: string, 
  departureDate: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // 1. Create the city (or find if it exists)
    const city = await prisma.city.upsert({
      where: {
        name_country: {
          name: cityName,
          country: countryName
        }
      },
      update: {}, // No change if exists
      create: {
        name: cityName,
        country: countryName,
        region: "User Added", // Required field
        costIndex: 2,
        popularityScore: 0
      }
    });

    // 2. Add as a stop
    return await addStopAction(tripId, city.id, arrivalDate, departureDate);
  } catch (error) {
    console.error("Add custom city error:", error);
    return { error: "Failed to add custom city" };
  }
}

/**
 * Removes a stop from a trip.
 */
export async function removeStopAction(tripId: string, stopId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.tripStop.delete({
      where: { id: stopId, tripId } // Ensure it belongs to the trip
    });

    revalidatePath(`/trips/${tripId}/builder`);
    return { success: true };
  } catch (error) {
    console.error("Remove stop error:", error);
    return { error: "Failed to remove stop" };
  }
}

/**
 * Adds an activity to a trip stop.
 */
export async function addActivityAction(
  tripId: string, 
  stopId: string, 
  activityId: string | null, 
  title: string, 
  time: string, 
  cost: number
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const newActivity = await prisma.tripActivity.create({
      data: {
        tripStopId: stopId,
        activityId,
        title,
        scheduledDate: new Date(), // Placeholder, usually same as stop date
        scheduledTime: time,
        customCost: cost,
      }
    });

    // Update Budget Tracker automatically
    if (cost > 0) {
      await prisma.budget.upsert({
        where: {
          tripId_category: {
            tripId,
            category: "ACTIVITIES"
          }
        },
        update: {
          amountActual: { increment: cost }
        },
        create: {
          tripId,
          category: "ACTIVITIES",
          amountEstimated: 0,
          amountActual: cost,
          isPaid: false
        }
      });
    }

    revalidatePath(`/trips/${tripId}/builder`);
    revalidatePath(`/trips/${tripId}/budget`);
    return { success: true, activity: newActivity };
  } catch (error) {
    console.error("Add activity error:", error);
    return { error: "Failed to add activity" };
  }
}

/**
 * Removes an activity.
 */
export async function removeActivityAction(tripId: string, activityId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Get activity to know the cost
    const activity = await prisma.tripActivity.findUnique({
      where: { id: activityId },
      select: { customCost: true }
    });

    await prisma.tripActivity.delete({
      where: { id: activityId }
    });

    // Update Budget Tracker automatically
    if (activity?.customCost && activity.customCost > 0) {
      // Use updateMany to avoid error if budget doesn't exist (though it should)
      await prisma.budget.updateMany({
        where: {
          tripId,
          category: "ACTIVITIES"
        },
        data: {
          amountActual: { decrement: activity.customCost }
        }
      });
    }

    revalidatePath(`/trips/${tripId}/builder`);
    revalidatePath(`/trips/${tripId}/budget`);
    return { success: true };
  } catch (error) {
    console.error("Remove activity error:", error);
    return { error: "Failed to remove activity" };
  }
}
