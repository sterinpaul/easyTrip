import HotelForm from "@/components/hotels/HotelForm";

export default function NewHotelPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Hotel</h1>
            <HotelForm />
        </div>
    );
}
