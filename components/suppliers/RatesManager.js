"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Edit, Trash2, Check, X, Upload, FileSpreadsheet } from "lucide-react";
import Select from "@/components/ui/Select";
import { inputCls, cardCls, primaryBtn, iconBtn, api, formatMoney } from "./ui";

const EMPTY = { packageName: "", guests: "", rooms: "", category: "", groupRate: "" };
const toPayload = (r) => ({
    packageName: r.packageName.trim(),
    guests: Number(r.guests),
    rooms: r.rooms === "" || r.rooms == null ? undefined : Number(r.rooms),
    category: r.category.trim(),
    groupRate: Number(r.groupRate),
});

function RateInputs({ value, onChange }) {
    const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
    const cell = "px-3 py-2";
    return (
        <>
            <td className={cell}><input aria-label="Package" className={inputCls} value={value.packageName} onChange={set("packageName")} placeholder="2N/3D" /></td>
            <td className={cell}><input aria-label="Guests" className={inputCls} type="number" min="1" value={value.guests} onChange={set("guests")} /></td>
            <td className={cell}><input aria-label="Rooms" className={inputCls} type="number" min="0" value={value.rooms ?? ""} onChange={set("rooms")} /></td>
            <td className={cell}><input aria-label="Category" className={inputCls} value={value.category} onChange={set("category")} placeholder="Deluxe" /></td>
            <td className={cell}><input aria-label="Group rate" className={inputCls} type="number" min="0" step="any" value={value.groupRate} onChange={set("groupRate")} /></td>
        </>
    );
}

