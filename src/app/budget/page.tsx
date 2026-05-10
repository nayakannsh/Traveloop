import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BudgetOverviewClient from "./BudgetOverviewClient";
import { BudgetCategory } from "@prisma/client";

const CATEGORIES: BudgetCategory[] = ["TRANSPORT", "HOTELS", "FOOD", "ACTIVITIES", "SHOPPING", "MISC"];

export default async function BudgetOverviewPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch ALL trips for this user with budgets + activities
  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: {
      budgets: true,
      stops: {
        include: {
          activities: {
            include: {
              activity: {
                select: { category: true, cost: true },
              },
            },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  // Map ActivityCategory -> BudgetCategory
  const categoryMapping: Record<string, BudgetCategory> = {
    FOOD: "FOOD",
    SHOPPING: "SHOPPING",
    ADVENTURE: "ACTIVITIES",
    HISTORICAL: "ACTIVITIES",
    NIGHTLIFE: "ACTIVITIES",
    NATURE: "ACTIVITIES",
  };

  // Build per-trip budget data
  const tripsData = trips.map((trip) => {
    // Calculate actual spending from activities
    const activityTotals: Record<string, number> = {
      TRANSPORT: 0,
      HOTELS: 0,
      FOOD: 0,
      ACTIVITIES: 0,
      SHOPPING: 0,
      MISC: 0,
    };

    for (const stop of trip.stops) {
      for (const act of stop.activities) {
        const cost = act.customCost || act.activity?.cost || 0;
        const actCategory = act.activity?.category || "ADVENTURE";
        const budgetCat = categoryMapping[actCategory] || "ACTIVITIES";
        activityTotals[budgetCat] += cost;
      }
    }

    const entries = CATEGORIES.map((cat) => {
      const existing = trip.budgets.find((b) => b.category === cat);
      const computedActual = activityTotals[cat] || 0;
      const actualAmount = existing?.amountActual
        ? Math.max(existing.amountActual, computedActual)
        : computedActual;
      return {
        category: cat,
        estimated: existing?.amountEstimated || computedActual,
        actual: actualAmount,
        isPaid: existing?.isPaid ?? false,
      };
    });

    const totalSpent = entries.reduce((s, e) => s + e.actual, 0);
    const totalEstimated = entries.reduce((s, e) => s + e.estimated, 0);
    const totalFromActivities = Object.values(activityTotals).reduce((s, v) => s + v, 0);
    const effectiveBudgetLimit = trip.budgetLimit > 0 ? trip.budgetLimit : totalFromActivities;

    return {
      id: trip.id,
      title: trip.title,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      status: trip.status,
      budgetLimit: effectiveBudgetLimit,
      totalSpent,
      totalEstimated,
      entries,
    };
  });

  return <BudgetOverviewClient trips={tripsData} />;
}
