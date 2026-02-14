import { auth, signOut } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white overflow-hidden">
      <Sidebar session={session} signOutAction={handleSignOut} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-gray-50 dark:bg-linear-to-br dark:from-black dark:via-gray-900 dark:to-black pt-20 md:pt-0">

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
