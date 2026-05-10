import Navbar from "@/components/common/Navbar";
import LandingPage from "@/components/landing/LandingPage";

import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <Navbar session={session} />
      <main>
        <LandingPage />
      </main>
    </>
  );
}
