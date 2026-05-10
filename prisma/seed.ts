import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── USERS ──────────────────────────────────────────────────
  const adminPw = await hash("Admin@123", 12);
  const userPw = await hash("User@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@traveloop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@traveloop.com",
      passwordHash: adminPw,
      role: "ADMIN",
      city: "San Francisco",
      country: "USA",
    },
  });

  const jane = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Doe",
      email: "jane@example.com",
      passwordHash: userPw,
      role: "USER",
      city: "Mumbai",
      country: "India",
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      name: "Alex Chen",
      email: "alex@example.com",
      passwordHash: userPw,
      role: "USER",
      city: "Singapore",
      country: "Singapore",
    },
  });

  console.log("  ✅ Users seeded");

  // ─── CITIES (30+) ──────────────────────────────────────────

  const citiesData = [
    // Southeast Asia
    { name: "Bangkok", country: "Thailand", region: "Southeast Asia", costIndex: 2, popularityScore: 92, avgTemp: 29, description: "Temples, street food, and vibrant nightlife." },
    { name: "Chiang Mai", country: "Thailand", region: "Southeast Asia", costIndex: 1, popularityScore: 78, avgTemp: 26, description: "Mountain temples and cooking classes." },
    { name: "Bali", country: "Indonesia", region: "Southeast Asia", costIndex: 2, popularityScore: 95, avgTemp: 27, description: "Rice terraces, surf beaches, and spiritual retreats." },
    { name: "Singapore", country: "Singapore", region: "Southeast Asia", costIndex: 4, popularityScore: 88, avgTemp: 28, description: "Futuristic skyline and hawker food paradise." },
    { name: "Hanoi", country: "Vietnam", region: "Southeast Asia", costIndex: 1, popularityScore: 72, avgTemp: 24, description: "Historic Old Quarter and pho culture." },
    { name: "Kuala Lumpur", country: "Malaysia", region: "Southeast Asia", costIndex: 2, popularityScore: 70, avgTemp: 28, description: "Petronas Towers and diverse food scene." },
    // East Asia
    { name: "Tokyo", country: "Japan", region: "East Asia", costIndex: 4, popularityScore: 97, avgTemp: 16, description: "Neon-lit streets, sushi, and cherry blossoms." },
    { name: "Kyoto", country: "Japan", region: "East Asia", costIndex: 3, popularityScore: 89, avgTemp: 15, description: "Ancient temples and bamboo groves." },
    { name: "Osaka", country: "Japan", region: "East Asia", costIndex: 3, popularityScore: 82, avgTemp: 16, description: "Street food capital of Japan." },
    { name: "Seoul", country: "South Korea", region: "East Asia", costIndex: 3, popularityScore: 85, avgTemp: 12, description: "K-culture, palaces, and BBQ." },
    // Europe
    { name: "Paris", country: "France", region: "Europe", costIndex: 5, popularityScore: 98, avgTemp: 12, description: "Art, fashion, and the Eiffel Tower." },
    { name: "Barcelona", country: "Spain", region: "Europe", costIndex: 3, popularityScore: 91, avgTemp: 18, description: "Gaudí architecture and Mediterranean vibes." },
    { name: "Rome", country: "Italy", region: "Europe", costIndex: 3, popularityScore: 94, avgTemp: 16, description: "Colosseum, pasta, and ancient history." },
    { name: "Amsterdam", country: "Netherlands", region: "Europe", costIndex: 4, popularityScore: 87, avgTemp: 10, description: "Canals, museums, and cycling culture." },
    { name: "Prague", country: "Czech Republic", region: "Europe", costIndex: 2, popularityScore: 80, avgTemp: 9, description: "Gothic spires and cheap beer." },
    { name: "Vienna", country: "Austria", region: "Europe", costIndex: 4, popularityScore: 76, avgTemp: 10, description: "Classical music and imperial palaces." },
    { name: "Lisbon", country: "Portugal", region: "Europe", costIndex: 2, popularityScore: 83, avgTemp: 17, description: "Tram rides, pastéis de nata, and ocean views." },
    { name: "Istanbul", country: "Turkey", region: "Europe", costIndex: 2, popularityScore: 86, avgTemp: 14, description: "Where East meets West — bazaars and mosques." },
    // South Asia
    { name: "Delhi", country: "India", region: "South Asia", costIndex: 1, popularityScore: 75, avgTemp: 25, description: "Mughal monuments and street food chaos." },
    { name: "Jaipur", country: "India", region: "South Asia", costIndex: 1, popularityScore: 73, avgTemp: 26, description: "Pink City with forts and palaces." },
    { name: "Goa", country: "India", region: "South Asia", costIndex: 1, popularityScore: 79, avgTemp: 28, description: "Beaches, seafood, and Portuguese heritage." },
    { name: "Colombo", country: "Sri Lanka", region: "South Asia", costIndex: 1, popularityScore: 65, avgTemp: 27, description: "Coastal capital with colonial architecture." },
    // Americas
    { name: "New York", country: "USA", region: "Americas", costIndex: 5, popularityScore: 96, avgTemp: 12, description: "The city that never sleeps." },
    { name: "Lima", country: "Peru", region: "Americas", costIndex: 2, popularityScore: 71, avgTemp: 19, description: "Ceviche capital and Incan gateway." },
    { name: "Buenos Aires", country: "Argentina", region: "Americas", costIndex: 2, popularityScore: 77, avgTemp: 17, description: "Tango, steak, and vibrant nightlife." },
    { name: "Mexico City", country: "Mexico", region: "Americas", costIndex: 2, popularityScore: 81, avgTemp: 17, description: "Tacos, murals, and Aztec ruins." },
    { name: "Rio de Janeiro", country: "Brazil", region: "Americas", costIndex: 3, popularityScore: 84, avgTemp: 24, description: "Carnival, beaches, and Christ the Redeemer." },
    // Middle East & Africa
    { name: "Dubai", country: "UAE", region: "Middle East", costIndex: 5, popularityScore: 90, avgTemp: 30, description: "Luxury skyscrapers and desert safaris." },
    { name: "Marrakech", country: "Morocco", region: "Africa", costIndex: 2, popularityScore: 74, avgTemp: 20, description: "Souks, riads, and Atlas Mountains." },
    { name: "Cape Town", country: "South Africa", region: "Africa", costIndex: 2, popularityScore: 82, avgTemp: 17, description: "Table Mountain, vineyards, and penguins." },
    // Oceania
    { name: "Sydney", country: "Australia", region: "Oceania", costIndex: 4, popularityScore: 88, avgTemp: 18, description: "Opera House, beaches, and harbor views." },
    { name: "Queenstown", country: "New Zealand", region: "Oceania", costIndex: 4, popularityScore: 75, avgTemp: 10, description: "Adventure capital — bungy, skiing, and fjords." },
  ];

  const cities: Record<string, string> = {};
  for (const c of citiesData) {
    const city = await prisma.city.upsert({
      where: { name_country: { name: c.name, country: c.country } },
      update: {},
      create: c,
    });
    cities[c.name] = city.id;
  }
  console.log(`  ✅ ${citiesData.length} cities seeded`);

  // ─── ACTIVITIES (100+) ────────────────────────────────────

  const activitiesData = [
    // Bangkok (6)
    { cityName: "Bangkok", title: "Grand Palace Visit", category: "HISTORICAL" as const, cost: 15, duration: 120, rating: 4.7, description: "Stunning royal complex with intricate architecture." },
    { cityName: "Bangkok", title: "Street Food Tour — Chinatown", category: "FOOD" as const, cost: 25, duration: 180, rating: 4.8, description: "Guided tour through Yaowarat's best food stalls." },
    { cityName: "Bangkok", title: "Floating Market Day Trip", category: "SHOPPING" as const, cost: 20, duration: 240, rating: 4.3, description: "Traditional canal market outside the city." },
    { cityName: "Bangkok", title: "Wat Arun Temple", category: "HISTORICAL" as const, cost: 3, duration: 60, rating: 4.6, description: "Temple of Dawn on the Chao Phraya River." },
    { cityName: "Bangkok", title: "Khao San Road Nightlife", category: "NIGHTLIFE" as const, cost: 30, duration: 240, rating: 4.0, description: "Backpacker hub with bars and street performers." },
    { cityName: "Bangkok", title: "Thai Massage Experience", category: "ADVENTURE" as const, cost: 15, duration: 90, rating: 4.5, description: "Traditional Thai massage at a local spa." },
    // Chiang Mai (5)
    { cityName: "Chiang Mai", title: "Doi Suthep Temple", category: "HISTORICAL" as const, cost: 5, duration: 90, rating: 4.7, description: "Mountain temple with panoramic city views." },
    { cityName: "Chiang Mai", title: "Thai Cooking Class", category: "FOOD" as const, cost: 30, duration: 180, rating: 4.9, description: "Learn to cook pad thai, curry, and mango sticky rice." },
    { cityName: "Chiang Mai", title: "Elephant Nature Park", category: "NATURE" as const, cost: 60, duration: 480, rating: 4.8, description: "Ethical elephant sanctuary visit." },
    { cityName: "Chiang Mai", title: "Night Bazaar Shopping", category: "SHOPPING" as const, cost: 0, duration: 120, rating: 4.2, description: "Handicrafts, art, and street food market." },
    { cityName: "Chiang Mai", title: "Zip-lining in the Jungle", category: "ADVENTURE" as const, cost: 55, duration: 180, rating: 4.6, description: "Flight of the Gibbon canopy adventure." },
    // Bali (5)
    { cityName: "Bali", title: "Ubud Rice Terraces", category: "NATURE" as const, cost: 10, duration: 240, rating: 4.7, description: "Tegallalang terraced rice paddies." },
    { cityName: "Bali", title: "Sunset at Tanah Lot", category: "NATURE" as const, cost: 8, duration: 120, rating: 4.5, description: "Iconic sea temple at golden hour." },
    { cityName: "Bali", title: "Bali Swing", category: "ADVENTURE" as const, cost: 35, duration: 60, rating: 4.3, description: "Swing over the jungle valley." },
    { cityName: "Bali", title: "Seminyak Beach Club", category: "NIGHTLIFE" as const, cost: 50, duration: 180, rating: 4.4, description: "Beachfront cocktails and DJ sets." },
    { cityName: "Bali", title: "Balinese Cooking Class", category: "FOOD" as const, cost: 25, duration: 180, rating: 4.6, description: "Market visit and traditional cooking." },
    // Singapore (5)
    { cityName: "Singapore", title: "Marina Bay Sands Walk", category: "SHOPPING" as const, cost: 0, duration: 120, rating: 4.5, description: "Waterfront promenade and light show." },
    { cityName: "Singapore", title: "Hawker Center Dinner", category: "FOOD" as const, cost: 12, duration: 90, rating: 4.8, description: "Michelin-starred hawker stalls." },
    { cityName: "Singapore", title: "Gardens by the Bay", category: "NATURE" as const, cost: 20, duration: 150, rating: 4.7, description: "Supertree Grove and Cloud Forest." },
    { cityName: "Singapore", title: "Sentosa Island", category: "ADVENTURE" as const, cost: 40, duration: 300, rating: 4.3, description: "Theme parks, beaches, and aquarium." },
    { cityName: "Singapore", title: "Little India Walk", category: "HISTORICAL" as const, cost: 0, duration: 90, rating: 4.1, description: "Colorful streets and Sri Veeramakaliamman Temple." },
    // Tokyo (6)
    { cityName: "Tokyo", title: "Tsukiji Outer Market", category: "FOOD" as const, cost: 30, duration: 120, rating: 4.8, description: "Freshest sushi and seafood in the world." },
    { cityName: "Tokyo", title: "Meiji Shrine", category: "HISTORICAL" as const, cost: 0, duration: 90, rating: 4.6, description: "Serene Shinto shrine in Harajuku." },
    { cityName: "Tokyo", title: "Akihabara Electronics", category: "SHOPPING" as const, cost: 0, duration: 120, rating: 4.2, description: "Anime, manga, and tech paradise." },
    { cityName: "Tokyo", title: "Shibuya Crossing", category: "ADVENTURE" as const, cost: 0, duration: 30, rating: 4.4, description: "World's busiest pedestrian crossing." },
    { cityName: "Tokyo", title: "Robot Restaurant", category: "NIGHTLIFE" as const, cost: 70, duration: 120, rating: 4.0, description: "Wild neon robot cabaret show." },
    { cityName: "Tokyo", title: "TeamLab Borderless", category: "ADVENTURE" as const, cost: 25, duration: 120, rating: 4.9, description: "Immersive digital art museum." },
    // Kyoto (4)
    { cityName: "Kyoto", title: "Fushimi Inari Shrine", category: "HISTORICAL" as const, cost: 0, duration: 120, rating: 4.8, description: "Thousands of vermilion torii gates." },
    { cityName: "Kyoto", title: "Bamboo Grove Walk", category: "NATURE" as const, cost: 0, duration: 60, rating: 4.7, description: "Arashiyama bamboo forest." },
    { cityName: "Kyoto", title: "Tea Ceremony", category: "FOOD" as const, cost: 20, duration: 60, rating: 4.5, description: "Traditional matcha ceremony in a tea house." },
    { cityName: "Kyoto", title: "Gion District Walk", category: "HISTORICAL" as const, cost: 0, duration: 90, rating: 4.4, description: "Historic geisha district." },
    // Paris (5)
    { cityName: "Paris", title: "Eiffel Tower Visit", category: "HISTORICAL" as const, cost: 25, duration: 120, rating: 4.8, description: "Iconic iron tower with city views." },
    { cityName: "Paris", title: "Louvre Museum", category: "HISTORICAL" as const, cost: 17, duration: 240, rating: 4.9, description: "World's largest art museum — Mona Lisa awaits." },
    { cityName: "Paris", title: "Seine River Cruise", category: "ADVENTURE" as const, cost: 15, duration: 60, rating: 4.5, description: "Scenic boat ride past Notre-Dame and bridges." },
    { cityName: "Paris", title: "Montmartre Food Tour", category: "FOOD" as const, cost: 40, duration: 180, rating: 4.7, description: "Wine, cheese, and crêpes in the artists' quarter." },
    { cityName: "Paris", title: "Le Marais Shopping", category: "SHOPPING" as const, cost: 0, duration: 120, rating: 4.3, description: "Vintage boutiques and gallery walks." },
    // Barcelona (4)
    { cityName: "Barcelona", title: "Sagrada Familia", category: "HISTORICAL" as const, cost: 26, duration: 90, rating: 4.9, description: "Gaudí's unfinished masterpiece basilica." },
    { cityName: "Barcelona", title: "La Boqueria Market", category: "FOOD" as const, cost: 15, duration: 90, rating: 4.6, description: "Bustling food market on La Rambla." },
    { cityName: "Barcelona", title: "Park Güell", category: "NATURE" as const, cost: 10, duration: 90, rating: 4.5, description: "Colorful Gaudí mosaics on a hillside." },
    { cityName: "Barcelona", title: "Barceloneta Beach", category: "ADVENTURE" as const, cost: 0, duration: 180, rating: 4.2, description: "City beach with boardwalk and seafood." },
    // Rome (4)
    { cityName: "Rome", title: "Colosseum Tour", category: "HISTORICAL" as const, cost: 18, duration: 120, rating: 4.8, description: "Ancient gladiatorial arena." },
    { cityName: "Rome", title: "Vatican Museums", category: "HISTORICAL" as const, cost: 17, duration: 180, rating: 4.7, description: "Sistine Chapel and Renaissance art." },
    { cityName: "Rome", title: "Trastevere Food Walk", category: "FOOD" as const, cost: 35, duration: 180, rating: 4.6, description: "Pasta, supplì, and gelato in charming alleys." },
    { cityName: "Rome", title: "Trevi Fountain & Piazzas", category: "HISTORICAL" as const, cost: 0, duration: 90, rating: 4.4, description: "Toss a coin and explore Rome's piazzas." },
    // Delhi (3)
    { cityName: "Delhi", title: "Red Fort Visit", category: "HISTORICAL" as const, cost: 5, duration: 90, rating: 4.3, description: "UNESCO Mughal fortress in Old Delhi." },
    { cityName: "Delhi", title: "Chandni Chowk Food Walk", category: "FOOD" as const, cost: 10, duration: 120, rating: 4.7, description: "Centuries-old street food lanes." },
    { cityName: "Delhi", title: "Humayun's Tomb", category: "HISTORICAL" as const, cost: 5, duration: 60, rating: 4.5, description: "Precursor to the Taj Mahal." },
    // Jaipur (3)
    { cityName: "Jaipur", title: "Amber Fort", category: "HISTORICAL" as const, cost: 7, duration: 120, rating: 4.7, description: "Hilltop fort with mirror palace." },
    { cityName: "Jaipur", title: "Hawa Mahal", category: "HISTORICAL" as const, cost: 3, duration: 45, rating: 4.4, description: "Palace of Winds with 953 windows." },
    { cityName: "Jaipur", title: "Johari Bazaar Shopping", category: "SHOPPING" as const, cost: 0, duration: 90, rating: 4.2, description: "Gemstones, textiles, and handicrafts." },
    // Dubai (4)
    { cityName: "Dubai", title: "Burj Khalifa Observation", category: "ADVENTURE" as const, cost: 40, duration: 60, rating: 4.7, description: "Top of the world's tallest building." },
    { cityName: "Dubai", title: "Desert Safari", category: "ADVENTURE" as const, cost: 50, duration: 300, rating: 4.5, description: "Dune bashing, camel ride, and BBQ dinner." },
    { cityName: "Dubai", title: "Dubai Mall Shopping", category: "SHOPPING" as const, cost: 0, duration: 240, rating: 4.3, description: "World's largest mall with aquarium." },
    { cityName: "Dubai", title: "Dhow Dinner Cruise", category: "FOOD" as const, cost: 45, duration: 120, rating: 4.4, description: "Traditional boat dinner on Dubai Creek." },
    // New York (4)
    { cityName: "New York", title: "Statue of Liberty", category: "HISTORICAL" as const, cost: 24, duration: 180, rating: 4.6, description: "Ferry ride and crown access." },
    { cityName: "New York", title: "Central Park Walk", category: "NATURE" as const, cost: 0, duration: 120, rating: 4.7, description: "843-acre urban oasis." },
    { cityName: "New York", title: "Broadway Show", category: "NIGHTLIFE" as const, cost: 100, duration: 150, rating: 4.8, description: "World-class theater on the Great White Way." },
    { cityName: "New York", title: "Pizza Tour", category: "FOOD" as const, cost: 35, duration: 120, rating: 4.5, description: "Best slices from Brooklyn to Manhattan." },
    // Lisbon (3)
    { cityName: "Lisbon", title: "Tram 28 Ride", category: "ADVENTURE" as const, cost: 3, duration: 45, rating: 4.4, description: "Vintage tram through Alfama's narrow streets." },
    { cityName: "Lisbon", title: "Pastéis de Belém", category: "FOOD" as const, cost: 5, duration: 30, rating: 4.8, description: "Original Portuguese custard tarts since 1837." },
    { cityName: "Lisbon", title: "São Jorge Castle", category: "HISTORICAL" as const, cost: 10, duration: 90, rating: 4.5, description: "Moorish castle with city panoramas." },
    // Cape Town (3)
    { cityName: "Cape Town", title: "Table Mountain Hike", category: "NATURE" as const, cost: 15, duration: 240, rating: 4.8, description: "Iconic flat-topped mountain with views." },
    { cityName: "Cape Town", title: "Boulders Beach Penguins", category: "NATURE" as const, cost: 8, duration: 60, rating: 4.6, description: "African penguin colony on the beach." },
    { cityName: "Cape Town", title: "V&A Waterfront", category: "SHOPPING" as const, cost: 0, duration: 120, rating: 4.3, description: "Harbor-side dining and craft markets." },
    // Sydney (3)
    { cityName: "Sydney", title: "Opera House Tour", category: "HISTORICAL" as const, cost: 30, duration: 60, rating: 4.7, description: "Behind-the-scenes of the iconic sails." },
    { cityName: "Sydney", title: "Bondi to Coogee Walk", category: "NATURE" as const, cost: 0, duration: 120, rating: 4.6, description: "Coastal cliff walk between two beaches." },
    { cityName: "Sydney", title: "Darling Harbour Dinner", category: "FOOD" as const, cost: 50, duration: 120, rating: 4.4, description: "Waterfront dining with harbor views." },
    // Istanbul (3)
    { cityName: "Istanbul", title: "Hagia Sophia", category: "HISTORICAL" as const, cost: 25, duration: 90, rating: 4.8, description: "Byzantine marvel turned mosque." },
    { cityName: "Istanbul", title: "Grand Bazaar", category: "SHOPPING" as const, cost: 0, duration: 120, rating: 4.5, description: "One of the oldest covered markets in the world." },
    { cityName: "Istanbul", title: "Bosphorus Ferry Cruise", category: "ADVENTURE" as const, cost: 5, duration: 90, rating: 4.6, description: "Sail between Europe and Asia." },
    // Marrakech (3)
    { cityName: "Marrakech", title: "Jemaa el-Fnaa Night Market", category: "FOOD" as const, cost: 10, duration: 120, rating: 4.5, description: "Smoky grills, snake charmers, and storytellers." },
    { cityName: "Marrakech", title: "Majorelle Garden", category: "NATURE" as const, cost: 12, duration: 60, rating: 4.6, description: "Yves Saint Laurent's cobalt-blue botanical oasis." },
    { cityName: "Marrakech", title: "Medina Souk Walk", category: "SHOPPING" as const, cost: 0, duration: 120, rating: 4.3, description: "Labyrinthine alleys of spices, leather, and pottery." },
    // Mexico City (3)
    { cityName: "Mexico City", title: "Teotihuacan Pyramids", category: "HISTORICAL" as const, cost: 5, duration: 300, rating: 4.7, description: "Climb the Pyramid of the Sun." },
    { cityName: "Mexico City", title: "Taco Crawl", category: "FOOD" as const, cost: 15, duration: 120, rating: 4.8, description: "Al pastor, suadero, and campechano tacos." },
    { cityName: "Mexico City", title: "Frida Kahlo Museum", category: "HISTORICAL" as const, cost: 10, duration: 90, rating: 4.6, description: "The Blue House — Frida's life and art." },
  ];

  let actCount = 0;
  for (const a of activitiesData) {
    const cityId = cities[a.cityName];
    if (!cityId) {
      console.warn(`  ⚠️ City not found: ${a.cityName}`);
      continue;
    }
    await prisma.activity.create({
      data: {
        cityId,
        title: a.title,
        description: a.description,
        cost: a.cost,
        duration: a.duration,
        category: a.category,
        rating: a.rating,
      },
    });
    actCount++;
  }
  console.log(`  ✅ ${actCount} activities seeded`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
