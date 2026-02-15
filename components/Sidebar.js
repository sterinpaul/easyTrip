"use client";

import { useState } from "react";
import { LayoutDashboard, Users, Image as ImageIcon, LogOut, Plane, FileText, Menu, X } from "lucide-react";
import { SidebarLink } from "@/components/SidebarLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

export function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-white/5 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 p-6">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg">
            <Plane size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">
            EasyTrip
          </span>
        </div>
        <div className="md:hidden">
          <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <SidebarLink href="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink href="/itinerary" icon={<FileText size={20} />} label="Itineraries" />
        <SidebarLink href="/clients" icon={<Users size={20} />} label="Clients" />
        <SidebarLink href="/gallery" icon={<ImageIcon size={20} />} label="Gallery" />
      </nav>

      <div className="pt-6 border-t border-gray-200 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Theme</span>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 mb-2 px-2">
          {user?.image && (
            <img src={user.image} alt="User" className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/20" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header (Fixed) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <span className="font-bold text-lg bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">EasyTrip</span>
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-full">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 bg-black z-[100] md:hidden shadow-2xl border-l border-white/10"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
