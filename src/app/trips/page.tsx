import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TripsClient from "./TripsClient";

export default async function TripsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch real trips from DB with activity costs for budget calculation
  const rawTrips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { stops: true } },
      budgets: { select: { amountEstimated: true, amountActual: true } },
      stops: {
        include: {
          activities: {
            select: {
              customCost: true,
              activity: { select: { cost: true } },
            },
          },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  // Map to the format expected by the frontend
  const trips = rawTrips.map(t => {
    // Calculate actual spending from activities
    const activityTotal = t.stops.reduce((stopAcc, stop) => {
      return stopAcc + stop.activities.reduce((actAcc, act) => {
        return actAcc + (act.customCost || act.activity?.cost || 0);
      }, 0);
    }, 0);

    // Also include any budget entries that were manually entered
    const budgetTotal = t.budgets.reduce((acc, b) => acc + b.amountActual, 0);

    // Use the higher of activity total or budget total
    const budgetUsed = Math.max(activityTotal, budgetTotal);

    // Effective budget limit
    const effectiveBudgetLimit = t.budgetLimit > 0 ? t.budgetLimit : activityTotal;

    return {
      id: t.id,
      title: t.title,
      description: t.description || "",
      startDate: t.startDate.toISOString(),
      endDate: t.endDate.toISOString(),
      coverImage: t.coverImage,
      privacy: t.privacy,
      status: t.status,
      cityCount: t._count.stops,
      budgetUsed,
      budgetLimit: effectiveBudgetLimit,
    };
  });

  return <TripsClient initialTrips={trips} />;
}
