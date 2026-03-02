"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, Upload, Trash2, Image as ImageIcon, X } from "lucide-react";

// Shared styles for the component to keep it standalone
const inputClass =
    "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400";
const pillBtnClass =
    "flex items-center justify-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors";

function useDebouncedValue(value, delay = 500) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export default function ImageSelector({ selectedImages = [], onChange, multiple = false, folder = "destinations" }) {
    // Search Gallery State
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 500);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");

    const { data, isFetching } = useQuery({
        queryKey: ["image-search", debouncedSearch.trim(), folder],
        queryFn: async () => {
            let url = `/api/gallery?limit=10&category=${folder}`;
            if (debouncedSearch.trim()) url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch gallery images");
            return res.json();
        }
    });

    const results = data?.photos || [];

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
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

        setUploadFile(file);
        // Default title to filename without extension
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
        e.target.value = ""; // reset
    };

    const confirmUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("folderName", folder);
        formData.append("quality", "85");

        try {
            // 1. Upload to Cloudinary
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) throw new Error("Cloudinary upload failed");

            // 2. Create Image DB Document
            const dbRes = await fetch("/api/gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: uploadTitle || uploadFile.name,
                    url: uploadData.url,
                    category: folder,
                })
            });

            const dbImage = await dbRes.json();

            if (dbRes.ok) {
                const newImg = { _id: dbImage._id, url: dbImage.url, title: dbImage.title };
                onChange(multiple ? [...selectedImages, newImg] : [newImg]);

                // Reset upload state
                setUploadFile(null);
                setUploadTitle("");
            } else {
                alert("Database save failed");
            }
        } catch (err) {
            console.error("Upload error", err);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index) => {
        onChange(selectedImages.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {/* 1. Selected Images Grid */}
            {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedImages.map((img, idx) => (
                        <div key={img._id || idx} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-video bg-gray-50 dark:bg-white/5">
                            {img.url ? (
                                <>
                                    <img src={img.url} alt={img.title || "Selected"} className="w-full h-full object-cover" />
                                    <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black/60 to-transparent p-2">
                                        <p className="text-white text-xs font-medium truncate drop-shadow-md">{img.title || "Selected Image"}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <ImageIcon size={24} />
                                        <p className="text-xs mt-1 truncate max-w-full px-2">{img.title}</p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" onClick={() => removeImage(idx)} className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Selector Area */}
            {(!selectedImages.length || multiple) && (
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Gallery Search */}
                    <div className="flex-1 relative">
                        <div className="flex items-center relative">
                            <Search className="absolute left-3 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search gallery images..."
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                        {search && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto p-2">
                                {search !== debouncedSearch || isFetching ? (
                                    <div className="py-8 text-center flex flex-col items-center justify-center text-sm text-gray-400">
                                        <Loader2 className="animate-spin mb-2 text-purple-500" size={24} />
                                        <span>Searching...</span>
                                    </div>
                                ) : results.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {results.map(img => {
                                            const isSelected = selectedImages.some(s => s._id === img._id);
                                            if (isSelected) return null;
                                            return (
                                                <button
                                                    key={img._id}
                                                    type="button"
                                                    onClick={() => {
                                                        const selected = { _id: img._id, url: img.url, title: img.title };
                                                        onChange(multiple ? [...selectedImages, selected] : [selected]);
                                                        setSearch("");
                                                    }}
                                                    className="flex aspect-video overflow-hidden rounded-lg group border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div className="relative w-full h-full">
                                                        <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                        <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-medium truncate capitalize p-2">{img.title}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-sm text-gray-500">No images found for "{search}".</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center text-gray-400 text-sm font-medium uppercase tracking-wider py-2 md:py-0">
                        <span>OR</span>
                    </div>

                    {/* Local Upload */}
                    <div className="flex-1">
                        {!uploadFile ? (
                            <label className={`w-full flex items-center justify-center gap-2 ${pillBtnClass} cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 bg-transparent hover:border-purple-500 dark:hover:border-purple-500 py-3!`}>
                                <Upload size={18} className="text-purple-500" />
                                <span className="font-medium">Upload New</span>
                                <input type="file" accept="image/jpeg, image/png, image/webp, image/avif" className="hidden" onChange={handleFileSelect} />
                            </label>
                        ) : (
                            <div className="w-full bg-white dark:bg-white/5 border border-purple-200 dark:border-purple-500/20 rounded-xl p-3 flex flex-col gap-3 shadow-sm relative">
                                <button
                                    type="button"
                                    onClick={() => setUploadFile(null)}
                                    className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-1 text-gray-500 transition-colors shadow-sm"
                                    disabled={isUploading}
                                >
                                    <X size={14} />
                                </button>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Image Title</label>
                                    <input
                                        type="text"
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                        placeholder="Enter image title"
                                        className={`${inputClass} py-2! text-sm`}
                                        disabled={isUploading}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex items-center gap-2 mb-2 bg-gray-50 dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                    <div className="w-10 h-10 shrink-0 rounded overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                        {uploadFile.type?.startsWith('image/') ? (
                                            <img src={URL.createObjectURL(uploadFile)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={16} className="text-gray-400" />
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate flex-1">{uploadFile.name}</span>
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={confirmUpload}
                                        disabled={isUploading || !uploadTitle.trim()}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                                        {isUploading ? 'Saving...' : 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
