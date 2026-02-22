import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  return (
    <div className="flex h-screen print:h-auto print:block bg-gray-50 dark:bg-black text-gray-900 dark:text-white overflow-hidden print:overflow-visible">
      <div className="print:hidden h-full">
        <Sidebar user={session?.user} />
      </div>

      {/* Main Content */}
      <main className="flex-1 print:flex-none overflow-y-auto print:overflow-visible relative bg-gray-50 dark:bg-linear-to-br dark:from-black dark:via-gray-900 dark:to-black pt-20 md:pt-0">

        <div className="p-4 md:p-8 print:p-0 print:max-w-max print:mx-0 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
