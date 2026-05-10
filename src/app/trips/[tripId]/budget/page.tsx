import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import BudgetClient from "./BudgetClient";
import { BudgetCategory } from "@prisma/client";

const CATEGORIES: BudgetCategory[] = ["TRANSPORT", "HOTELS", "FOOD", "ACTIVITIES", "SHOPPING", "MISC"];

export default async function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const trip = await prisma.trip.findUnique({
    where: { 
      id: tripId,
      userId: session.user.id
    },
    include: {
      budgets: true,
      stops: {
        include: {
          activities: {
            include: {
              activity: {
                select: {
                  category: true,
                  cost: true,
                }
              }
            }
          }
        }
      }
    }
  });

  if (!trip) {
    notFound();
  }

  // Calculate actual spending from itinerary activities
  const activityTotals: Record<string, number> = {
    TRANSPORT: 0,
    HOTELS: 0,
    FOOD: 0,
    ACTIVITIES: 0,
    SHOPPING: 0,
    MISC: 0,
  };

  // Map ActivityCategory -> BudgetCategory
  const categoryMapping: Record<string, BudgetCategory> = {
    FOOD: "FOOD",
    SHOPPING: "SHOPPING",
    ADVENTURE: "ACTIVITIES",
    HISTORICAL: "ACTIVITIES",
    NIGHTLIFE: "ACTIVITIES",
    NATURE: "ACTIVITIES",
  };

  for (const stop of trip.stops) {
    for (const act of stop.activities) {
      const cost = act.customCost || act.activity?.cost || 0;
      const actCategory = act.activity?.category || "ADVENTURE";
      const budgetCat = categoryMapping[actCategory] || "ACTIVITIES";
      activityTotals[budgetCat] += cost;
    }
  }

  // Auto-sync budget entries: use existing DB values for isPaid/estimated, 
  // but compute actual from real activity data
  const budgetEntries = CATEGORIES.map(cat => {
    const existing = trip.budgets.find(b => b.category === cat);
    const computedActual = activityTotals[cat] || 0;
    // Use the higher of DB actual or computed actual (in case user manually entered)
    const actualAmount = existing?.amountActual 
      ? Math.max(existing.amountActual, computedActual)
      : computedActual;
    return {
      id: existing?.id || `new-${cat}`,
      category: cat as any,
      estimated: existing?.amountEstimated || computedActual,
      actual: actualAmount,
      isPaid: existing?.isPaid ?? false
    };
  });

  // Compute effective budget limit: use explicit budgetLimit, or total estimated
  const totalFromActivities = Object.values(activityTotals).reduce((s, v) => s + v, 0);
  const effectiveBudgetLimit = trip.budgetLimit > 0 
    ? trip.budgetLimit 
    : totalFromActivities;

  return (
    <BudgetClient 
      tripId={tripId} 
      initialEntries={budgetEntries} 
      budgetLimit={effectiveBudgetLimit} 
    />
  );
}
