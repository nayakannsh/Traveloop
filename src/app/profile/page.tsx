import { auth } from "@/auth";
import ProfileClient from "./ProfileClient";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return <ProfileClient initialUser={user} />;
}
