"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Save, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ItineraryForm({ initialData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
      title: "",
      client: "",
      startDate: "",
      endDate: "",
      destinations: "",
      totalCost: 0,
      activities: [],
      status: "upcoming"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "activities"
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch("/api/clients?limit=100");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    }
  });

  const clients = clientsData?.clients || [];

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setValue(`activities.${index}.image`, data.url);
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Convert comma separated destinations to array if string
      if (typeof data.destinations === 'string') {
        data.destinations = data.destinations.split(',').map(s => s.trim());
      }

      const url = initialData?._id ? `/api/itinerary/${initialData._id}` : "/api/itinerary";
      const method = initialData?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save itinerary");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      console.error("Save error", error);
      alert("Failed to save itinerary");
    }
  });

  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Basic Info Card */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-sm dark:shadow-none">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text bg-linear-to-r from-purple-500 to-pink-500 w-fit">
          Trip Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">Trip Name</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
              placeholder="e.g. Summer in Paris"
            />
            {errors.title && <span className="text-red-500 dark:text-red-400 text-xs">{errors.title.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">Client</label>
            <div className="relative">
              <select
                {...register("client")}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
              >
                <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Select a Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">{client.name} ({client.email})</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">Start Date</label>
            <input
              type="date"
              {...register("startDate", { required: "Start Date is required" })}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 scheme-light dark:scheme-dark"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">End Date</label>
            <input
              type="date"
              {...register("endDate", { required: "End Date is required" })}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 scheme-light dark:scheme-dark"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">Destinations (comma separated)</label>
            <input
              {...register("destinations")}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-gray-400"
              placeholder="Paris, Nice, Lyon"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">Total Cost ($)</label>
            <input
              type="number"
              {...register("totalCost")}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-gray-400"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white bg-clip-text bg-linear-to-r from-purple-500 to-pink-500 w-fit">
            Daily Activities
          </h2>
          <button
            type="button"
            onClick={() => append({ day: fields.length + 1, title: "", description: "" })}
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Day
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl relative group shadow-sm dark:shadow-none"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Day Circle */}
                  <div className="md:col-span-1 flex justify-center pt-2">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  <div className="md:col-span-11 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        {...register(`activities.${index}.title`)}
                        placeholder="Activity Title (e.g. Eiffel Tower Tour)"
                        className="bg-transparent border-b border-gray-200 dark:border-white/20 pb-2 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <input
                        type="time"
                        {...register(`activities.${index}.time`)}
                        className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white scheme-light dark:scheme-dark"
                      />
                    </div>

                    <textarea
                      {...register(`activities.${index}.description`)}
                      placeholder="Description of the activity..."
                      rows={3}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-gray-400"
                    />

                    {/* Image Upload */}
                    <div className="flex items-start gap-4">
                      {watch(`activities.${index}.image`) ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-white/20 group/image">
                          <img src={watch(`activities.${index}.image`)} alt="Activity" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setValue(`activities.${index}.image`, "")}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, index)}
                            className="hidden"
                            id={`file-${index}`}
                          />
                          <label
                            htmlFor={`file-${index}`}
                            className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-dashed border-gray-300 dark:border-white/20 hover:border-purple-500/50 cursor-pointer bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          >
                            {uploading ? <Loader2 className="animate-spin text-purple-400" /> : <Upload className="text-gray-400" size={20} />}
                            <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                          </label>
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <input
                          {...register(`activities.${index}.location`)}
                          placeholder="Location URL or Name"
                          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-50 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-8 py-2 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2 transition-all transform active:scale-95"
        >
          {saveMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Save Itinerary</span>
        </button>
      </div>
    </form>
  );
}
