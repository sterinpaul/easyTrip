import Link from "next/link";
import ItineraryView from "../../../../components/itinerary/ItineraryView";

// Metadata for the page
export const metadata = {
  title: 'Travel Itinerary',
  description: 'Explore Travel Itinerary',
};

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <>
      <Link
        href={`/itinerary/${id}/edit`}
        className="mt-5 inline-block text-purple-500 hover:text-purple-600 font-medium transition-colors"
      >
        Edit &rarr;
      </Link>
      <div className="flex flex-col gap-5">
        <ItineraryView />

      </div>
    </>
  );
}