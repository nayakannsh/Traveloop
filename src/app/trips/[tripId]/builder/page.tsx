import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import BuilderClient from "./BuilderClient";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch trip with its stops and activities
  const trip = await prisma.trip.findUnique({
    where: { 
      id: tripId,
      userId: session.user.id // Security: ensure user owns the trip
    },
    include: {
      stops: {
        include: {
          city: true,
          activities: true
        },
        orderBy: { position: "asc" }
      }
    }
  });

  if (!trip) {
    notFound();
  }

  // Fetch all cities and activities for the search modals
  const [cities, activities] = await Promise.all([
    prisma.city.findMany({ orderBy: { name: "asc" } }),
    prisma.activity.findMany({ orderBy: { title: "asc" } })
  ]);

  // Map DB stops to the format expected by the client component
  const initialStops = trip.stops.map(stop => ({
    id: stop.id,
    cityId: stop.cityId,
    cityName: stop.city.name,
    country: stop.city.country,
    arrivalDate: stop.arrivalDate.toISOString(),
    departureDate: stop.departureDate.toISOString(),
    position: stop.position,
    activities: stop.activities.map(act => ({
      id: act.id,
      activityId: act.activityId,
      title: act.title,
      scheduledTime: act.scheduledTime,
      customCost: act.customCost
    }))
  }));

  // Map DB cities to Client City type
  const allCities = cities.map(c => ({
    id: c.id,
    name: c.name,
    country: c.country,
    costIndex: c.costIndex
  }));

  // Map DB activities to Client Activity type
  const allActivities = activities.map(a => ({
    id: a.id,
    title: a.title,
    category: a.category,
    cost: a.cost,
    duration: a.duration,
    cityId: a.cityId
  }));

  return (
    <BuilderClient 
      tripId={tripId} 
      initialStops={initialStops}
      allCities={allCities}
      allActivities={allActivities}
    />
  );
}
