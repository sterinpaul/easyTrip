"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ClientForm from "@/components/clients/ClientForm";
import { use } from "react";

export default function EditClientPage(props) {
    const params = use(props.params);
    const router = useRouter();

    const { data: client, isLoading } = useQuery({
        queryKey: ['client', params.id],
        queryFn: async () => {
            const res = await fetch(`/api/clients/${params.id}`);
            if (!res.ok) {
                if (res.status === 404) {
                    router.push("/clients");
                    throw new Error("Client not found");
                }
                throw new Error("Failed to fetch client");
            }
            return res.json();
        },
        retry: false
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    if (!client) return null; // Fallback handled by query error pushing

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Client</h1>
            <ClientForm initialData={client} />
        </div>
    );
}
