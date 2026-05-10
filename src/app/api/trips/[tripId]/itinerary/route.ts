import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
        userId: session.user.id,
      },
      include: {
        stops: {
          orderBy: { position: "asc" },
          include: {
            city: {
              select: {
                name: true,
                country: true,
              },
            },
            activities: {
              orderBy: { position: "asc" },
              include: {
                activity: {
                  select: {
                    category: true,
                    duration: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: trip.id,
      title: trip.title,
      stops: trip.stops.map((stop) => ({
        id: stop.id,
        arrivalDate: stop.arrivalDate.toISOString(),
        departureDate: stop.departureDate.toISOString(),
        position: stop.position,
        city: stop.city,
        activities: stop.activities.map((act) => ({
          id: act.id,
          title: act.title,
          scheduledTime: act.scheduledTime,
          customCost: act.customCost,
          scheduledDate: act.scheduledDate.toISOString(),
          activity: act.activity
            ? {
                category: act.activity.category,
                duration: act.activity.duration,
              }
            : null,
        })),
      })),
    });
  } catch (error) {
    console.error("Fetch itinerary error:", error);
    return NextResponse.json({ error: "Failed to fetch itinerary" }, { status: 500 });
  }
}
