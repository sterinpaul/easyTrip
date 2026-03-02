"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Building2, Star, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

function useDebouncedValue(value, delay = 500) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export default function HotelsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 500);
    const queryClient = useQueryClient();
    const router = useRouter();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [hotelToDelete, setHotelToDelete] = useState(null);

    const { data, isLoading: loading } = useQuery({
        queryKey: ["hotels", page, debouncedSearch.trim()],
        queryFn: async () => {
            const res = await fetch(`/api/hotels?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch.trim())}`);
            if (!res.ok) throw new Error("Failed to fetch hotels");
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/hotels/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete hotel");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hotels"] });
            setDeleteModalOpen(false);
            setHotelToDelete(null);
        },
    });

    const hotels = data?.hotels || [];
    const totalPages = data?.totalPages || 1;

    const confirmDelete = () => {
        if (hotelToDelete) {
            deleteMutation.mutate(hotelToDelete);
        }
    };

    const renderStars = (rating) => {
        if (!rating) return null;
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                            <Building2 className="text-amber-600 dark:text-amber-500" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hotels</h1>
                    </div>
                    <p className="text-gray-400">Manage your hotel database.</p>
                </div>
                <button
                    onClick={() => router.push("/hotels/new")}
                    className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    <span>Add Hotel</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search hotels by name or city..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    spellCheck={true}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/80 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Hotel</th>
                                <th className="px-6 py-4 text-left">City</th>
                                <th className="px-6 py-4 text-left">Contact</th>
                                <th className="px-6 py-4 text-left">Rating</th>
                                <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <div className="flex justify-center"><Loader2 className="animate-spin text-purple-500" /></div>
                                    </td>
                                </tr>
                            ) : (
                                hotels.map((hotel) => (
                                    <tr key={hotel._id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {hotel.image?.url ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                                                        <img src={hotel.image.url} alt={hotel.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                                        {hotel.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{hotel.name}</div>
                                                    {hotel.address && <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{hotel.address}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-gray-400" />
                                                {hotel.city || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <div className="space-y-1">
                                                {hotel.phone && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone size={12} className="text-gray-400" />
                                                        {hotel.phone}
                                                    </div>
                                                )}
                                                {hotel.email && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail size={12} className="text-gray-400" />
                                                        {hotel.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderStars(hotel.starRating)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/hotels/${hotel._id}/edit`)}
                                                    className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-purple-500 hover:text-white transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setHotelToDelete(hotel._id);
                                                        setDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}

                            {(!loading && hotels.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No hotels found. Add your first hotel to get started.
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
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
                    >
                        Prev
                    </button>
                    <span className="px-4 py-2 text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                    setHotelToDelete(null);
                }}
                onConfirm={confirmDelete}
                isDeleting={deleteMutation.isPending}
                title="Delete Hotel"
                description="Are you sure you want to delete this hotel? This action cannot be undone."
            />
        </div>
    );
}
