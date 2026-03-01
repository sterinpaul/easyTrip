import HotelForm from "@/components/hotels/HotelForm";
import dbConnect from "@/lib/db";
import Hotel from "@/models/Hotel";
import { notFound } from "next/navigation";

export default async function EditHotelPage({ params }) {
    const { id } = await params;

    await dbConnect();
    const hotel = await Hotel.findOne({ _id: id, isActive: true }).populate({ path: "image", match: { isActive: true } }).lean();

    if (!hotel) {
        notFound();
    }

    const serializedHotel = {
        _id: hotel._id.toString(),
        name: hotel.name || "",
        address: hotel.address || "",
        city: hotel.city || "",
        phone: hotel.phone || "",
        email: hotel.email || "",
        website: hotel.website || "",
        starRating: hotel.starRating || "",
        image: hotel.image ? { url: hotel.image.url || "", _id: hotel.image._id?.toString() || "" } : null,
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Hotel</h1>
            <HotelForm hotel={serializedHotel} />
        </div>
    );
}
