"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { Search } from "lucide-react";

function useDebouncedValue(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function GalleryPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const CATEGORIES = ["all", "destinations", "hotels"];

  // New Photo Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("destinations");
  const [newImage, setNewImage] = useState(null); // File object
  const [newImageUrl, setNewImageUrl] = useState(""); // URL string (if uploaded or pasted)

  // Fetch Photos
  const { data: photosData, isLoading: loading } = useQuery({
    queryKey: ['gallery', activeTab, page, debouncedSearch.trim()],
    queryFn: async () => {
      let url = `/api/gallery?category=${activeTab}&page=${page}&limit=20`;
      if (debouncedSearch.trim()) url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return res.json();
    }
  });

  const photos = photosData?.photos || [];
  const totalPages = photosData?.totalPages || 1;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setDeleteModalOpen(false);
      setPhotoToDelete(null);
    },
    onError: (error) => {
      console.error("Delete failed", error);
    }
  });

  const confirmDelete = () => {
    if (photoToDelete) {
      deleteMutation.mutate(photoToDelete);
    }
  };

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = data.newImageUrl;

      if (data.newImage) {
        const formData = new FormData();
        formData.append("file", data.newImage);
        formData.append("folderName", data.newCategory);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error("Upload failed");
        imageUrl = uploadData.url;
      }

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.newTitle,
          category: data.newCategory,
          url: imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setIsModalOpen(false);
      setNewTitle("");
      setNewCategory("destinations");
      setNewImage(null);
      setNewImageUrl("");
    },
    onError: (error) => {
      console.error("Upload/Save failed", error);
      alert("Failed to upload/save photo");
    }
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newTitle || (!newImage && !newImageUrl)) return;
    uploadMutation.mutate({ newTitle, newCategory, newImage, newImageUrl });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <Upload className="text-purple-600 dark:text-purple-500" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Manage your travel photos and assets.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Add Photo</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === cat
                ? "bg-purple-500 text-white"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            spellCheck={true}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>
      {/* Grid */}
      {
        loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-purple-500" size={40} />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 border-dashed">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No photos found.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline">
              Upload your first photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {photos.map((photo) => (
                <motion.div
                  key={photo._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/10"
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold truncate capitalize">{photo.title}</h3>
                    <p className="text-white text-xs truncate w-full text-left capitalize">{photo.category}</p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoToDelete(photo._id);
                        setDeleteModalOpen(true);
                      }}
                      className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      }

      {/* Pagination */}
      {
        totalPages > 1 && (
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
        )
      }

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Photo</h2>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Title</label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-gray-400"
                    placeholder="e.g. Sunset at Beach"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {CATEGORIES.filter(c => c !== "all").map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Image</label>
                  {/* File Input */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp, image/avif"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert("File size exceeds 10MB limit. Please choose a smaller file.");
                            e.target.value = "";
                            return;
                          }
                          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
                          if (!allowedTypes.includes(file.type)) {
                            alert("Invalid file format. Only JPEG, PNG, WEBP, and AVIF are allowed.");
                            e.target.value = "";
                            return;
                          }
                          setNewImage(file);
                          setNewImageUrl(""); // Clear URL if file selected
                        }
                      }}
                      className="hidden"
                      id="modal-file-upload"
                    />
                    <label
                      htmlFor="modal-file-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed ${newImage ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10" : "border-gray-300 dark:border-white/20 hover:border-purple-500/50 hover:bg-gray-50 dark:hover:bg-white/5"} cursor-pointer transition-all`}
                    >
                      {newImage ? (
                        <div className="text-center text-purple-600 dark:text-purple-400">
                          <p className="font-semibold text-sm">{newImage.name}</p>
                          <p className="text-xs opacity-70">Click to change</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="text-gray-400 mb-2" size={24} />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
                        </>
                      )}
                    </label>
                  </div>
                  {/* Or URL */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                  </div>
                  <input
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value);
                      setNewImage(null);
                    }}
                    className="mt-2 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-gray-400"
                    placeholder="Paste Image URL"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadMutation.isPending}
                    className="flex-1 py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : "Save Photo"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPhotoToDelete(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Photo"
        description="Are you sure you want to delete this photo from the gallery? This action cannot be undone."
      />
    </div >
  );
}
