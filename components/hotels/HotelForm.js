"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Star, Trash2, Upload, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ImageSelector from "../common/ImageSelector";

const inputClass =
    "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400";
const labelClass = "text-sm font-medium text-gray-500 dark:text-gray-400";

export default function HotelForm({ hotel }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const isEditing = !!hotel;

    const [form, setForm] = useState({
        name: hotel?.name || "",
        address: hotel?.address || "",
        city: hotel?.city || "",
        phone: hotel?.phone || "",
        email: hotel?.email || "",
        website: hotel?.website || "",
        starRating: hotel?.starRating || "",
    });

    const [showImage, setShowImage] = useState(!!hotel?.image?.url);
    const [imageUrl, setImageUrl] = useState(hotel?.image?.url || "");
    const [imageId, setImageId] = useState(hotel?.image?._id || undefined);

    const selectedImages = imageUrl ? [{ _id: imageId, url: imageUrl, title: "Hotel Image" }] : [];

    const mutation = useMutation({
        mutationFn: async (data) => {
            const url = isEditing ? `/api/hotels/${hotel._id}` : "/api/hotels";
            const method = isEditing ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details?.join(", ") || err.error || "Failed to save hotel");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hotels"] });
            router.push("/hotels");
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            alert("Hotel name is required");
            return;
        }
        const payload = { ...form };
        if (payload.starRating) payload.starRating = Number(payload.starRating);
        else delete payload.starRating;

        if (imageUrl) {
            payload.image = { url: imageUrl, _id: imageId || undefined };
        } else {
            payload.image = null; // Send null to clear if removed
        }

        mutation.mutate(payload);
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-sm dark:shadow-none">
            <h2 className="text-xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-pink-500 w-fit">
                Hotel Details
            </h2>

            <div className="space-y-2">
                <label className={labelClass}>Hotel Name *</label>
                <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Pacific Express Hotel"
                    spellCheck={true}
                    required
                />
            </div>

            {/* ── Optional Hotel Image ── */}
            <div className="mt-2">
                <button
                    type="button"
                    onClick={() => setShowImage((v) => !v)}
                    className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-400 transition-colors"
                >
                    <ImageIcon size={16} />
                    {showImage ? "Hide" : "Add"} Hotel Image
                    {showImage ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <AnimatePresence>
                    {showImage && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-white/3 rounded-xl border border-gray-100 dark:border-white/5">
                                <ImageSelector
                                    selectedImages={selectedImages}
                                    multiple={false}
                                    folder="hotels"
                                    onChange={(imgs) => {
                                        if (imgs.length > 0) {
                                            setImageUrl(imgs[0].url);
                                            setImageId(imgs[0]._id);
                                        } else {
                                            setImageUrl("");
                                            setImageId(undefined);
                                        }
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className={labelClass}>City</label>
                    <input
                        value={form.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Kuala Lumpur"
                        spellCheck={true}
                    />
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>Star Rating</label>
                    <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => handleChange("starRating", form.starRating === star ? "" : star)}
                                className="p-1 transition-colors"
                            >
                                <Star
                                    size={22}
                                    className={`transition-colors ${star <= (form.starRating || 0)
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-gray-300 dark:text-gray-600"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className={labelClass}>Address</label>
                <input
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className={inputClass}
                    placeholder="Full address"
                    spellCheck={true}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className={labelClass}>Phone</label>
                    <input
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className={inputClass}
                        placeholder="+91 1234567890"
                    />
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={inputClass}
                        placeholder="hotel@example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className={labelClass}>Website</label>
                <input
                    value={form.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className={inputClass}
                    placeholder="https://www.hotel.com"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <button
                    type="button"
                    onClick={() => router.push("/hotels")}
                    className="px-5 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="px-6 py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                    {(mutation.isPending) ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isEditing ? "Update" : "Save"}
                </button>
            </div>
        </form>
    );
}
