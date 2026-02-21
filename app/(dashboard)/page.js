"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, FileText, Calendar, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

export default function DashboardStatsPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Clients",
      value: stats?.totalClients || 0,
      icon: <Users size={24} className="text-blue-400" />,
      color: "from-blue-500/20 to-blue-600/5",
      borderColor: "border-blue-500/30",
      href: "/clients",
    },
    {
      label: "Total Itineraries",
      value: stats?.totalItineraries || 0,
      icon: <FileText size={24} className="text-purple-400" />,
      color: "from-purple-500/20 to-purple-600/5",
      borderColor: "border-purple-500/30",
      href: "/itinerary",
    },
    {
      label: "Upcoming Trips",
      value: stats?.upcomingTrips || 0,
      icon: <Calendar size={24} className="text-green-400" />,
      color: "from-green-500/20 to-green-600/5",
      borderColor: "border-green-500/30",
      href: "/itinerary?status=upcoming&page=1",
    },
    {
      label: "Past Trips",
      value: stats?.pastTrips || 0,
      icon: <Clock size={24} className="text-white" />,
      color: "from-orange-500 to-orange-600",
      href: "/itinerary?status=past&page=1",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, <span className="text-purple-600 dark:text-purple-400 font-semibold capitalize">{user?.name}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            href={stat.href ?? ""}
            className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-linear-to-br ${stat.color}`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-linear-to-br ${stat.color} text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity / Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Add quick links here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
