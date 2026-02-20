"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Plus, Trash2, Save, Upload, Loader2, ChevronDown, ChevronUp,
  MapPin, Plane, Calendar, Image as ImageIcon, Activity, Bus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Shared Styles ───────────────────────────────────────────────
const inputClass =
  "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400";
const labelClass = "text-sm font-medium text-gray-500 dark:text-gray-400";
const cardClass =
  "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-sm dark:shadow-none";
const pillBtnClass =
  "flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors";
const deleteBtnClass =
  "text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors";
const sectionTitleClass =
  "text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2";

// ─── Transportation Mode Options ─────────────────────────────────
const TRANSPORT_MODES = [
  { value: "", label: "Select mode" },
  { value: "car", label: "🚗  Car" },
  { value: "bus", label: "🚌  Bus" },
  { value: "train", label: "🚆  Train" },
  { value: "flight", label: "✈️  Flight" },
  { value: "cruise", label: "🚢  Cruise" },
  { value: "other", label: "🔄  Other" },
];

// ─── Collapsible Section Wrapper ─────────────────────────────────
function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cardClass}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <h2 className={sectionTitleClass}>
          {Icon && <Icon size={22} className="text-purple-500" />}
          {title}
        </h2>
        {open ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Transportation Sub‑form ─────────────────────────────────────
function TransportationFields({ prefix, register, errors }) {
  const e = prefix.split(".").reduce((o, k) => o?.[k], errors);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <label className={labelClass}>Mode</label>
        <div className="relative">
          <select {...register(`${prefix}.mode`)} className={`${inputClass} appearance-none`}>
            {TRANSPORT_MODES.map((m) => (
              <option key={m.value} value={m.value} className="bg-white dark:bg-gray-900">{m.label}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">▼</div>
        </div>
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Vehicle Details</label>
        <input {...register(`${prefix}.vehicleDetails`)} className={inputClass} placeholder="e.g. Flight AI‑302, Seat 14A" />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>From *</label>
        <input {...register(`${prefix}.from`, { required: "From is required" })} className={inputClass} placeholder="Departure location" />
        {e?.from && <span className="text-red-500 text-xs">{e.from.message}</span>}
      </div>
      <div className="space-y-2">
        <label className={labelClass}>To *</label>
        <input {...register(`${prefix}.to`, { required: "To is required" })} className={inputClass} placeholder="Arrival location" />
        {e?.to && <span className="text-red-500 text-xs">{e.to.message}</span>}
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Departure Time</label>
        <input type="datetime-local" {...register(`${prefix}.departureTime`)} className={`${inputClass} scheme-light dark:scheme-dark`} />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Arrival Time</label>
        <input type="datetime-local" {...register(`${prefix}.arrivalTime`)} className={`${inputClass} scheme-light dark:scheme-dark`} />
      </div>
    </div>
  );
}

// ─── Destination Card (separate component to use hooks safely) ───
function DestinationCard({ dIdx, field, register, watch, setValue, errors, uploading, onUpload, onRemove, addDay, addActivityToDay, removeDay, removeActivity, galleryImages }) {
  const [showImage, setShowImage] = useState(false);
  const activities = watch(`destinations.${dIdx}.activities`) || [];
  const imageUrl = watch(`destinations.${dIdx}.image.url`);

  return (
    <motion.div
      key={field.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${cardClass} relative group`}
    >
      {/* Delete */}
      <button type="button" onClick={onRemove} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 size={18} className={deleteBtnClass} />
      </button>

      {/* Badge */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {dIdx + 1}
        </div>
        <span className="text-xs uppercase tracking-widest text-gray-400">Destination</span>
      </div>

      {/* Name & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className={labelClass}>Name *</label>
          <input
            {...register(`destinations.${dIdx}.name`, { required: "Destination name is required" })}
            className={inputClass}
            placeholder="e.g. Borobudur Temple"
          />
          {errors.destinations?.[dIdx]?.name && (
            <span className="text-red-500 text-xs">{errors.destinations[dIdx].name.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Description</label>
          <input
            {...register(`destinations.${dIdx}.description`)}
            className={inputClass}
            placeholder="Short description"
          />
        </div>
      </div>

      {/* ── Optional Location Image ── */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowImage((v) => !v)}
          className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-400 transition-colors"
        >
          <ImageIcon size={16} />
          {showImage ? "Hide" : "Add"} Location Image
          {showImage ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {showImage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-gray-50 dark:bg-white/3 rounded-xl border border-gray-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Upload / preview (Only if NOT a gallery image) */}
                {!watch(`destinations.${dIdx}.image._id`) && (
                  <div className="flex items-start">
                    {imageUrl ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-white/20 group/img">
                        <img src={imageUrl} alt="Location" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setValue(`destinations.${dIdx}.image.url`, "");
                            setValue(`destinations.${dIdx}.image._id`, undefined);
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input type="file" accept="image/*" onChange={(e) => onUpload(e, dIdx)} className="hidden" id={`dest-img-${dIdx}`} />
                        <label
                          htmlFor={`dest-img-${dIdx}`}
                          className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-dashed border-gray-300 dark:border-white/20 hover:border-purple-500/50 cursor-pointer bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                          {uploading[dIdx] ? <Loader2 className="animate-spin text-purple-400" /> : <Upload className="text-gray-400" size={20} />}
                          <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}


                {/* Title & Description: Read-only if gallery image, Editable if new upload */}
                {watch(`destinations.${dIdx}.image._id`) ? (
                  <div className="md:col-span-3 mt-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-white/20">
                      <img src={imageUrl} alt="Gallery Selection" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-pink-500">Gallery Image Selected</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{watch(`destinations.${dIdx}.image.title`) || "Untitled"}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{watch(`destinations.${dIdx}.image.description`) || "No description"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setValue(`destinations.${dIdx}.image.url`, "");
                          setValue(`destinations.${dIdx}.image._id`, undefined);
                          setValue(`destinations.${dIdx}.image.title`, "");
                          setValue(`destinations.${dIdx}.image.description`, "");
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg"
                        title="Remove selection"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className={labelClass}>Image Title</label>
                      <input {...register(`destinations.${dIdx}.image.title`)} className={inputClass} placeholder="Image title" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Image Description</label>
                      <input {...register(`destinations.${dIdx}.image.description`)} className={inputClass} placeholder="Image description" />
                    </div>
                  </>
                )}
              </div>

              {/* Gallery Select */}
              {!watch(`destinations.${dIdx}.image._id`) && galleryImages && galleryImages.length > 0 && (
                <div className="md:col-span-3">
                  <label className={`${labelClass} text-xs mb-1 block`}>Or select from Gallery</label>
                  <div className="relative">
                    <select
                      className={`${inputClass} text-sm py-2`}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) return;
                        const img = galleryImages.find((p) => p._id === selectedId);
                        if (img) {
                          setValue(`destinations.${dIdx}.image.url`, img.url);
                          setValue(`destinations.${dIdx}.image.title`, img.title || "");
                          setValue(`destinations.${dIdx}.image.description`, img.description || "");
                          setValue(`destinations.${dIdx}.image._id`, img._id);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">-- Choose existing image --</option>
                      {galleryImages.map((img) => (
                        <option key={img._id} value={img._id}>
                          {img.title || "Untitled"} ({img.description ? img.description.substring(0, 20) + "..." : "No desc"})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Activities (grouped by Day) ── */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Activity size={16} className="text-pink-500" /> Activities
          </h3>
          <button type="button" onClick={() => addDay(dIdx)} className={pillBtnClass}>
            <Plus size={14} /> Add Day
          </button>
        </div>

        {/* Group activities by day */}
        <AnimatePresence>
          {(() => {
            // Group activities by day number
            const grouped = {};
            activities.forEach((act, aIdx) => {
              const dayNum = act.day || 1;
              if (!grouped[dayNum]) grouped[dayNum] = { date: act.date, items: [] };
              grouped[dayNum].items.push({ ...act, _index: aIdx });
            });
            const dayNums = Object.keys(grouped).map(Number).sort((a, b) => a - b);

            if (dayNums.length === 0) {
              return (
                <p className="text-xs text-gray-400 italic pl-1">No days added yet — click &quot;Add Day&quot; to start planning.</p>
              );
            }

            return dayNums.map((dayNum) => {
              const group = grouped[dayNum];
              return (
                <motion.div
                  key={`${field.id}-day-${dayNum}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 dark:bg-white/3 rounded-xl border border-gray-100 dark:border-white/5 p-4 relative group/day"
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-xs font-bold">
                        {dayNum}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Day {dayNum}</span>
                      <div className="ml-2">
                        <input
                          type="date"
                          {...register(`destinations.${dIdx}.activities.${group.items[0]._index}.date`)}
                          className={`${inputClass} py-1! px-2! text-xs! w-36 scheme-light dark:scheme-dark`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addActivityToDay(dIdx, dayNum)}
                        className="text-xs text-purple-500 hover:text-purple-400 flex items-center gap-1 transition-colors"
                      >
                        <Plus size={12} /> Activity
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDay(dIdx, dayNum)}
                        className="opacity-0 group-hover/day:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} className={deleteBtnClass} />
                      </button>
                    </div>
                  </div>

                  {/* Activities within this day */}
                  <div className="space-y-2 ml-10">
                    <AnimatePresence>
                      {group.items.map((act, localIdx) => (
                        <motion.div
                          key={`${field.id}-act-${act._index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-3 group/act"
                        >
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="time"
                              {...register(`destinations.${dIdx}.activities.${act._index}.time.from`)}
                              className={`${inputClass} py-1.5! px-2! text-xs! w-28 scheme-light dark:scheme-dark`}
                            />
                            <span className="text-gray-400 text-xs">→</span>
                            <input
                              type="time"
                              {...register(`destinations.${dIdx}.activities.${act._index}.time.to`)}
                              className={`${inputClass} py-1.5! px-2! text-xs! w-28 scheme-light dark:scheme-dark`}
                            />
                          </div>
                          <input
                            {...register(`destinations.${dIdx}.activities.${act._index}.description`)}
                            className={`${inputClass} py-1.5! text-sm! flex-1`}
                            placeholder="Activity description"
                          />
                          {/* Hidden day field to keep the value */}
                          <input type="hidden" {...register(`destinations.${dIdx}.activities.${act._index}.day`, { valueAsNumber: true })} />
                          <button
                            type="button"
                            onClick={() => removeActivity(dIdx, act._index)}
                            className="opacity-0 group-hover/act:opacity-100 transition-opacity shrink-0"
                          >
                            <Trash2 size={14} className={deleteBtnClass} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {group.items.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No activities — click &quot;+ Activity&quot; above.</p>
                    )}
                  </div>
                </motion.div>
              );
            });
          })()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Form ───────────────────────────────────────────────────
export default function ItineraryForm({ initialData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({});

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      title: "",
      client: "",
      travelFrom: "",
      travelTo: "",
      startDate: "",
      endDate: "",
      description: "",
      totalCost: 0,
      notes: "",
      status: "draft",
      isActive: true,
      destinations: [],
      transportation: {
        inbound: { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "" },
        outbound: { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "" },
      },
    },
  });

  const { fields: destFields, append: appendDest, remove: removeDest } = useFieldArray({ control, name: "destinations" });

  // ── Clients ──
  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients?limit=100");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });
  const clients = clientsData?.clients || [];

  // ── Gallery Images ──
  const { data: galleryData } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return res.json();
    },
  });
  const galleryImages = galleryData?.photos || [];

  // ── Image upload ──
  const handleImageUpload = async (e, destIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [destIndex]: true }));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setValue(`destinations.${destIndex}.image.url`, data.url);
        setValue(`destinations.${destIndex}.image._id`, undefined);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setUploading((prev) => ({ ...prev, [destIndex]: false }));
    }
  };

  // ── Nested activity helpers ──
  const addDay = (destIndex) => {
    const current = watch(`destinations.${destIndex}.activities`) || [];
    // Find next day number
    const usedDays = current.map((a) => a.day || 0);
    const nextDay = usedDays.length > 0 ? Math.max(...usedDays) + 1 : 1;
    setValue(`destinations.${destIndex}.activities`, [
      ...current,
      { day: nextDay, date: "", description: "", time: { from: "", to: "" } },
    ]);
  };

  const addActivityToDay = (destIndex, dayNum) => {
    const current = watch(`destinations.${destIndex}.activities`) || [];
    setValue(`destinations.${destIndex}.activities`, [
      ...current,
      { day: dayNum, date: "", description: "", time: { from: "", to: "" } },
    ]);
  };

  const removeDay = (destIndex, dayNum) => {
    const current = watch(`destinations.${destIndex}.activities`) || [];
    setValue(`destinations.${destIndex}.activities`, current.filter((a) => a.day !== dayNum));
  };

  const removeActivity = (destIndex, actIndex) => {
    const current = watch(`destinations.${destIndex}.activities`) || [];
    setValue(`destinations.${destIndex}.activities`, current.filter((_, i) => i !== actIndex));
  };

  // ── Save ──
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.client === "") data.client = null;

      // Remove empty transportation sections
      ["inbound", "outbound"].forEach((dir) => {
        const t = data.transportation?.[dir];
        if (t && !t.from && !t.to && !t.mode) {
          data.transportation[dir] = undefined;
        }
      });

      const url = initialData?._id ? `/api/itinerary/${initialData._id}` : "/api/itinerary";
      const method = initialData?._id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details ? errorData.details.join(", ") : errorData.error || "Failed to save itinerary");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      console.error("Save error", error);
      alert(`Failed to save itinerary: ${error.message}`);
    },
  });

  const onSubmit = (data) => saveMutation.mutate(data);

  // ─────────────────────── RENDER ────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-28">

      {/* ════════════════ 1. TRIP DETAILS ════════════════ */}
      <CollapsibleSection title="Trip Details" icon={Calendar}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className={labelClass}>Trip Name *</label>
            <input {...register("title", { required: "Title is required" })} className={inputClass} placeholder="e.g. Summer in Paris" />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>

          {/* Client */}
          <div className="space-y-2">
            <label className={labelClass}>Client</label>
            <div className="relative">
              <select {...register("client")} className={`${inputClass} appearance-none`}>
                <option value="" className="bg-white dark:bg-gray-900">Select a Client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id} className="bg-white dark:bg-gray-900">{c.name} ({c.email})</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
            </div>
          </div>

          {/* Travel From */}
          <div className="space-y-2">
            <label className={labelClass}>Travel From *</label>
            <input {...register("travelFrom", { required: "Travel From is required" })} className={inputClass} placeholder="e.g. New York" />
            {errors.travelFrom && <span className="text-red-500 text-xs">{errors.travelFrom.message}</span>}
          </div>

          {/* Travel To */}
          <div className="space-y-2">
            <label className={labelClass}>Travel To *</label>
            <input {...register("travelTo", { required: "Travel To is required" })} className={inputClass} placeholder="e.g. Paris" />
            {errors.travelTo && <span className="text-red-500 text-xs">{errors.travelTo.message}</span>}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className={labelClass}>Start Date *</label>
            <input type="date" {...register("startDate", { required: "Start Date is required" })} className={`${inputClass} scheme-light dark:scheme-dark`} />
            {errors.startDate && <span className="text-red-500 text-xs">{errors.startDate.message}</span>}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className={labelClass}>End Date *</label>
            <input type="date" {...register("endDate", { required: "End Date is required" })} className={`${inputClass} scheme-light dark:scheme-dark`} />
            {errors.endDate && <span className="text-red-500 text-xs">{errors.endDate.message}</span>}
          </div>

          {/* Total Cost */}
          <div className="space-y-2">
            <label className={labelClass}>Total Cost ($)</label>
            <input type="number" {...register("totalCost")} className={inputClass} placeholder="0.00" />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className={labelClass}>Status</label>
            <div className="relative">
              <select {...register("status")} className={`${inputClass} appearance-none`}>
                <option value="draft" className="bg-white dark:bg-gray-900">Draft</option>
                <option value="saved" className="bg-white dark:bg-gray-900">Saved</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-2">
            <label className={labelClass}>Description</label>
            <textarea {...register("description")} rows={3} className={inputClass} placeholder="Brief overview of this trip..." />
          </div>

          {/* Notes */}
          <div className="md:col-span-2 space-y-2">
            <label className={labelClass}>Notes</label>
            <textarea {...register("notes")} rows={2} className={inputClass} placeholder="Any internal notes or reminders..." />
          </div>
        </div>
      </CollapsibleSection>

      {/* ════════════════ 2. DESTINATIONS ════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>
            <MapPin size={22} className="text-purple-500" /> Destinations
          </h2>
          <button
            type="button"
            onClick={() => appendDest({ name: "", description: "", image: { title: "", description: "", url: "" }, activities: [] })}
            className={pillBtnClass}
          >
            <Plus size={16} /> Add Destination
          </button>
        </div>

        <AnimatePresence>
          {destFields.map((field, dIdx) => (
            <DestinationCard
              key={field.id}
              dIdx={dIdx}
              field={field}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              uploading={uploading}
              onUpload={handleImageUpload}
              onRemove={() => removeDest(dIdx)}
              addDay={addDay}
              addActivityToDay={addActivityToDay}
              removeDay={removeDay}
              removeActivity={removeActivity}
              galleryImages={galleryImages}
            />
          ))}
        </AnimatePresence>

        {destFields.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <MapPin size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">No destinations added yet.</p>
            <button
              type="button"
              onClick={() => appendDest({ name: "", description: "", image: { title: "", description: "", url: "" }, activities: [] })}
              className="mt-4 inline-flex items-center gap-2 text-sm text-purple-500 hover:text-purple-400 font-medium transition-colors"
            >
              <Plus size={16} /> Add your first destination
            </button>
          </div>
        )}
      </div>

      {/* ════════════════ 3. TRANSPORTATION ════════════════ */}
      <CollapsibleSection title="Transportation" icon={Bus} defaultOpen={false}>
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Plane size={16} className="text-green-500 -rotate-45" /> Inbound
            </h3>
            <TransportationFields prefix="transportation.inbound" register={register} errors={errors} />
          </div>
          <hr className="border-gray-200 dark:border-white/10" />
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Plane size={16} className="text-orange-500 rotate-135" /> Outbound
            </h3>
            <TransportationFields prefix="transportation.outbound" register={register} errors={errors} />
          </div>
        </div>
      </CollapsibleSection>

      {/* ════════════════ 4. ACTION BAR ════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-50 flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
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
