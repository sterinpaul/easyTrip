export const inputCls = "w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400";
export const labelCls = "text-sm font-medium text-gray-600 dark:text-gray-300";
export const cardCls = "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-sm shadow-sm dark:shadow-none";
export const primaryBtn = "px-6 py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all";
export const iconBtn = "p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white transition-colors disabled:opacity-50";

export async function api(url, options) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error([data.error, ...(data.details || [])].filter(Boolean).join(": ") || "Request failed");
    return data;
}

export const formatMoney = (n, currency = "INR") =>
    n === null || n === undefined || Number.isNaN(n)
        ? "-"
        : new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
