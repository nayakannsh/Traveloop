import { auth } from "@/auth";
import BillingClient from "./BillingClient";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return <BillingClient user={session.user} />;
}
