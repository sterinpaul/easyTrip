import SupplierForm from "@/components/suppliers/SupplierForm";

export default function NewSupplierPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Supplier</h1>
            <SupplierForm />
        </div>
    );
}
