import ClientForm from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Add New Client</h1>
      <ClientForm />
    </div>
  );
}
