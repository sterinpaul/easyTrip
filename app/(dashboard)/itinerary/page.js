"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Calendar, MapPin, Users, Loader2, FileText, Edit, Trash2, Eye, IndianRupee } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

export default function ItinerariesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const statusTab = searchParams.get("status") || "upcoming";
  const page = parseInt(searchParams.get("page") || "1");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['itineraries', statusTab, page],
    queryFn: async () => {
      const res = await fetch(`/api/itinerary?status=${statusTab}&page=${page}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch itineraries");
      return res.json();
    }
  });

  const itineraries = data?.itineraries || [];
  const totalPages = data?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/itinerary/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete itinerary");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setDeleteModalOpen(false);
      setItineraryToDelete(null);
    },
  });

  const confirmDelete = () => {
    if (itineraryToDelete) {
      deleteMutation.mutate(itineraryToDelete);
    }
  };

  const handleTabChange = (status) => {
    router.push(`?status=${status}&page=1`);
  };

  const handlePageChange = (newPage) => {
    router.push(`?status=${statusTab}&page=${newPage}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const totalGuests = (gc) => {
    if (!gc) return 0;
    return (gc.adults || 0) + (gc.children || 0) + (gc.infants || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
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

      {/* Table */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/80 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Package</th>
                <th className="px-6 py-4 text-left">Destinations</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Client</th>
                <th className="px-6 py-4 text-left">Guests</th>
                <th className="px-6 py-4 text-left">Cost</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center">
                    <div className="flex justify-center"><Loader2 className="animate-spin text-purple-500" /></div>
                  </td>
                </tr>
              ) : (
                itineraries.map((it) => (
                  <tr
                    key={it._id}
                    className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/itinerary/${it._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{it.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <FileText size={12} />
                          {it.packageId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-pink-500 shrink-0" />
                        <span className="text-sm truncate max-w-[180px]">
                          {it.destinations?.map(d => d.name).filter(Boolean).join(", ") || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-purple-500 shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(it.startDate)}</span>
                      </div>
                      <div className="text-xs text-gray-400 ml-6 mt-0.5">to {formatDate(it.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {it.client?.name || <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className="text-blue-500 shrink-0" />
                        {totalGuests(it.guestCount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <IndianRupee size={13} className="text-green-500 shrink-0" />
                        {it.totalCost ? it.totalCost.toLocaleString("en-IN") : "0"}
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 transition-opacity">
                        <Link
                          href={`/itinerary/${it._id}`}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-purple-500 hover:text-white transition-colors"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/itinerary/${it._id}/edit`}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            setItineraryToDelete(it._id);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {(!loading && itineraries.length === 0) && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No itineraries found.{" "}
                    <Link href="/itinerary/new" className="text-purple-500 hover:text-purple-400 underline">
                      Create your first one
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
          >
            Prev
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItineraryToDelete(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Itinerary"
        description="Are you sure you want to delete this itinerary? This action cannot be undone."
      />
    </div>
  );
}
