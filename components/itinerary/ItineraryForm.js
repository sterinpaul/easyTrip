"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Plus, Trash2, Save, Upload, Loader2, ChevronDown, ChevronUp,
  MapPin, Plane, Calendar, Image as ImageIcon, Activity, Bus,
  Search, Award, Building2, PlaneLanding, PlaneTakeoff, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImageSelector from "../common/ImageSelector";

// ─── Shared Styles ───────────────────────────────────────────────
const inputClass =
  "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400";
const labelClass = "text-sm font-medium text-gray-500 dark:text-gray-400";
const cardClass =
  "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-sm dark:shadow-none overflow-visible";
const pillBtnClass =
  "flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors";
const deleteBtnClass =
  "text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors";
const sectionTitleClass =
  "text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2";

// ─── Transport & Category Constants ──────────────────────────────
const TRANSPORT_MODES = [
  { value: "", label: "Select mode" },
  { value: "CAR", label: "🚗  Car" },
  { value: "BUS", label: "🚌  Bus" },
  { value: "TRAIN", label: "🚆  Train" },
  { value: "FLIGHT", label: "✈️  Flight" },
  { value: "CRUISE", label: "🚢  Cruise" },
];

const CATEGORIES = ["SINGLE", "FAMILY", "GROUP", "HONEYMOON"];
const TYPES = ["ECONOMY", "STANDARD", "PREMIUM"];
const HOTEL_TYPES = ["ECONOMY", "STANDARD", "PREMIUM", "DELUXE"];
const TRANSPORT_MODE_OPTIONS = ["FLIGHT", "CAR", "BUS", "TRAIN", "CRUISE"];

