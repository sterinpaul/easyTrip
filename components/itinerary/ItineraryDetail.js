"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";

export default function ItineraryDetail({ id }) {
    const { data: itinerary, isLoading, error } = useQuery({
        queryKey: ["itinerary", id],
        queryFn: async () => {
            const res = await fetch(`/api/itinerary/${id}`);
            if (!res.ok) throw new Error("Failed to fetch itinerary");
            return res.json();
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-500" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Error loading itinerary: {error.message}
            </div>
        );
    }

    if (!itinerary) return null;

    // Transform data: flatten activities and group by day
    const daysMap = {};

    if (itinerary.destinations) {
        itinerary.destinations.forEach((dest) => {
            if (dest.activities) {
                dest.activities.forEach((act) => {
                    const dayNum = act.day || 1;
                    if (!daysMap[dayNum]) {
                        daysMap[dayNum] = {
                            day: `Day ${dayNum}`,
                            title: dest.name, // Default to first dest name
                            image: dest.image?.url || "/placeholder.jpg",
                            destinations: new Set([dest.name]),
                            schedule: [],
                        };
                    } else {
                        daysMap[dayNum].destinations.add(dest.name);
                    }

                    // Format time range
                    let timeStr = "";
                    if (act.time) {
                        if (typeof act.time === 'object' && (act.time.from || act.time.to)) {
                            timeStr = `${act.time.from || ''} - ${act.time.to || ''}`;
                        } else if (typeof act.time === 'string') {
                            timeStr = act.time;
                        }
                    }

                    daysMap[dayNum].schedule.push({
                        time: timeStr.trim(),
                        text: act.description,
                    });
                });
            }
        });
    }

    // Sort days and format schedule
    const sortedDays = Object.keys(daysMap)
        .sort((a, b) => Number(a) - Number(b))
        .map((dayNum) => {
            const dayData = daysMap[dayNum];
            // combine destination names if multiple
            if (dayData.destinations.size > 1) {
                dayData.title = Array.from(dayData.destinations).join(" & ");
            }
            // sort schedule by time if possible? simple sort for now
            dayData.schedule.sort((a, b) => a.time.localeCompare(b.time));
            return dayData;
        });

    return (
        <div className="min-h-screen bg-linear-to-r from-[#f6e7d8] via-[#f1eadf] to-[#cfe3ec] px-6 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-wide text-gray-800">
                        {itinerary.title}
                    </h1>
                    <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm uppercase tracking-wider text-gray-600">
                        {itinerary.travelTo && <span>Destination: {itinerary.travelTo}</span>}
                        <span>Duration: {sortedDays.length} Days</span>
                        {itinerary.startDate && (
                            <span>Date: {new Date(itinerary.startDate).toLocaleDateString()}</span>
                        )}
                        {itinerary.travelFrom && <span>Departure: {itinerary.travelFrom}</span>}
                    </div>
                    {itinerary.description && (
                        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{itinerary.description}</p>
                    )}
                </div>

                {/* Days */}
                <div className="space-y-24">
                    {sortedDays.length === 0 ? (
                        <div className="text-center text-gray-500">No activities scheduled yet.</div>
                    ) : (
                        sortedDays.map((item, index) => (
                            <div
                                key={index}
                                className={`flex h-full flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                                    } items-center gap-12`}
                            >
                                {/* Image */}
                                <div
                                    className="h-96 w-full md:w-1/2 overflow-hidden shadow-xl"
                                    style={{
                                        borderRadius: `30% 70% ${Math.random() * 100}% ${Math.random() * 100}% / ${Math.random() * 100}% ${Math.random() * 100}% ${Math.random() * 100}% ${Math.random() * 100}%`,
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="md:w-1/2 w-full">
                                    <h2 className="text-3xl font-bold italic mb-6 text-gray-800">
                                        {item.day}: {item.title}
                                    </h2>

                                    <div className="space-y-6">
                                        {item.schedule.map((event, i) => (
                                            <div key={i} className="flex gap-4 items-start group">
                                                <div className="text-yellow-500 text-xl mt-1">☀</div>
                                                <div>
                                                    <p className="font-semibold text-gray-700 min-w-[100px]">{event.time || "All Day"}</p>
                                                    <p className="text-gray-600">{event.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
