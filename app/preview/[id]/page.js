import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import Client from "@/models/Client";
import { notFound } from "next/navigation";
import PreviewActions from "@/components/preview/PreviewActions";
import { Calendar, MapPin, Clock } from "lucide-react";

export default async function PreviewPage({ params }) {
  const { id } = await params;
  await dbConnect();
  
  const itinerary = await Itinerary.findById(id).populate('client').lean();

  if (!itinerary) {
    notFound();
  }
  
  // Serialize manually
  const data = {
      ...itinerary,
      _id: itinerary._id.toString(),
      client: itinerary.client ? { 
          name: itinerary.client.name, 
          email: itinerary.client.email 
        } : null,
      user: itinerary.user.toString(),
      startDate: itinerary.startDate.toISOString(),
      endDate: itinerary.endDate.toISOString(),
      activities: itinerary.activities.map(a => ({
          ...a,
          _id: a._id ? a._id.toString() : undefined,
          date: a.date ? a.date.toISOString() : undefined
      }))
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-purple-200">
      {/* Print/Email Actions - Client Component */}
      <PreviewActions itinerary={data} />

      {/* Itinerary Content */}
      <div id="itinerary-content" className="max-w-4xl mx-auto p-8 md:p-12 print:p-0 print:max-w-none">
          
          {/* Header / Hero */}
          <div className="mb-12 text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-[800] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 print:text-black print:bg-none">
                  {data.title}
              </h1>
              <div className="flex justify-center gap-6 text-gray-500 font-medium tracking-wide uppercase text-sm">
                  <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-purple-500" />
                      <span>{new Date(data.startDate).toLocaleDateString()} — {new Date(data.endDate).toLocaleDateString()}</span>
                  </div>
                  {data.destinations && data.destinations.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-pink-500" />
                        <span>{data.destinations.join(", ")}</span>
                      </div>
                  )}
              </div>
          </div>

          {/* Client Welcome */}
          {data.client && (
              <div className="mb-16 bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-3xl border border-purple-100 print:border-gray-200 print:bg-white">
                  <h2 className="text-2xl font-bold mb-2">Welcome, {data.client.name}!</h2>
                  <p className="text-gray-600">Get ready for an unforgettable journey. Here is your personalized itinerary.</p>
              </div>
          )}

          {/* Timeline */}
          <div className="relative border-l-2 border-purple-100 ml-4 md:ml-8 space-y-12 pb-12">
              {data.activities.map((activity, index) => (
                  <div key={index} className="relative pl-8 md:pl-12 group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-purple-500 group-hover:scale-125 transition-transform" />
                      
                      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                          {/* Day & Time */}
                          <div className="md:w-32 flex-shrink-0 pt-1">
                              <span className="block text-2xl font-bold text-black/80">Day {activity.day}</span>
                              {activity.time && (
                                  <div className="flex items-center gap-1.5 text-purple-600 font-medium mt-1">
                                      <Clock size={14} />
                                      <span>{activity.time}</span>
                                  </div>
                              )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-4">
                              <div className="space-y-2">
                                  <h3 className="text-2xl font-bold">{activity.title}</h3>
                                  {activity.location && (
                                      <div className="text-gray-500 text-sm flex items-center gap-1">
                                          <MapPin size={14} />
                                          {activity.location}
                                      </div>
                                  )}
                              </div>
                              
                              <p className="text-gray-600 leading-relaxed text-lg">{activity.description}</p>
                              
                              {activity.image && (
                                  <div className="mt-4 rounded-2xl overflow-hidden shadow-xl shadow-purple-900/5 aspect-video md:aspect-[21/9]">
                                      <img src={activity.image} alt={activity.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
          
          <div className="mt-20 pt-10 border-t border-gray-100 text-center text-gray-400 text-sm">
              <p>Created with EasyTrip</p>
          </div>
      </div>
    </div>
  );
}
