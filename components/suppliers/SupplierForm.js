"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { inputCls, labelCls, cardCls, primaryBtn, api } from "./ui";

const FIELDS = [
    ["name", "Supplier name *", "e.g. Hyker Holidays"],
    ["destination", "Destination", "e.g. Hyderabad"],
    ["contactName", "Contact person", ""],
    ["phone", "Phone", ""],
    ["email", "Email", ""],
    ["currency", "Currency", "INR"],
];

export default function SupplierForm({ supplier }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [form, setForm] = useState(() => ({
        name: "", destination: "", contactName: "", phone: "", email: "", currency: "INR", notes: "",
        ...Object.fromEntries(Object.entries(supplier || {}).filter(([, v]) => v != null)),
    }));

    const mutation = useMutation({
        mutationFn: (data) =>
            api(supplier ? `/api/suppliers/${supplier._id}` : "/api/suppliers", {
                method: supplier ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }),
        onSuccess: (saved) => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            queryClient.invalidateQueries({ queryKey: ["supplier", saved._id] });
            // new supplier -> go straight to its page so rates can be added
            if (!supplier) router.push(`/suppliers/${saved._id}`);
        },
    });

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className={`space-y-6 ${cardCls}`}>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-pink-500 w-fit">Supplier Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {FIELDS.map(([k, label, ph]) => (
                    <label key={k} className="space-y-2 block">
                        <span className={labelCls}>{label}</span>
                        <input
                            className={inputCls}
                            value={form[k]}
                            onChange={set(k)}
                            placeholder={ph}
                            required={k === "name"}
                            type={k === "email" ? "email" : "text"}
                        />
                    </label>
                ))}
            </div>
            <label className="space-y-2 block">
                <span className={labelCls}>Notes</span>
                <textarea className={inputCls} rows={3} value={form.notes} onChange={set("notes")} placeholder="Inclusions, exclusions, validity..." />
            </label>
            {mutation.isError && <p className="text-sm text-red-500">{mutation.error.message}</p>}
            {mutation.isSuccess && supplier && <p className="text-sm text-green-600">Saved.</p>}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <button type="button" onClick={() => router.push("/suppliers")} className="px-5 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium">
                    Back
                </button>
                <button type="submit" disabled={mutation.isPending} className={primaryBtn}>
                    {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {supplier ? "Save Changes" : "Create Supplier"}
                </button>
            </div>
        </form>
    );
}
