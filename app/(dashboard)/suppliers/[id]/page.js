"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import SupplierForm from "@/components/suppliers/SupplierForm";
import RatesManager from "@/components/suppliers/RatesManager";
import { api } from "@/components/suppliers/ui";

export default function SupplierPage({ params }) {
    const { id } = use(params);
    const { data: supplier, isLoading, error } = useQuery({ queryKey: ["supplier", id], queryFn: () => api(`/api/suppliers/${id}`) });

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>;
    if (error) return <p className="text-red-500">{error.message}</p>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{supplier.name}</h1>
            <SupplierForm key={supplier.updatedAt} supplier={supplier} />
            <RatesManager supplier={supplier} />
        </div>
    );
}
