"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Calendar, MapPin, Users, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusTab = searchParams.get("status") || "upcoming";
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading: loading } = useQuery({
    queryKey: ['itineraries', statusTab, page],
    queryFn: async () => {
      const res = await fetch(`/api/itinerary?status=${statusTab}&page=${page}&limit=9`);
      if (!res.ok) throw new Error("Failed to fetch itineraries");
      return res.json();
    }
  });

  const itineraries = data?.itineraries || [];
  const totalPages = data?.totalPages || 1;

  const handleTabChange = (status) => {
    router.push(`?status=${status}&page=1`);
  };

  const handlePageChange = (newPage) => {
    router.push(`?status=${statusTab}&page=${newPage}`);
  };

  const navigate = (url) => {
    router.push(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-pink-100 dark:bg-pink-500/20 rounded-lg">
              <FileText className="text-pink-600 dark:text-pink-500" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Itineraries</h1>
          </div>
          <p className="text-gray-400">Manage your travel plans and schedules.</p>
        </div>
        <Link
          href="/itinerary/new"
          className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Create New</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit border border-gray-200 dark:border-white/10 backdrop-blur-sm">
        <button
          onClick={() => handleTabChange("upcoming")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${statusTab === "upcoming"
            ? "bg-white text-purple-600 shadow-sm dark:bg-white/10 dark:text-white"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => handleTabChange("past")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${statusTab === "past"
            ? "bg-white text-purple-600 shadow-sm dark:bg-white/10 dark:text-white"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
        >
          Past
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-purple-500" size={40} />
        </div>
      ) : itineraries.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 border-dashed">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No itineraries found.</p>
          <Link href="/itinerary/new" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline">
            Create your first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {itineraries.map((itinerary) => (
              <motion.button
                key={itinerary._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate(`/itinerary/${itinerary._id}`)}
                className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col"
              >
                {/* Image Placeholder or Hero Image */}
                {/* This section was incomplete in the original, adding a placeholder */}
                <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  {itinerary.image ? (
                    <img src={itinerary.image} alt={itinerary.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>
                <div className="p-5 grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{itinerary.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{itinerary.description}</p>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-2">
                      <Calendar size={16} className="mr-2 text-purple-500" />
                      <span>{new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-2">
                      <MapPin size={16} className="mr-2 text-pink-500" />
                      <span>{itinerary.destination}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Users size={16} className="mr-2 text-blue-500" />
                      <span>{itinerary.travelers} Travelers</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
          >
            Prev
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
