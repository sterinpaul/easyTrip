import Link from "next/link";
import ItineraryView from "../../../../components/itinerary/ItineraryView";
import ItineraryPlan from "../../../../components/itinerary/ItineraryPlan";
// import ItineraryDetail from "../../../../components/itinerary/ItineraryDetail";

// Metadata for the page
export const metadata = {
  title: 'Travel Itinerary | 3-Day Adventure',
  description: 'Explore Borobudur Temple, Beaches, and Mountains in this 3-day journey.',
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
        {/* <ItineraryPlan /> */}
        {/* <ItineraryDetail id={id} /> */}

      </div>
    </>
  );
}