import ItineraryForm from "@/components/itinerary/ItineraryForm";

export default function NewItineraryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Create New Itinerary</h1>
      <ItineraryForm />
    </div>
  );
}
