"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ClientForm({ initialData }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: "",
      email: "",
      mobile: "",
      phone: "",
      address: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const url = initialData?._id ? `/api/clients/${initialData._id}` : "/api/clients";
      const method = initialData?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save client");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      router.push("/clients");
      router.refresh();
    },
    onError: (error) => {
      console.error("Save error", error);
      alert("Failed to save client");
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-sm dark:shadow-none">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-pink-500 w-fit">
        Client Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
          <input
            {...register("name", { required: "Name is required" })}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
          />
          {errors.name && <span className="text-red-500 dark:text-red-400 text-xs">{errors.name.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
          <input
            {...register("email", { required: "Email is required" })}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
          />
          {errors.email && <span className="text-red-500 dark:text-red-400 text-xs">{errors.email.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Mobile</label>
          <input
            {...register("mobile", { required: "Mobile is required" })}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
          />
          {errors.mobile && <span className="text-red-500 dark:text-red-400 text-xs">{errors.mobile.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Phone (Optional)</label>
          <input
            {...register("phone")}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-500 dark:text-gray-400">Address</label>
        <textarea
          {...register("address")}
          rows={3}
          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-8 py-2 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2 transition-transform active:scale-95"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Save Client</span>
        </button>
      </div>
    </form>
  );
}
