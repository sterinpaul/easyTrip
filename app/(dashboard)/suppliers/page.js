"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Handshake, Edit, Trash2, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { api } from "@/components/suppliers/ui";

function useDebouncedValue(value, delay = 500) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export default function SuppliersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search).trim();
    const [toDelete, setToDelete] = useState(null);
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryKey: ["suppliers", page, debouncedSearch],
        queryFn: () => api(`/api/suppliers?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch)}`),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api(`/api/suppliers/${id}`, { method: "DELETE" }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["suppliers"] }); setToDelete(null); },
    });

    const suppliers = data?.suppliers || [];
    const totalPages = data?.totalPages || 1;
    const pagerBtn = "px-4 py-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors";

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-teal-100 dark:bg-teal-500/20 rounded-lg">
                            <Handshake className="text-teal-600 dark:text-teal-400" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
                    </div>
                    <p className="text-gray-400">Manage suppliers and their package rates.</p>
                </div>
                <button
                    onClick={() => router.push("/suppliers/new")}
                    className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105"
                >
                    <Plus size={20} /> <span>Add Supplier</span>
                </button>
            </div>

            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or destination..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
                />
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/80 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Supplier</th>
                                <th className="px-6 py-4 text-left">Destination</th>
                                <th className="px-6 py-4 text-left">Contact</th>
                                <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                            {isLoading ? (
                                <tr><td colSpan="4" className="px-6 py-10"><Loader2 className="animate-spin text-purple-500 mx-auto" /></td></tr>
                            ) : suppliers.map((s) => (
                                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" />{s.destination || "-"}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {[s.contactName, s.phone, s.email].filter(Boolean).join(" · ") || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button aria-label="Edit supplier and rates" onClick={() => router.push(`/suppliers/${s._id}`)}
                                                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-purple-500 hover:text-white transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button aria-label="Delete supplier" onClick={() => setToDelete(s._id)}
                                                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-red-500 hover:text-white transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && suppliers.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No suppliers found. Add your first supplier to get started.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={pagerBtn}>Prev</button>
                    <span className="px-4 py-2 text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={pagerBtn}>Next</button>
                </div>
            )}

            <DeleteConfirmModal
                isOpen={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={() => deleteMutation.mutate(toDelete)}
                isDeleting={deleteMutation.isPending}
                title="Delete Supplier"
                description="Are you sure you want to delete this supplier? Its rates will no longer be available in the calculator."
            />
        </div>
    );
}