// ─── Collapsible Section Wrapper ─────────────────────────────────
function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children, className = "", style = {} }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${cardClass} ${className}`} style={style}>
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
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Transportation Sub‑form ─────────────────────────────────────
function TransportationFields({ prefix, register, errors, watch }) {
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
        <input {...register(`${prefix}.vehicleDetails`)} className={inputClass} placeholder="e.g. Flight AI-302, Seat 14A" spellCheck={true} />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>From *</label>
        <input {...register(`${prefix}.from`, { required: "From is required" })} className={inputClass} placeholder="Departure location" spellCheck={true} />
        {e?.from && <span className="text-red-500 text-xs">{e.from.message}</span>}
      </div>
      <div className="space-y-2">
        <label className={labelClass}>To *</label>
        <input {...register(`${prefix}.to`, { required: "To is required" })} className={inputClass} placeholder="Arrival location" spellCheck={true} />
        {e?.to && <span className="text-red-500 text-xs">{e.to.message}</span>}
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Departure Time</label>
        <input
          type="datetime-local"
          {...register(`${prefix}.departureTime`, {
            validate: (val) => {
              const arrival = watch(`${prefix}.arrivalTime`);
              if (val && arrival && val > arrival) return "Departure cannot be after arrival";
              return true;
            }
          })}
          max={watch(`${prefix}.arrivalTime`) || undefined}
          className={`${inputClass} scheme-light dark:scheme-dark`}
        />
        {e?.departureTime && <span className="text-red-500 text-xs">{e.departureTime.message}</span>}
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Arrival Time</label>
        <input
          type="datetime-local"
          {...register(`${prefix}.arrivalTime`, {
            validate: (val) => {
              const departure = watch(`${prefix}.departureTime`);
              if (val && departure && val < departure) return "Arrival cannot be before departure";
              return true;
            }
          })}
          min={watch(`${prefix}.departureTime`) || undefined}
          className={`${inputClass} scheme-light dark:scheme-dark`}
        />
        {e?.arrivalTime && <span className="text-red-500 text-xs">{e.arrivalTime.message}</span>}
      </div>
      <div className="md:col-span-2 space-y-2">
        <label className={labelClass}>Notes (baggage, layovers, etc.)</label>
        <input {...register(`${prefix}.notes`)} className={inputClass} placeholder="e.g. BAGGAGE: 7 KGS | 0 KGS" spellCheck={true} />
      </div>
    </div>
  );
}

// ─── Client Selector ─────────────────────────────────────────────
function ClientSelector({ selectedClient, onChange }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);

  const { data, isFetching } = useQuery({
    queryKey: ["client-search", debouncedSearch],
    queryFn: async () => {
      let url = "/api/clients?limit=10";
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    }
  });

  const results = data?.clients || [];

  return (
    <div className="space-y-3">
      {selectedClient ? (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-500/20">
          <div>
            <div className="font-semibold">{selectedClient.name || "Unknown Client"}</div>
            {selectedClient.email && <div className="text-xs opacity-80">{selectedClient.email}</div>}
          </div>
          <button type="button" onClick={() => onChange(null)} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 p-2"><X size={16} /></button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center relative">
            <Search className="absolute left-3 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name, email, or phone..."
              className={`${inputClass} pl-10 text-sm py-2`}
            />
          </div>
          {search && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {search !== debouncedSearch || isFetching ? (
                <div className="py-6 text-center flex flex-col items-center justify-center text-sm text-gray-400">
                  <Loader2 className="animate-spin mb-2 text-blue-500" size={20} />
                  <span>Searching clients...</span>
                </div>
              ) : results.length > 0 ? (
                results.map(c => (
                  <button
                    key={c._id}
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    onClick={() => {
                      onChange({ _id: c._id, name: c.name, email: c.email });
                      setSearch("");
                    }}>
                    <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.email} {c.phone ? `• ${c.phone}` : ""}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No clients found.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Destination Card ────────────────────────────────────────────
function HotelSelector({ selectedHotels, onChange }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);

  const { data, isFetching } = useQuery({
    queryKey: ["hotel-search", debouncedSearch],
    queryFn: async () => {
      let url = "/api/hotels?limit=10";
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch hotels");
      return res.json();
    }
  });

  const results = data?.hotels || [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selectedHotels.map((h, i) => {
          // Backward compatibility for when it was just string IDs
          if (typeof h === "string") {
            return (
              <div key={i} className="flex items-center gap-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-500/20">
                <span>Unknown Hotel (ID)</span>
                <button type="button" onClick={() => onChange(selectedHotels.filter((_, idx) => idx !== i))} className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 ml-1"><X size={12} /></button>
              </div>
            );
          }
          return (
            <div key={h._id || i} className="flex items-center gap-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-500/20">
              <span className="truncate max-w-[200px]">{h.name}{h.city ? ` (${h.city})` : ""}</span>
              <button type="button" onClick={() => onChange(selectedHotels.filter(sh => (sh._id || sh) !== h._id))} className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 ml-1"><X size={14} /></button>
            </div>
          );
        })}
        {selectedHotels.length === 0 && <span className="text-xs text-gray-400 italic">No hotels selected.</span>}
      </div>

      <div className="relative">
        <div className="flex items-center relative">
          <Search className="absolute left-3 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotels by name or city..."
            className={`${inputClass} pl-10 text-sm py-2`}
          />
        </div>
        {search && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {search !== debouncedSearch || isFetching ? (
              <div className="py-6 text-center flex flex-col items-center justify-center text-sm text-gray-400">
                <Loader2 className="animate-spin mb-2 text-purple-500" size={20} />
                <span>Searching hotels...</span>
              </div>
            ) : results.length > 0 ? (
              results.map(h => {
                const isSelected = selectedHotels.some(sh => (sh._id || sh) === h._id);
                if (isSelected) return null;
                return (
                  <button
                    key={h._id}
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    onClick={() => {
                      onChange([...selectedHotels, { _id: h._id, name: h.name, city: h.city }]);
                      setSearch("");
                    }}>
                    <div className="font-semibold text-gray-900 dark:text-white">{h.name}</div>
                    {h.city && <div className="text-xs text-gray-500 mt-0.5">{h.city}</div>}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No hotels found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DestinationCard({
  dIdx, field, register, watch, setValue, errors, onRemove,
  addDay, addActivityToDay, removeDay, removeActivity
}) {
  const [showTransport, setShowTransport] = useState(true);
  const [showHotels, setShowHotels] = useState(true);
  const itinerary = watch(`destinations.${dIdx}.itinerary`) || [];
  const imageUrl = watch(`destinations.${dIdx}.image.url`);
  const hotelDetails = watch(`destinations.${dIdx}.hotelDetails`) || [];

  const addHotelType = () => {
    const current = watch(`destinations.${dIdx}.hotelDetails`) || [];
    setValue(`destinations.${dIdx}.hotelDetails`, [
      ...current,
      { type: "STANDARD", isSelected: false, hotels: [] }
    ]);
  };

  const removeHotelType = (htIdx) => {
    const current = watch(`destinations.${dIdx}.hotelDetails`) || [];
    setValue(`destinations.${dIdx}.hotelDetails`, current.filter((_, i) => i !== htIdx));
  };

  const toggleHotelInType = (htIdx, hotelId) => {
    const current = watch(`destinations.${dIdx}.hotelDetails.${htIdx}.hotels`) || [];
    if (current.includes(hotelId)) {
      setValue(`destinations.${dIdx}.hotelDetails.${htIdx}.hotels`, current.filter(id => id !== hotelId));
    } else {
      setValue(`destinations.${dIdx}.hotelDetails.${htIdx}.hotels`, [...current, hotelId]);
    }
  };

  return (
    <motion.div
      key={field.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${cardClass} relative group`}
      style={{ zIndex: 50 - dIdx }}
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
            placeholder="e.g. Malaysia"
            spellCheck={true}
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
            spellCheck={true}
          />
        </div>
      </div>

      {/* ── Transportation (per destination) ── */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowTransport((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Plane size={16} className="text-green-500" /> Travel Details
          </h3>
          {showTransport ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        <AnimatePresence initial={false}>
          {showTransport && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <div className="mt-4 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <PlaneTakeoff size={14} className="text-green-500" /> Outbound
                  </h4>
                  <TransportationFields prefix={`destinations.${dIdx}.transportation.outbound`} register={register} errors={errors} watch={watch} />
                </div>
                <hr className="border-gray-200 dark:border-white/10" />
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <PlaneLanding size={14} className="text-orange-500" /> Inbound
                  </h4>
                  <TransportationFields prefix={`destinations.${dIdx}.transportation.inbound`} register={register} errors={errors} watch={watch} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Hotel Details (per destination) ── */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowHotels((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Building2 size={16} className="text-amber-500" /> Hotel Details
          </h3>
          {showHotels ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        <AnimatePresence initial={false}>
          {showHotels && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <div className="mt-4 space-y-4">
                {hotelDetails.map((ht, htIdx) => (
                  <div key={htIdx} className="p-4 bg-gray-50 dark:bg-white/3 rounded-xl border border-gray-100 dark:border-white/5 relative group/ht">
                    <button type="button" onClick={() => removeHotelType(htIdx)} className="absolute top-3 right-3 opacity-0 group-hover/ht:opacity-100 transition-opacity">
                      <Trash2 size={14} className={deleteBtnClass} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="space-y-2">
                        <label className={labelClass}>Type</label>
                        <div className="relative">
                          <select {...register(`destinations.${dIdx}.hotelDetails.${htIdx}.type`)} className={`${inputClass} appearance-none`}>
                            {HOTEL_TYPES.map(t => <option key={t} value={t} className="bg-white dark:bg-gray-900">{t}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                        </div>
                      </div>
                      <div className="space-y-2 flex items-end">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox"
                            checked={watch(`destinations.${dIdx}.hotelDetails.${htIdx}.isSelected`)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                const currentDetails = watch(`destinations.${dIdx}.hotelDetails`) || [];
                                currentDetails.forEach((_, idx) => {
                                  if (idx !== htIdx) {
                                    setValue(`destinations.${dIdx}.hotelDetails.${idx}.isSelected`, false);
                                  }
                                });
                              }
                              setValue(`destinations.${dIdx}.hotelDetails.${htIdx}.isSelected`, checked);
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                          />
                          <span className={labelClass}>Selected for Itinerary</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className={labelClass}>Hotels</label>
                      <HotelSelector
                        selectedHotels={watch(`destinations.${dIdx}.hotelDetails.${htIdx}.hotels`) || []}
                        onChange={(newHotels) => setValue(`destinations.${dIdx}.hotelDetails.${htIdx}.hotels`, newHotels)}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addHotelType} className={pillBtnClass}>
                  <Plus size={14} /> Add Hotel Category
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Itinerary / Activities (grouped by Day) ── */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Activity size={16} className="text-pink-500" /> Itinerary
          </h3>
        </div>

        <AnimatePresence>
          {(() => {
            const grouped = {};
            itinerary.forEach((item, aIdx) => {
              const dayNum = item.day || 1;
              if (!grouped[dayNum]) grouped[dayNum] = { items: [] };
              grouped[dayNum].items.push({ ...item, _index: aIdx });
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
                  <div className="flex items-center justify-between mb-3 gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-xs font-bold">
                        {dayNum}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-gray-700 dark:text-gray-300">Day {dayNum}</span>
                      <input
                        {...register(`destinations.${dIdx}.itinerary.${group.items[0]._index}.title`)}
                        className={`${inputClass} py-1! text-sm! flex-1 min-w-0`}
                        placeholder="Day title (Optional)"
                        spellCheck={true}
                      />
                    </div>
                    <div className="flex items-center gap-2">
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
                      {group.items.map((act) => (
                        <motion.div
                          key={`${field.id}-act-${act._index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-start gap-3 group/act"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                {...register(`destinations.${dIdx}.itinerary.${act._index}.activity`)}
                                className={`${inputClass} py-1.5! text-sm! flex-1`}
                                placeholder="Activity description"
                                spellCheck={true}
                              />
                            </div>

                            {/* Dynamic SubActivities */}
                            {(watch(`destinations.${dIdx}.itinerary.${act._index}.subActivities`) || []).map((subAct, subIdx) => (
                              <div key={`${act._index}-sub-${subIdx}`} className="flex items-center gap-2 pl-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-300 dark:bg-purple-600 shrink-0" />
                                <input
                                  {...register(`destinations.${dIdx}.itinerary.${act._index}.subActivities.${subIdx}`)}
                                  className={`${inputClass} py-1! text-xs! flex-1 italic bg-transparent border-t-0 border-x-0 rounded-none focus:ring-0 border-b-gray-200 dark:border-b-white/10`}
                                  placeholder="Sub-activity (Optional)"
                                  spellCheck={true}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = watch(`destinations.${dIdx}.itinerary.${act._index}.subActivities`) || [];
                                    setValue(`destinations.${dIdx}.itinerary.${act._index}.subActivities`, current.filter((_, i) => i !== subIdx));
                                  }}
                                  className="text-red-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const current = watch(`destinations.${dIdx}.itinerary.${act._index}.subActivities`) || [];
                                setValue(`destinations.${dIdx}.itinerary.${act._index}.subActivities`, [...current, ""]);
                              }}
                              // className="text-purple-500 hover:text-purple-400 shrink-0"
                              className="text-xs text-purple-500 hover:text-purple-400 flex items-center gap-1 transition-colors mt-2 ml-auto"
                              title="Add Sub-Activity"
                            >
                              <Plus size={10} />Add Sub-Activity
                            </button>

                          </div>

                          <input type="hidden" {...register(`destinations.${dIdx}.itinerary.${act._index}.day`, { valueAsNumber: true })} />
                          <button
                            type="button"
                            onClick={() => removeActivity(dIdx, act._index)}
                            className="mt-2 text-red-500 opacity-0 group-hover/act:opacity-100 transition-opacity shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>

                        </motion.div>
                      ))}

                    </AnimatePresence>
                    {group.items.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No activities added yet.</p>
                    )}
                    <button
                      type="button"
                      onClick={() => addActivityToDay(dIdx, dayNum)}
                      className="text-xs text-purple-500 hover:text-purple-400 flex items-center gap-1 transition-colors mt-2"
                    >
                      <Plus size={12} /> Add Activity
                    </button>
                  </div>
                </motion.div>
              );
            });
          })()}
        </AnimatePresence>

        <button type="button" onClick={() => addDay(dIdx)} className={`${pillBtnClass} mt-2`}>
          <Plus size={14} /> Add Day
        </button>
      </div>
    </motion.div >
  );
}

// ─── Debounced Search Hook ───────────────────────────────────────
function useDebouncedValue(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Package ID Validator ────────────────────────────────────────
function PackageIdValidator({ packageId, currentId }) {
  const debouncedId = useDebouncedValue(packageId, 600);

  const { data, isFetching } = useQuery({
    queryKey: ["packageId-check", debouncedId],
    queryFn: async () => {
      const res = await fetch(`/api/itinerary?packageId=${encodeURIComponent(debouncedId)}&limit=1`);
      if (!res.ok) throw new Error("Failed to check");
      return res.json();
    },
    enabled: !!debouncedId && debouncedId.length >= 2,
  });

  if (!packageId || packageId.length < 2) return null;
  if (packageId !== debouncedId || isFetching) return null;

  const matches = data?.itineraries || [];
  const isDuplicate = matches.some(it => it._id !== currentId && it.packageId?.toLowerCase() === debouncedId.toLowerCase());

  if (isDuplicate) {
    return <span className="text-red-500 text-xs flex items-center gap-1 mt-1">✕ Package ID already exists</span>;
  }
  return <span className="text-green-500 text-xs flex items-center gap-1 mt-1">✓ Available</span>;
}

// ─── Main Form ───────────────────────────────────────────────────
export default function ItineraryForm({ initialData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({});
  const [packageSearch, setPackageSearch] = useState("");
  const debouncedPackageSearch = useDebouncedValue(packageSearch, 500);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      title: "",
      packageId: "",
      client: null,
      guestCount: { adults: 2, children: 0, infants: 0 },
      departureFrom: "",
      arrivalAt: "",
      startDate: "",
      endDate: "",
      duration: { days: 0, nights: 0 },
      category: "FAMILY",
      type: "STANDARD",
      totalCost: 0,
      rewardPoints: 0,
      rewardPercentage: 0,
      notes: "",
      transportationModes: [],
      includes: [""],
      excludes: [""],
      isActive: true,
      heroImage: null,
      highlightImages: [],
      destinations: [{
        name: "", description: "",
        image: { title: "", description: "", url: "" },
        transportation: {
          outbound: { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "", notes: "" },
          inbound: { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "", notes: "" },
        },
        hotelDetails: [],
        itinerary: [{ day: 1, title: "", activity: "", subActivities: [] }],
      }],
    },
  });

  const { fields: destFields, append: appendDest, remove: removeDest } = useFieldArray({ control, name: "destinations" });

  // Auto-calculate duration from dates ONLY if not touched/changed manually
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const calculatedNights = calculatedDays - 1;
      if (calculatedDays > 0) {
        // We only set it if duration hasn't been specifically set
        const currentDays = watch("duration.days");
        const currentNights = watch("duration.nights");
        if (!currentDays || currentDays === 0) {
          setValue("duration.days", calculatedDays);
        }
        if (!currentNights || currentNights === 0) {
          setValue("duration.nights", calculatedNights);
        }
      }
    }
  }, [startDate, endDate, setValue, watch]);

  // Auto-calculate reward points from totalCost & rewardPercentage
  const totalCost = watch("totalCost");
  const rewardPercentage = watch("rewardPercentage");
  const [rewardEnabled, setRewardEnabled] = useState(
    () => !!(initialData?.rewardPercentage || initialData?.rewardPoints)
  );
  useEffect(() => {
    if (rewardEnabled && totalCost && rewardPercentage) {
      const points = Math.round((Number(totalCost) * Number(rewardPercentage)) / 100);
      setValue("rewardPoints", points);
    } else if (!rewardEnabled) {
      setValue("rewardPercentage", 0);
      setValue("rewardPoints", 0);
    }
  }, [totalCost, rewardPercentage, rewardEnabled, setValue]);

  // ── Clients ──
  // Clients are now searched via debounced input component.

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

  // ── Package Search (debounced) ──
  const { data: searchResults, isFetching: isFetchingPackages } = useQuery({
    queryKey: ["itinerary-search", debouncedPackageSearch],
    queryFn: async () => {
      const res = await fetch(`/api/itinerary?packageId=${encodeURIComponent(debouncedPackageSearch)}&limit=5`);
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    },
    enabled: debouncedPackageSearch.length >= 2,
  });

  const handlePrefillFromSearch = (itinerary) => {
    const serializeTransportTime = (t) => {
      if (!t) return { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "", notes: "" };
      return {
        _id: t._id?.toString?.() || t._id,
        mode: t.mode || "",
        from: t.from || "",
        to: t.to || "",
        departureTime: t.departureTime ? new Date(t.departureTime).toISOString().slice(0, 16) : "",
        arrivalTime: t.arrivalTime ? new Date(t.arrivalTime).toISOString().slice(0, 16) : "",
        vehicleDetails: t.vehicleDetails || "",
        notes: t.notes || "",
      };
    };

    reset({
      ...itinerary,
      _id: initialData?._id,
      client: itinerary.client && typeof itinerary.client === 'object' ? {
        _id: itinerary.client._id,
        name: itinerary.client.name || "Selected Client",
        email: itinerary.client.email || ""
      } : null,
      startDate: itinerary.startDate ? new Date(itinerary.startDate).toISOString().split("T")[0] : "",
      endDate: itinerary.endDate ? new Date(itinerary.endDate).toISOString().split("T")[0] : "",
      destinations: (itinerary.destinations || []).map(dest => ({
        name: dest.name || "",
        description: dest.description || "",
        image: dest.image ? { _id: dest.image._id, url: dest.image.url, title: dest.image.title || "", description: dest.image.description || "" } : { url: "", title: "", description: "" },
        transportation: {
          outbound: serializeTransportTime(dest.transportation?.outbound),
          inbound: serializeTransportTime(dest.transportation?.inbound),
        },
        hotelDetails: (dest.hotelDetails || []).map(ht => ({
          type: ht.type || "STANDARD",
          isSelected: ht.isSelected || false,
          hotels: (ht.hotels || []).map(h => typeof h === 'object' ? { _id: h._id, name: h.name || "", city: h.city || "" } : h),
        })),
        itinerary: (dest.itinerary || []).flatMap(item =>
          (item.activities || []).map(act => ({
            day: item.day,
            title: item.title || "",
            activity: act.activity || "",
            subActivities: act.subActivities || []
          }))
        ),
      })),
      heroImage: itinerary.heroImage ? {
        _id: itinerary.heroImage._id || itinerary.heroImage,
        url: itinerary.heroImage.url || "",
        title: itinerary.heroImage.title || ""
      } : null,
      highlightImages: (itinerary.highlightImages || []).map(img => typeof img === 'object' ? {
        _id: img._id,
        url: img.url || "",
        title: img.title || ""
      } : img),
      rewardPercentage: itinerary.rewardPercentage || 0,
      rewardPoints: itinerary.rewardPoints || 0,
    });
    setPackageSearch("");
    // Enable reward section if loaded itinerary has reward data
    if (itinerary.rewardPercentage || itinerary.rewardPoints) {
      setRewardEnabled(true);
    }
  };

  // ── Image upload ──
  const handleImageUpload = async (e, destIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [destIndex]: true }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderName", "destinations");
    formData.append("quality", "85");
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

  // ── Nested itinerary helpers ──
  const addDay = (destIndex) => {
    const current = watch(`destinations.${destIndex}.itinerary`) || [];
    const usedDays = current.map((a) => a.day || 0);
    const nextDay = usedDays.length > 0 ? Math.max(...usedDays) + 1 : 1;
    setValue(`destinations.${destIndex}.itinerary`, [
      ...current,
      { day: nextDay, title: "", activity: "", subActivities: [] },
    ]);
  };

  const addActivityToDay = (destIndex, dayNum) => {
    const current = watch(`destinations.${destIndex}.itinerary`) || [];
    setValue(`destinations.${destIndex}.itinerary`, [
      ...current,
      { day: dayNum, title: "", activity: "", subActivities: [] },
    ]);
  };

  const removeDay = (destIndex, dayNum) => {
    const current = watch(`destinations.${destIndex}.itinerary`) || [];
    setValue(`destinations.${destIndex}.itinerary`, current.filter((a) => a.day !== dayNum));
  };

  const removeActivity = (destIndex, actIndex) => {
    const current = watch(`destinations.${destIndex}.itinerary`) || [];
    setValue(`destinations.${destIndex}.itinerary`, current.filter((_, i) => i !== actIndex));
  };

  // ── Includes/Excludes helpers ──
  const addInclude = () => {
    const current = watch("includes") || [];
    setValue("includes", [...current, ""]);
  };
  const removeInclude = (idx) => {
    const current = watch("includes") || [];
    setValue("includes", current.filter((_, i) => i !== idx));
  };
  const addExclude = () => {
    const current = watch("excludes") || [];
    setValue("excludes", [...current, ""]);
  };
  const removeExclude = (idx) => {
    const current = watch("excludes") || [];
    setValue("excludes", current.filter((_, i) => i !== idx));
  };

  // ── Save ──
  const saveMutation = useMutation({
    mutationFn: async (dataToSave) => {
      const data = { ...dataToSave };
      if (!data.client) data.client = null;
      else if (data.client._id) data.client = data.client._id;

      // Group itinerary items by day for the backend schema
      if (data.destinations) {
        data.destinations = data.destinations.map(dest => ({
          ...dest,
          itinerary: (() => {
            const items = dest.itinerary || [];
            const dayMap = new Map();
            items.forEach(item => {
              const dayNum = item.day;
              if (!dayMap.has(dayNum)) {
                dayMap.set(dayNum, { day: dayNum, title: item.title || "", activities: [] });
              }
              if (item.activity) {
                dayMap.get(dayNum).activities.push({
                  activity: item.activity,
                  subActivities: (item.subActivities || []).filter(s => typeof s === 'string' ? !!s.trim() : false)
                });
              }
            });
            return Array.from(dayMap.values());
          })()
        }));
      }

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
      router.push("/itinerary");
      router.refresh();
    },
    onError: (error) => {
      console.error("Save error", error);
      alert(`Failed to save itinerary: ${error.message}`);
    },
  });

  const onSubmit = (data) => saveMutation.mutate(data);

  const includes = watch("includes") || [];
  const excludes = watch("excludes") || [];
  const transportationModes = watch("transportationModes") || [];

  // ─────────────────────── RENDER ────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-28">

      {/* ════════════════ PACKAGE SEARCH ════════════════ */}
      <div className={`${cardClass} relative`} style={{ zIndex: 60 }}>
        <h2 className={sectionTitleClass}>
          <Search size={22} className="text-purple-500" /> Load from Saved Itinerary
        </h2>
        <div className="mt-4 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={packageSearch}
            onChange={(e) => setPackageSearch(e.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="Search by Package ID (e.g. PU-KRA-APRIL01)..."
            spellCheck={true}
          />
          {packageSearch.length >= 2 && (packageSearch !== debouncedPackageSearch || isFetchingPackages) ? (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 p-6 flex flex-col items-center justify-center text-center">
              <Loader2 className="animate-spin mb-2 text-purple-500" size={20} />
              <span className="text-sm text-gray-500">Searching packages...</span>
            </div>
          ) : debouncedPackageSearch.length >= 2 && searchResults?.itineraries?.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              {searchResults.itineraries.map((it) => (
                <button
                  key={it._id}
                  type="button"
                  onClick={() => handlePrefillFromSearch(it)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{it.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {it.packageId} • {it.destinations?.length || 0} destinations
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════ 1. TRIP DETAILS ════════════════ */}
      <CollapsibleSection title="Trip Details" icon={Calendar} className="relative" style={{ zIndex: 50 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="space-y-2">
            <label className={labelClass}>Trip Name *</label>
            <input {...register("title", { required: "Title is required" })} className={inputClass} placeholder="e.g. Malaysia-Singapore-Phuket" spellCheck={true} />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>

          {/* Package ID */}
          <div className="space-y-2">
            <label className={labelClass}>Package ID *</label>
            <input {...register("packageId", { required: "Package ID is required" })} className={inputClass} placeholder="e.g. PU-KRA-APRIL01" spellCheck={true} />
            {errors.packageId && <span className="text-red-500 text-xs">{errors.packageId.message}</span>}
            <PackageIdValidator packageId={watch("packageId")} currentId={initialData?._id} />
          </div>

          {/* Client */}
          <div className="space-y-2">
            <label className={labelClass}>Client</label>
            <ClientSelector
              selectedClient={watch("client")}
              onChange={(c) => setValue("client", c)}
            />
          </div>

          {/* Guest Count */}
          <div className="space-y-2">
            <label className={labelClass}>Guests *</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400">Adults</label>
                <input type="number" min="1" {...register("guestCount.adults", { required: true, valueAsNumber: true })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-gray-400">Children</label>
                <input type="number" min="0" {...register("guestCount.children", { valueAsNumber: true })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-gray-400">Infants</label>
                <input type="number" min="0" {...register("guestCount.infants", { valueAsNumber: true })} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Category & Type */}
          <div className="space-y-2">
            <label className={labelClass}>Category *</label>
            <div className="flex flex-wrap gap-2 py-1">
              {CATEGORIES.map(category => (
                <label key={category} className="cursor-pointer mb-2">
                  <input type="radio" {...register("category", { required: true })} value={category} className="sr-only peer" />
                  <span className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors peer-checked:bg-purple-500 peer-checked:text-white peer-checked:border-purple-500 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-purple-400">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Type *</label>
            <div className="flex flex-wrap gap-2 py-1">
              {TYPES.map(type => (
                <label key={type} className="cursor-pointer mb-2">
                  <input type="radio" {...register("type", { required: true })} value={type} className="sr-only peer" />
                  <span className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors peer-checked:bg-pink-500 peer-checked:text-white peer-checked:border-pink-500 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-pink-400">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Departure / Arrival */}
          <div className="space-y-2">
            <label className={labelClass}>Departing From *</label>
            <input {...register("departureFrom", { required: "Required" })} className={inputClass} placeholder="e.g. COK" spellCheck={true} />
            {errors.departureFrom && <span className="text-red-500 text-xs">{errors.departureFrom.message}</span>}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Arriving At *</label>
            <input {...register("arrivalAt", { required: "Required" })} className={inputClass} placeholder="e.g. COK" spellCheck={true} />
            {errors.arrivalAt && <span className="text-red-500 text-xs">{errors.arrivalAt.message}</span>}
          </div>

          {/* Start & End Date */}
          <div className="space-y-2">
            <label className={labelClass}>Start Date *</label>
            <input
              type="date"
              {...register("startDate", {
                required: "Start Date is required",
                validate: (val) => {
                  const today = new Date().toISOString().split("T")[0];
                  if (!initialData?._id && val < today) return "Travel date cannot be in the past";
                  if (endDate && val > endDate) return "Start date cannot be after end date";
                  return true;
                }
              })}
              min={!initialData?._id ? new Date().toISOString().split("T")[0] : undefined}
              max={endDate || undefined}
              className={`${inputClass} scheme-light dark:scheme-dark`}
            />
            {errors.startDate && <span className="text-red-500 text-xs">{errors.startDate.message}</span>}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>End Date *</label>
            <input
              type="date"
              {...register("endDate", {
                required: "End Date is required",
                validate: (val) => {
                  const today = new Date().toISOString().split("T")[0];
                  const minDate = startDate || (!initialData?._id ? today : "");
                  if (minDate && val < minDate) return "End date cannot be before start date or today";
                  return true;
                }
              })}
              min={startDate || (!initialData?._id ? new Date().toISOString().split("T")[0] : undefined)}
              className={`${inputClass} scheme-light dark:scheme-dark`}
            />
            {errors.endDate && <span className="text-red-500 text-xs">{errors.endDate.message}</span>}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className={labelClass}>Duration</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  {...register("duration.days", { valueAsNumber: true })}
                  className={inputClass}
                  min="0"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Days</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  {...register("duration.nights", { valueAsNumber: true })}
                  className={inputClass}
                  min="0"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Nights</span>
              </div>
            </div>
          </div>

          {/* Transportation Modes */}
          <div className="space-y-2">
            <label className={labelClass}>Transportation Modes *</label>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {TRANSPORT_MODE_OPTIONS.map(mode => (
                <label key={mode} className="cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    value={mode}
                    checked={transportationModes.includes(mode)}
                    onChange={(e) => {
                      const current = watch("transportationModes") || [];
                      if (e.target.checked) {
                        setValue("transportationModes", [...current, mode]);
                      } else {
                        setValue("transportationModes", current.filter(m => m !== mode));
                      }
                    }}
                    className="sr-only peer"
                  />
                  <span className="px-3 py-1.5 rounded-lg font-medium border transition-colors peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-green-400">
                    {mode}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Total Cost */}
          <div className="space-y-2">
            <label className={labelClass}>Total Cost (₹)</label>
            <input type="number" {...register("totalCost", { valueAsNumber: true })} className={inputClass} min="0" placeholder="0" />
          </div>

          {/* Reward % + Points */}
          <div className="space-y-2">
            <label className={labelClass}>
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rewardEnabled}
                  onChange={(e) => setRewardEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-purple-500 focus:ring-purple-500/50 accent-purple-500"
                />
                <Award size={14} className="text-purple-400" />
                Reward Points
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Percentage (%)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  {...register("rewardPercentage", { valueAsNumber: true })}
                  disabled={!rewardEnabled}
                  className={`${inputClass} ${!rewardEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Points (auto)</label>
                <input
                  type="number"
                  {...register("rewardPoints", { valueAsNumber: true })}
                  readOnly
                  disabled={!rewardEnabled}
                  className={`${inputClass} bg-gray-100 dark:bg-white/3 cursor-not-allowed ${!rewardEnabled ? 'opacity-50' : ''}`}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2 space-y-2">
            <label className={labelClass}>Notes</label>
            <textarea {...register("notes")} rows={2} className={inputClass} placeholder="Any internal notes or reminders..." spellCheck={true} />
          </div>

          {/* Hero Image */}
          <div className="md:col-span-2 space-y-2 mt-4">
            <label className={labelClass}>Hero Image</label>
            <ImageSelector
              selectedImages={watch("heroImage") ? [watch("heroImage")] : []}
              onChange={(imgs) => setValue("heroImage", imgs[0] || null)}
              multiple={false}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* ════════════════ 3. DESTINATIONS ════════════════ */}
      <div className="space-y-4 relative" style={{ zIndex: 30 }}>
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>
            <MapPin size={22} className="text-purple-500" /> Destinations
          </h2>
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
            />
          ))}
        </AnimatePresence>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => appendDest({
              name: "", description: "",
              image: { title: "", description: "", url: "" },
              transportation: {
                outbound: { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "", notes: "" },
                inbound: { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "", notes: "" },
              },
              hotelDetails: [],
              itinerary: [{ day: 1, title: "", activity: "", subActivities: [] }],
            })}
            className={`${pillBtnClass} bg-purple-50 dark:bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20`}
          >
            <Plus size={16} /> Add Destination
          </button>
        </div>
      </div>

      {/* ════════════════ 2. INCLUDES / EXCLUDES ════════════════ */}
      <CollapsibleSection title="Includes & Excludes" icon={Activity} className="relative" style={{ zIndex: 40 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Includes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`${labelClass} text-green-500`}>Includes</label>
              <button type="button" onClick={addInclude} className="text-xs text-purple-500 hover:text-purple-400 flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            {includes.map((_, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input {...register(`includes.${idx}`)} className={`${inputClass} py-2!`} placeholder="e.g. VISA" spellCheck={true} />
                <button type="button" onClick={() => removeInclude(idx)} className={deleteBtnClass}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          {/* Excludes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`${labelClass} text-red-500`}>Excludes</label>
              <button type="button" onClick={addExclude} className="text-xs text-purple-500 hover:text-purple-400 flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            {excludes.map((_, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input {...register(`excludes.${idx}`)} className={`${inputClass} py-2!`} placeholder="e.g. FLIGHT FARE" spellCheck={true} />
                <button type="button" onClick={() => removeExclude(idx)} className={deleteBtnClass}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ════════════════ 4. HIGHLIGHT IMAGES ════════════════ */}
      <div className="space-y-4 relative" style={{ zIndex: 20 }}>
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>
            <ImageIcon size={22} className="text-pink-500" /> Highlight Images
          </h2>
        </div>
        <div className={cardClass}>
          <ImageSelector
            selectedImages={watch("highlightImages") || []}
            onChange={(imgs) => setValue("highlightImages", imgs)}
            multiple={true}
          />
        </div>
      </div>

      {/* ════════════════ ACTIONS ════════════════ */}
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
