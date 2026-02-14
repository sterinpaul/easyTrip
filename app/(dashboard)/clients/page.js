"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useQuery } from "@tanstack/react-query";

export default function ClientsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['clients', page],
    queryFn: async () => {
      const res = await fetch(`/api/clients?page=${page}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    }
  });

  const clients = data?.clients || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <Users className="text-blue-600 dark:text-blue-500" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
          </div>
          <p className="text-gray-400">Manage your client database.</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Add Client</span>
        </Link>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/80 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Location</th>
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
                clients?.map((client) => (
                  <tr key={client._id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Client ID: #{client._id.slice(-4)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400 dark:text-gray-500" />
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400 dark:text-gray-500" />
                        {client.mobile}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                        {client.address || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-purple-500 hover:text-white transition-colors">
                          <Mail size={18} />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-blue-500 hover:text-white transition-colors">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {(!loading && (!clients || clients.length === 0)) && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No clients found. Add your first client to get started.
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
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
          >
            Prev
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
