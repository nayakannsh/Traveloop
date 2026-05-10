import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PackingClient } from "./PackingClient";

export default async function PackingPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch items from DB
  const items = await prisma.packingItem.findMany({
    where: { tripId },
    orderBy: { title: "asc" }
  });

  return (
    <PackingClient 
      tripId={tripId} 
      initialItems={items.map(i => ({
        id: i.id,
        title: i.title,
        category: i.category as any,
        completed: i.completed
      }))} 
    />
  );
}
