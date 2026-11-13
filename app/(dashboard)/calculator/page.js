"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Loader2, AlertTriangle } from "lucide-react";
import { inputCls, labelCls, cardCls, api, formatMoney } from "@/components/suppliers/ui";
import { calculateQuote } from "@/lib/quote";
import Select from "@/components/ui/Select";

const uniq = (arr) => [...new Set(arr)];
// keep the user's choice if still valid, else fall back to the first option
const pick = (value, options) => (options.includes(value) ? value : options[0] ?? "");

export default function CalculatorPage() {
    const [supplierId, setSupplierId] = useState("");
    const [sel, setSel] = useState({ packageName: "", guests: "", category: "" });
    const [flight, setFlight] = useState("");
    const [other, setOther] = useState("");
    const [marginPct, setMarginPct] = useState("12");

    const { data: supData, isLoading: loadingSuppliers } = useQuery({
        queryKey: ["suppliers", "all"],
        queryFn: () => api("/api/suppliers?limit=200"),
    });
    const suppliers = supData?.suppliers || [];
    const activeSupplierId = pick(supplierId, suppliers.map((s) => s._id));
    const supplier = suppliers.find((s) => s._id === activeSupplierId);

    const { data: rateData, isLoading: loadingRates } = useQuery({
        queryKey: ["rates", activeSupplierId],
        queryFn: () => api(`/api/suppliers/${activeSupplierId}/rates`),
        enabled: !!activeSupplierId,
    });
    const rates = rateData?.rates || [];

    // Dropdowns only offer combinations that exist in the supplier's rate table
    const packages = uniq(rates.map((r) => r.packageName));
    const packageName = pick(sel.packageName, packages);
    const guestsOpts = uniq(rates.filter((r) => r.packageName === packageName).map((r) => r.guests)).sort((a, b) => a - b);
    const guests = pick(Number(sel.guests), guestsOpts);
    const categories = uniq(rates.filter((r) => r.packageName === packageName && r.guests === guests).map((r) => r.category));
    const category = pick(sel.category, categories);
    const rate = rates.find((r) => r.packageName === packageName && r.guests === guests && r.category === category);

    const quote = rate ? calculateQuote({ groupRate: rate.groupRate, guests, flight, other, margin: Number(marginPct) / 100 }) : null;
    const currency = supplier?.currency || "INR";
    const money = (n) => formatMoney(n, currency);

    const selectField = (label, value, options, key) => (
        <label className="space-y-2 block">
            <span className={labelCls}>{label}</span>
            <Select aria-label={label} value={value} options={options} onChange={(v) => setSel((s) => ({ ...s, [key]: v }))} />
        </label>
    );
    const numberField = (label, value, setter, hint, props = {}) => (
        <label className="space-y-2 block">
            <span className={labelCls}>{label}</span>
            <input className={inputCls} type="number" min="0" step="any" value={value} onChange={(e) => setter(e.target.value)} placeholder="0" {...props} />
            {hint && <span className="text-xs text-gray-400">{hint}</span>}
        </label>
    );

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                        <Calculator className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quote Calculator</h1>
                </div>
                <p className="text-gray-400">Supplier net rates for the full group → per-person selling price at your target margin.</p>
            </div>

            {loadingSuppliers ? (
                <Loader2 className="animate-spin text-purple-500 mx-auto" />
            ) : !suppliers.length ? (
                <p className="text-gray-500">No suppliers yet. <Link href="/suppliers/new" className="text-purple-500 underline">Add a supplier</Link> and its rates first.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`space-y-5 ${cardCls}`}>
                        <label className="space-y-2 block">
                            <span className={labelCls}>Supplier</span>
                            <Select
                                aria-label="Supplier"
                                value={activeSupplierId}
                                onChange={setSupplierId}
                                options={suppliers.map((s) => ({ value: s._id, label: s.destination ? `${s.name} — ${s.destination}` : s.name }))}
                            />
                        </label>
                        {loadingRates ? (
                            <Loader2 className="animate-spin text-purple-500" />
                        ) : !rates.length ? (
                            <p className="text-sm text-amber-600">This supplier has no rates. <Link href={`/suppliers/${activeSupplierId}`} className="underline">Add rates</Link>.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {selectField("Package", packageName, packages, "packageName")}
                                {selectField("Guests", guests, guestsOpts, "guests")}
                                {selectField("Hotel category", category, categories, "category")}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {numberField("Return flight / person", flight, setFlight, "Enter when known")}
                            {numberField("Other costs / person", other, setOther, "Optional")}
                            {numberField("Target margin %", marginPct, setMarginPct, "Share of selling price kept", { max: "99.99" })}
                        </div>
                        {rate?.rooms != null && <p className="text-sm text-gray-500">Rooms included: {rate.rooms}</p>}
                    </div>

                    <div className={`space-y-4 ${cardCls}`}>
                        {quote ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <Stat label="Selling price / person" value={money(quote.sellPP)} highlight />
                                    <Stat label="Selling price, group" value={money(quote.sellGroup)} highlight />
                                </div>
                                <dl className="divide-y divide-gray-100 dark:divide-white/10 text-sm">
                                    <Row label="Supplier land cost, group" value={money(quote.landGroup)} />
                                    <Row label="Supplier land cost / person" value={money(quote.landPP)} />
                                    <Row label="Total cost / person" value={money(quote.costPP)} />
                                    <Row label="Gross profit / person" value={money(quote.profitPP)} />
                                    <Row label="Gross profit, group" value={money(quote.profitGroup)} />
                                </dl>
                            </>
                        ) : (
                            <p className="text-gray-500">{rate ? "Margin must be between 0 and 99.99%." : "Pick a supplier rate to see the quote."}</p>
                        )}
                        <p className="flex gap-2 text-xs text-amber-600 dark:text-amber-400 pt-2">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            Flight tickets are excluded from supplier rates. Review availability, taxes and final terms before sending a quote.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, highlight }) {
    return (
        <div className={`p-4 rounded-xl ${highlight ? "bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20" : ""}`}>
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between py-2.5">
            <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{value}</dd>
        </div>
    );
}