export default function RatesManager({ supplier }) {
    const queryClient = useQueryClient();
    const base = `/api/suppliers/${supplier._id}/rates`;
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(EMPTY);
    const [newRate, setNewRate] = useState(null);
    const [mode, setMode] = useState("upsert");
    const [importResult, setImportResult] = useState(null);
    const fileRef = useRef(null);

    const { data, isLoading } = useQuery({ queryKey: ["rates", supplier._id], queryFn: () => api(base) });
    const rates = data?.rates || [];
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["rates", supplier._id] });

    const save = useMutation({
        mutationFn: ({ id, rate }) =>
            api(id ? `${base}/${id}` : base, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(toPayload(rate)),
            }),
        onSuccess: () => { setEditingId(null); setNewRate(null); refresh(); },
    });

    const remove = useMutation({
        mutationFn: (id) => api(`${base}/${id}`, { method: "DELETE" }),
        onSuccess: refresh,
    });

    const upload = useMutation({
        mutationFn: (file) => {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("mode", mode);
            return api(`${base}/import`, { method: "POST", body: fd });
        },
        onSuccess: (res) => { setImportResult(res); refresh(); },
        onSettled: () => { if (fileRef.current) fileRef.current.value = ""; },
    });

    const [dragging, setDragging] = useState(false);

    const handleFile = (file) => {
        if (fileRef.current) fileRef.current.value = "";
        if (!file || upload.isPending) return;
        if (!file.name.toLowerCase().endsWith(".xlsx")) {
            setImportResult(null);
            alert("Please choose an Excel .xlsx file.");
            return;
        }
        if (mode === "replace" && !confirm(`Replace ALL ${rates.length} existing rates for ${supplier.name} with this file?`)) return;
        setImportResult(null);
        upload.mutate(file);
    };

    const dropHandlers = {
        onDragOver: (e) => { e.preventDefault(); setDragging(true); },
        onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); },
        onDrop: (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); },
    };

    const th = "px-3 py-3 text-left";
    return (
        <div className={`space-y-6 ${cardCls}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rates</h2>
                    <p className="text-sm text-gray-400">Net rates for the entire group ({supplier.currency || "INR"}), flights excluded.</p>
                </div>
                <button type="button" onClick={() => { setNewRate(EMPTY); setEditingId(null); }} className={primaryBtn}>
                    <Plus size={18} /> Add Rate
                </button>
            </div>

            {/* Excel upload */}
            <div
                {...dropHandlers}
                className={`p-4 rounded-xl border-2 border-dashed space-y-3 transition-colors ${dragging
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                    : "border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/3"}`}
            >
                <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                    <FileSpreadsheet size={18} className="text-green-600" /> Bulk upload from Excel (.xlsx)
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Any sheet with header columns <b>Package</b>, <b>Guests</b>, <b>Category</b>, <b>Group rate</b> (and optional <b>Rooms</b>) is imported.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="sm:w-72">
                        <Select
                            aria-label="Import mode"
                            value={mode}
                            onChange={setMode}
                            options={[
                                { value: "upsert", label: "Add / update matching rates" },
                                { value: "replace", label: "Replace all existing rates" },
                            ]}
                        />
                    </div>
                    <input ref={fileRef} type="file" accept=".xlsx" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" id="rates-file" />
                    <label htmlFor="rates-file" className={`${primaryBtn} cursor-pointer ${upload.isPending ? "pointer-events-none opacity-50" : ""}`}>
                        {upload.isPending ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Upload Excel
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {dragging ? "Drop the file to upload" : "or drag & drop an .xlsx file here"}
                    </span>
                </div>
                {upload.isError && <p className="text-sm text-red-500">{upload.error.message}</p>}
                {importResult && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Imported from sheet “{importResult.sheet}”: <b>{importResult.inserted}</b> added, <b>{importResult.updated}</b> updated
                        {importResult.skipped.length > 0 && <>, <b className="text-amber-600">{importResult.skipped.length}</b> skipped</>}.
                        {importResult.skipped.length > 0 && (
                            <ul className="mt-1 text-xs text-amber-600 list-disc pl-5">
                                {importResult.skipped.slice(0, 20).map((s) => <li key={`${s.sheet}-${s.row}`}>Row {s.row}: {s.reason}</li>)}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {(save.isError || remove.isError) && <p className="text-sm text-red-500">{(save.error || remove.error).message}</p>}

            <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[640px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/80 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className={th}>Package</th><th className={th}>Guests</th><th className={th}>Rooms</th>
                            <th className={th}>Category</th><th className={th}>Group rate</th><th className={th}>Per person</th><th className={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/10 text-gray-700 dark:text-gray-300">
                        {newRate && (
                            <tr>
                                <RateInputs value={newRate} onChange={setNewRate} />
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2"><RowActions busy={save.isPending} onSave={() => save.mutate({ rate: newRate })} onCancel={() => setNewRate(null)} /></td>
                            </tr>
                        )}
                        {isLoading ? (
                            <tr><td colSpan="7" className="py-10"><Loader2 className="animate-spin text-purple-500 mx-auto" /></td></tr>
                        ) : rates.map((r) =>
                            editingId === r._id ? (
                                <tr key={r._id}>
                                    <RateInputs value={draft} onChange={setDraft} />
                                    <td className="px-3 py-2">-</td>
                                    <td className="px-3 py-2"><RowActions busy={save.isPending} onSave={() => save.mutate({ id: r._id, rate: draft })} onCancel={() => setEditingId(null)} /></td>
                                </tr>
                            ) : (
                                <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{r.packageName}</td>
                                    <td className="px-3 py-3">{r.guests}</td>
                                    <td className="px-3 py-3">{r.rooms ?? "-"}</td>
                                    <td className="px-3 py-3">{r.category}</td>
                                    <td className="px-3 py-3">{formatMoney(r.groupRate, supplier.currency)}</td>
                                    <td className="px-3 py-3 text-gray-500">{formatMoney(r.groupRate / r.guests, supplier.currency)}</td>
                                    <td className="px-3 py-3">
                                        <div className="flex gap-2">
                                            <button type="button" aria-label="Edit rate" className={`${iconBtn} hover:bg-purple-500 hover:text-white`}
                                                onClick={() => { setEditingId(r._id); setDraft({ ...r, rooms: r.rooms ?? "" }); setNewRate(null); }}>
                                                <Edit size={16} />
                                            </button>
                                            <button type="button" aria-label="Delete rate" className={`${iconBtn} hover:bg-red-500 hover:text-white`} disabled={remove.isPending}
                                                onClick={() => confirm(`Delete ${r.packageName} · ${r.guests} guests · ${r.category}?`) && remove.mutate(r._id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                        {!isLoading && rates.length === 0 && !newRate && (
                            <tr><td colSpan="7" className="py-10 text-center text-gray-500">No rates yet. Add one or upload an Excel file.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RowActions({ onSave, onCancel, busy }) {
    return (
        <div className="flex gap-2">
            <button type="button" aria-label="Save rate" onClick={onSave} disabled={busy} className={`${iconBtn} hover:bg-green-500 hover:text-white`}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button type="button" aria-label="Cancel" onClick={onCancel} className={`${iconBtn} hover:bg-gray-400 hover:text-white`}><X size={16} /></button>
        </div>
    );
}
