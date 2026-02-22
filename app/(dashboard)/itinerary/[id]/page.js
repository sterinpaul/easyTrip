import ItineraryView from "../../../../components/itinerary/ItineraryView";

// Metadata for the page
export const metadata = {
  title: 'Travel Itinerary',
  description: 'Explore Travel Itinerary',
};

export default async function Page({ params }) {
  const { id } = await params;
  const itinerary = {}

  return (
    <div className="flex flex-col gap-5">
      <ItineraryView itinerary={itinerary} />
    </div>
  );
}