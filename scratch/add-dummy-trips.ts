import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the user who has "Paris" or "tokyo, japan" trips
  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { title: { contains: "Paris", mode: 'insensitive' } },
        { title: { contains: "tokyo", mode: 'insensitive' } }
      ]
    },
    select: { userId: true, title: true }
  });

  if (trips.length === 0) {
    console.log("No trips found matching 'Paris' or 'tokyo'. Fetching most recent user instead.");
    const lastUser = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
    if (lastUser) {
      console.log(`Using last user: ${lastUser.name} (${lastUser.email})`);
      await addTrips(lastUser.id);
    }
  } else {
    const userId = trips[0].userId;
    console.log(`Found matching user ID: ${userId} from trip '${trips[0].title}'`);
    await addTrips(userId);
  }
}

async function addTrips(userId: string) {
  const cities = await prisma.city.findMany({ take: 10 });
  
  const dummyTrips = [
    {
      title: "Summer in Europe",
      description: "Exploring the best of Paris, Barcelona and Rome.",
      startDate: new Date("2026-07-15"),
      endDate: new Date("2026-07-30"),
      status: "PLANNED",
      budgetLimit: 5000,
      stops: [
        { cityName: "Paris", arrival: "2026-07-15", departure: "2026-07-20" },
        { cityName: "Barcelona", arrival: "2026-07-20", departure: "2026-07-25" },
        { cityName: "Rome", arrival: "2026-07-25", departure: "2026-07-30" },
      ]
    },
    {
      title: "Japan Cherry Blossom",
      description: "A spring journey through Tokyo and Kyoto.",
      startDate: new Date("2026-03-25"),
      endDate: new Date("2026-04-05"),
      status: "PLANNED",
      budgetLimit: 4000,
      stops: [
        { cityName: "Tokyo", arrival: "2026-03-25", departure: "2026-03-31" },
        { cityName: "Kyoto", arrival: "2026-03-31", departure: "2026-04-05" },
      ]
    },
    {
      title: "Bali Surf Trip",
      description: "Waves, sun and relaxation in Bali.",
      startDate: new Date("2026-08-10"),
      endDate: new Date("2026-08-20"),
      status: "PLANNED",
      budgetLimit: 2500,
      stops: [
        { cityName: "Bali", arrival: "2026-08-10", departure: "2026-08-20" },
      ]
    },
    {
      title: "Southeast Asia Backpacker",
      description: "Low budget adventure across Thailand and Vietnam.",
      startDate: new Date("2026-05-15"),
      endDate: new Date("2026-06-15"),
      status: "ONGOING",
      budgetLimit: 1500,
      stops: [
        { cityName: "Bangkok", arrival: "2026-05-15", departure: "2026-05-30" },
        { cityName: "Hanoi", arrival: "2026-05-30", departure: "2026-06-15" },
      ]
    },
    {
      title: "USA East Coast",
      description: "New York City and beyond.",
      startDate: new Date("2025-12-20"),
      endDate: new Date("2025-12-30"),
      status: "COMPLETED",
      budgetLimit: 3500,
      stops: [
        { cityName: "New York", arrival: "2025-12-20", departure: "2025-12-30" },
      ]
    }
  ];

  for (const tripData of dummyTrips) {
    const trip = await prisma.trip.create({
      data: {
        userId: userId,
        title: tripData.title,
        description: tripData.description,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        status: tripData.status as any,
        budgetLimit: tripData.budgetLimit,
        privacy: "PRIVATE",
        stops: {
          create: tripData.stops.map((s, idx) => {
            const city = cities.find(c => c.name === s.cityName);
            return {
              cityId: city?.id || cities[0].id,
              arrivalDate: new Date(s.arrival),
              departureDate: new Date(s.departure),
              position: idx,
            };
          })
        }
      },
    });

    await prisma.budget.createMany({
      data: [
        { tripId: trip.id, category: "TRANSPORT", amountEstimated: 800, amountActual: 750, isPaid: true },
        { tripId: trip.id, category: "HOTELS", amountEstimated: 1200, amountActual: 1100, isPaid: false },
        { tripId: trip.id, category: "FOOD", amountEstimated: 500, amountActual: 450, isPaid: false },
      ]
    });

    console.log(`Created trip: ${trip.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
