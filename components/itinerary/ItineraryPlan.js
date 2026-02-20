
export default function ItineraryPlan() {
    const itinerary = [
        { day: 1, title: "Sunving Day in Seminyak", activities: ["9:00 AM - Breakfast at Hotel", "10:30 AM - Surfing at Seminyak", "1:00 PM - Lunch at Local Resto", "7:00 PM - Night party at Beach Club"] },
        { day: 2, title: "Explore Uluwatu", activities: ["9:00 AM - Private beach at Thomas", "3:00 PM - Uluwatu Temple Sunset", "6:00 PM - Kecak Fire Dance", "8:00 PM - Dinner at Jimbaran"] },
        { day: 3, title: "Nature with Ubud", activities: ["8:00 AM - Tegalalang Rice Terrace", "11:00 AM - Ubud Monkey Forest", "1:30 PM - Lunch with Valley View", "4:00 PM - Ubud Art Market"] },
        { day: 4, title: "Local Food Market", activities: ["9:00 AM - Cooking Class Session", "12:00 PM - Eat what you cooked!", "3:00 PM - Coffee Plantation Tour", "7:00 PM - Fine Dining in Seminyak"] },
        { day: 5, title: "Shopping Day", activities: ["10:00 AM - Souvenir shopping", "1:00 PM - Final Balinese Lunch", "3:00 PM - Spa & Massage", "6:00 PM - Transfer to Airport"] },
    ];

    return (
        <div className="flex justify-center items-center">
            <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-2xl font-sans text-gray-800 border">
                {/* HERO SECTION */}
                <div className="relative h-64 flex">
                    <div className="w-1/2 bg-[#C5D1B7] p-8 flex flex-col justify-center">
                        <div className="w-12 h-12 bg-white rounded-full mb-4 flex items-center justify-center font-bold text-xs">LOGO</div>
                        <h1 className="text-4xl font-black uppercase leading-tight">Travel <br /> Itinerary</h1>
                        <p className="text-xl tracking-widest mt-2 uppercase">Bali 5 Days 4 Nights</p></div>
                    <div className="w-1/2 relative overflow-hidden">
                        <img src="/wagamon.jpg" alt="Bali Temple" className="object-cover h-full w-full" />
                        <div className="absolute bottom-4 left-4 bg-[#4F6D44] text-white px-4 py-1 font-bold">
                            $1,500/person
                        </div>
                    </div>
                </div>

                {/* ITINERARY GRID */}
                <div className="p-8 grid grid-cols-2 gap-8">
                    {itinerary.map((item) => (
                        <div key={item.day} className="border-l-4 border-[#C5D1B7] pl-4">
                            <h3 className="bg-[#C5D1B7] inline-block px-3 py-1 font-bold text-sm mb-2">DAY {item.day}</h3>
                            <h4 className="font-bold text-md mb-3 italic">{item.title}</h4>
                            <ul className="text-xs space-y-2">
                                {item.activities.map((act, idx) => (
                                    <li key={idx} className="flex justify-between border-b border-gray-100 pb-1">
                                        <span>{act}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FOOTER INFO */}
                <div className="p-8 pt-0 grid grid-cols-3 gap-6 text-[10px] border-t border-gray-100 mt-4">
                    <div>
                        <h5 className="font-bold uppercase mb-2">Inclusions:</h5>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Roundtrip ticket</li>
                            <li>4 Nights stay in 4* Hotel</li>
                            <li>Transportation & Guide</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase mb-2">Exclusions:</h5>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Personal Expenses</li>
                            <li>Travel Insurance</li>
                            <li>Tips for Guide</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase mb-2">Notes:</h5>
                        <p className="italic">Please arrive at the lobby 15 minutes before scheduled tours. Bring comfortable walking shoes.</p>
                    </div>
                </div>

                {/* CONTACT STRIP */}
                <div className="bg-[#4F6D44] text-white p-4 flex justify-between text-[10px] px-8">
                    <span>For more information, please visit www.travelwebsite.com</span>
                    <span>Contact: +1 234 567 890</span>
                </div>
            </div>
        </div>
    );
};
