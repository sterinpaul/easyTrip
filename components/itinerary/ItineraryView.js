"use client";

import React from 'react';

// Extracting helper components to reduce code repetition
const GuestCell = ({ label, value, highlight, colSpan }) => (
  <div className={`p-2.5 px-4 border-r border-b border-[#2a2a2a] last:border-r-0 ${colSpan ? colSpan : ''}`}>
    <div className="font-['Montserrat'] text-[10px] font-bold text-[#888] tracking-[1px] uppercase">{label}</div>
    <div className={`font-['Montserrat'] text-sm font-bold mt-0.5 ${highlight ? 'text-[#c8a84b]' : 'text-white'}`}>{value}</div>
  </div>
);

const CheckOption = ({ label, checked }) => (
  <div className="flex items-center gap-2 font-['Montserrat'] text-[13px] font-semibold text-[#ccc]">
    <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-[3px] ${checked ? 'bg-[#c8a84b] border-[#c8a84b] text-black text-[13px] font-black' : 'border-[#555] bg-transparent'}`}>
      {checked ? '✓' : ''}
    </div>
    {label}
  </div>
);

const DayCard = ({ day, title, items }) => (
  <div className="mb-4 border border-[#2a2a2a] rounded-lg overflow-hidden">
    <div className="flex justify-between items-center bg-[#1a1a1a] py-3 px-[18px] border-b border-[#2a2a2a]">
      <div className="font-['Montserrat'] text-[15px] font-extrabold text-white underline uppercase tracking-[1px]">{title}</div>
      <div className="bg-[#8b0000] text-white font-['Montserrat'] text-[13px] font-extrabold py-1 px-3.5 rounded tracking-[1px]">DAY {day}</div>
    </div>
    <div className="p-4 px-[18px] bg-[#161616]">
      {items.map((item, i) => (
        <div className="flex items-start gap-2.5 mb-2 font-['Montserrat'] text-[13px] text-[#ccc] leading-[1.4]" key={i}>
          <div className="w-3 h-3 min-w-[12px] bg-[#8b0000] rounded-full mt-1"></div>
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const InfoCard = ({ title, items, isInclude }) => (
  <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
    <div className="bg-[#8b0000] py-2.5 px-4 font-['Montserrat'] text-sm font-black tracking-[2px] text-white">{title}</div>
    <div className="py-[14px] px-4 bg-[#161616]">
      {items.map((item, i) => (
        <div className="flex gap-2 items-start mb-2 font-['Montserrat'] text-xs text-[#ccc]" key={i}>
          <div className={`w-2.5 h-2.5 min-w-[10px] rounded-full mt-[3px] ${isInclude ? 'bg-[#c8a84b]' : 'bg-[#8b0000]'}`}></div>
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function ItineraryView() {
  return (
    <div className="font-['Segoe_UI',sans-serif] bg-[#0a0a0a] text-white min-h-screen max-w-[900px] mx-auto p-0">
      {/* Import fonts */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;600&display=swap');
      `}} />

      {/* PAGE 1 */}
      <div className="bg-[#111] border border-[#222] mb-1">
        {/* Hero */}
        <div className="relative pt-6 px-7 pb-7 min-h-[300px] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url('https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=900&q=80')" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="bg-[#c8a84b] rounded-full w-14 h-14 flex items-center justify-center flex-col leading-none">
              <div className="font-['Montserrat'] italic font-extrabold text-base text-black">Travel</div>
              <div className="font-['Montserrat'] font-black text-sm text-black">hub <span className="bg-black text-[#c8a84b] px-[3px] rounded-[2px]">24</span></div>
            </div>
            <div>
              <div className="font-['Montserrat'] text-[10px] font-normal text-[#ccc] italic">Keep your dreams alive</div>
            </div>
          </div>

          <div className="absolute top-6 right-7 text-right">
            <span className="font-['Montserrat'] text-[13px] tracking-[4px] text-[#ccc] block">P R O P O S A L</span>
            <div className="bg-[#c8a84b] text-black font-['Montserrat'] font-extrabold text-xs py-1 px-2.5 rounded inline-block mt-1">3N 4D</div>
          </div>

          <div className="font-['Bebas_Neue'] text-[96px] leading-[0.9] text-white/92 drop-shadow-[2px_4px_20px_rgba(0,0,0,0.8)] tracking-[4px] mb-2">MALAYSIA</div>
          <div className="font-['Montserrat'] text-[11px] text-[#aaa] tracking-[1px] mb-5">PACKAGE ID : PU-KRA-APRIL01</div>
        </div>

        {/* Guest Details */}
        <div className="grid grid-cols-2 bg-[#1a1a1a] border border-[#2a2a2a]">
          <GuestCell label="Guest Name" value="SANOJ" highlight colSpan="col-span-2 md:col-span-1" />
          <GuestCell label="Date" value="17/02/2026" />
          <GuestCell label="No of Guests" value="2 ADULT" />
          <GuestCell label="Tour Duration" value="04 DAYS" />
          <GuestCell label="Arriving At" value="COK" />
          <GuestCell label="Departing From" value="COK" />
          <GuestCell label="Tour Start Date" value="11/04/2026" />
          <GuestCell label="Tour End Date" value="19/03/2026" />
        </div>

        {/* Category Row */}
        <div className="grid grid-cols-[160px_1fr] bg-[#1a1a1a] border-x border-[#2a2a2a]">
          <div className="bg-[#8b0000] flex items-center justify-center p-4 font-['Montserrat'] text-[22px] font-black text-white tracking-[2px]">CATEGORY</div>
          <div className="flex items-center gap-5 py-3 px-5 flex-wrap">
            <CheckOption label="HONEYMOON" checked />
            <CheckOption label="FAMILY" />
            <CheckOption label="GROUP" />
          </div>
        </div>

        {/* Type Row */}
        <div className="grid grid-cols-[160px_1fr] bg-[#1a1a1a] border border-[#2a2a2a] border-t-0">
          <div className="bg-[#8b0000] flex items-center justify-center p-4 font-['Montserrat'] text-[22px] font-black text-white tracking-[2px]">TYPE</div>
          <div className="flex items-center gap-5 py-3 px-5 flex-wrap">
            <CheckOption label="ECONOMY" />
            <CheckOption label="STANDARD" checked />
            <CheckOption label="PREMIUM" />
          </div>
        </div>

        {/* Transportation */}
        <div className="px-5">
          <div className="font-['Montserrat'] text-base font-black text-[#c8a84b] tracking-[2px] pt-[14px] px-5 pb-2 uppercase border-b-2 border-[#c8a84b] mx-0">TRANSPORTATION</div>
        </div>
        <div className="flex gap-3 py-4 px-5">
          <div className="flex-1 border-2 border-[#c8a84b] rounded-lg flex items-center justify-center p-3.5 text-[28px] bg-[#1f1a0a] transition-colors">✈️</div>
          <div className="flex-1 border-2 border-[#c8a84b] rounded-lg flex items-center justify-center p-3.5 text-[28px] bg-[#1f1a0a] transition-colors">🚗</div>
          <div className="flex-1 border-2 border-[#2a2a2a] rounded-lg flex items-center justify-center p-3.5 text-[28px] bg-[#1a1a1a] transition-colors">🚌</div>
        </div>

        {/* Flight Details */}
        <div className="px-5">
          <div className="font-['Montserrat'] text-base font-black text-[#c8a84b] tracking-[2px] pt-[14px] px-5 pb-2 uppercase border-b-2 border-[#c8a84b] mx-0">FLIGHT DETAILS</div>
        </div>
        <div className="m-[12px_20px_20px]">
          <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_1px_1fr] items-center p-4 gap-4 bg-[#161616]">
              <div className="text-[36px]">🛫</div>
              <div className="font-['Montserrat']">
                <div className="text-lg font-extrabold text-white">COK → KUL</div>
                <div className="text-xs text-[#aaa] mt-0.5">MON, 16 APR 2026</div>
                <div className="text-xl font-bold text-[#c8a84b] mt-1">00:30 → 07:20</div>
                <div className="text-[10px] text-[#888] mt-1">BAGGAGE: 7 KGS | 0 KGS</div>
              </div>
              <div className="w-[1px] bg-[#333] h-full min-h-[60px]"></div>
              <div className="font-['Montserrat']">
                <div className="text-lg font-extrabold text-white">KUL → COK</div>
                <div className="text-xs text-[#aaa] mt-0.5">THU, 19 APRIL 2026</div>
                <div className="text-xl font-bold text-[#c8a84b] mt-1">20:25 → 22:00 +1 DAY</div>
                <div className="text-[10px] text-[#888] mt-1">BAGGAGE: 7 KGS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="px-5">
          <div className="font-['Montserrat'] text-base font-black text-[#c8a84b] tracking-[2px] pt-[14px] px-5 pb-2 uppercase border-b-2 border-[#c8a84b] mx-0">HOTEL DETAILS</div>
        </div>
        <div className="m-[12px_20px_0]">
          <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
            <div className="bg-[#8b0000] py-2.5 px-5 flex justify-between items-center">
              <span className="font-['Montserrat'] text-sm font-black tracking-[2px] text-white">HOTEL DETAILS</span>
              <span className="bg-[#c8a84b] text-black font-['Montserrat'] text-[11px] font-extrabold py-1 px-3 rounded tracking-[1px]">STANDARD</span>
            </div>
            <div className="bg-[#161616] p-5 text-center">
              <div className="font-['Montserrat'] text-base font-bold text-white tracking-[1px]">PACIFIC EXPRESS HOTEL CENTRAL MARKET</div>
              <div className="font-['Montserrat'] text-[13px] text-[#888] mt-1">- 3 NIGHTS</div>
              <div className="font-['Montserrat'] text-sm text-[#c8a84b] font-bold my-2">OR</div>
              <div className="font-['Montserrat'] text-base font-bold text-white tracking-[1px]">ASTO HOTELS KUALA LUMPUR</div>
              <div className="font-['Montserrat'] text-[13px] text-[#888] mt-1">- 3 NIGHTS</div>
            </div>
            <div className="bg-[#1a1a1a] py-[14px] px-5 flex justify-between items-center border-t border-[#2a2a2a]">
              <div className="font-['Montserrat'] text-[13px] text-[#aaa] flex items-center gap-[6px]">
                <span>⭕</span>
                <span>180 REWARD POINTS</span>
              </div>
              <div className="text-right">
                <div className="font-['Bebas_Neue'] text-[42px] text-[#c8a84b] leading-none">INR 18,000</div>
                <div className="font-['Montserrat'] text-[11px] text-[#888]">PER PERSON</div>
              </div>
            </div>
            <div className="font-['Montserrat'] text-[9px] text-[#555] text-center p-2 italic">
              SIMILAR PROPERTIES WILL BE PROVIDED IN CASE THE QUOTED PROPERTY IS UNAVAILABLE
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 - ITINERARY */}
      <div className="bg-[#111] border border-[#222] mb-1 p-6">
        <div className="font-['Bebas_Neue'] text-[36px] tracking-[4px] text-white mb-5 border-l-[5px] border-[#c8a84b] pl-3">ITINERARY</div>

        <DayCard day="1" title="Arrival & Putrajaya + Evening City Tour" items={[
          "ARRIVAL AT KUALA LUMPUR INTERNATIONAL AIRPORT",
          "MEET & GREET BY REPRESENTATIVE.",
          "ENROUTE VISIT TO PUTRAJAYA (SHORT SIGHTSEEING TOUR).",
          "VISIT THEAN HOU TEMPLE",
          "PHOTO STOP AT PETRONAS TWIN TOWERS",
          "ENJOY MUSICAL FOUNTAIN SHOW",
          "OVERNIGHT STAY IN HOTEL",
        ]} />

        <DayCard day="2" title="Genting Highlands & Batu Caves" items={[
          "BREAKFAST AT HOTEL.",
          "FULL DAY TRIP TO GENTING HIGHLANDS",
          "ENJOY SCENIC TWO-WAY CABLE CAR RIDE",
          "VISIT BATU CAVES ENROUTE",
          "RETURN TO HOTEL. OVERNIGHT STAY.",
        ]} />

        <DayCard day="3" title="Kuala Lumpur City Tour" items={[
          "BREAKFAST AT HOTEL.",
          "PHOTO STOP AT KL TOWER",
          "VISIT NATIONAL MOSQUE OF MALAYSIA",
          "EXPLORE MERDEKA SQUARE",
          "VIEW SULTAN ABDUL SAMAD BUILDING",
          "OVERNIGHT STAY IN HOTEL",
        ]} />

        <DayCard day="4" title="Departure" items={[
          "BREAKFAST AT HOTEL & CHECK-OUT",
          "CHECK-OUT AND TRANSFER TO AIRPORT",
          "DEPARTURE WITH HAPPY MEMORIES.",
        ]} />
      </div>

      {/* PAGE 3 - INCLUDES / EXCLUDES / HIGHLIGHTS */}
      <div className="bg-[#111] border border-[#222] mb-1 p-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <InfoCard title="INCLUDES THE FOLLOWING" isInclude items={[
            "VISA.",
            "3 NIGHTS ACCOMMODATION IN HOTEL (WITH BREAKFAST).",
            "ALL MENTIONED SIGHTSEEING & TRANSFERS (PVT/SIC AS SPECIFIED).",
            "ALL ENTRY TICKET",
            "AIRPORT TRANSFERS: AIRPORT TO HOTELS.",
          ]} />
          <InfoCard title="EXCLUDES THE FOLLOWING" items={[
            "FLIGHT FARE",
            "TRAVEL INSURANCE.",
            "EARLY CHECK IN AND LATE CHECK OUT.",
            "TIPS AND GRATITUDE FOR STAFF/DRIVERS.",
          ]} />
        </div>

        {/* Trip Highlights */}
        <div className="flex mb-5 p-4 bg-[#161616] border border-[#2a2a2a] rounded-lg">
          <div className="font-['Bebas_Neue'] text-[22px] tracking-[3px] [writing-mode:vertical-rl] rotate-180 text-[#c8a84b] border-r-2 border-[#c8a84b] pr-2 mr-3">TRIP HIGHLIGHTS</div>
          <div className="flex gap-2 flex-1 items-center flex-wrap">
            {[
              "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=300&q=80",
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
              "https://images.unsplash.com/photo-1568454537842-d933259bb258?w=300&q=80",
              "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=300&q=80",
            ].map((src, i) => (
              <div className="flex-1 min-w-[100px] h-[100px] rounded-lg overflow-hidden border-2 border-[#2a2a2a]" key={i}>
                <img src={src} alt={`highlight ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Offers */}
        <div className="font-['Bebas_Neue'] text-[36px] tracking-[4px] text-white mb-5 border-l-[5px] border-[#c8a84b] pl-3">OFFERS AND DISCOUNTS</div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#c8a84b] rounded-lg p-5 flex gap-5 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[28px]">🌍</span>
              <div>
                <div className="font-['Montserrat'] text-[11px] text-[#c8a84b] tracking-[2px] uppercase mb-1">GET A CHANCE TO WIN AN</div>
                <div className="font-['Bebas_Neue'] text-[42px] text-white leading-none">INTERNATIONAL<br />TRIP!</div>
              </div>
            </div>
          </div>
          <div className="w-[1px] bg-[#333] min-h-[80px]"></div>
          <div className="flex-1 text-right">
            <div className="font-['Montserrat'] text-[13px] font-bold text-[#c8a84b] tracking-[1px] uppercase">🎯 LUCKY DRAW CONTEST ALERT!</div>
            <div className="font-['Montserrat'] text-[11px] text-[#aaa] mt-2 leading-[1.6]">
              <strong className="text-white">HOW TO PARTICIPATE? IT'S SIMPLE!</strong><br />
              BOOK ANY ONE TRAVEL PACKAGE FROM OUR COMPANY BEFORE 31 DECEMBER 2025..<br />
              THAT'S IT - YOU'RE AUTOMATICALLY ENTERED INTO THE LUCKY DRAW!
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 4 - T&C */}
      <div className="bg-[#111] border border-[#222] mb-1 p-6">
        <div className="font-['Bebas_Neue'] text-[36px] tracking-[4px] text-white mb-5 border-l-[5px] border-[#c8a84b] pl-3">TERMS AND CONDITIONS</div>

        {/* Payment Policy */}
        <div className="mb-5">
          <div className="font-['Montserrat'] text-sm font-extrabold text-[#c8a84b] tracking-[2px] uppercase mb-3">PAYMENT POLICY</div>
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="bg-[#8b0000] text-white font-['Montserrat'] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-[#333]">PAYMENT SCHEDULE</th>
                <th className="bg-[#8b0000] text-white font-['Montserrat'] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-[#333]">AMOUNT</th>
                <th className="bg-[#8b0000] text-white font-['Montserrat'] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-[#333]">REMARK</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="bg-[#161616] text-[#ccc] font-['Montserrat'] text-xs py-2.5 px-3.5 border border-[#2a2a2a]">ADVANCE PAYMENT</td>
                <td className="bg-[#161616] text-[#ccc] font-['Montserrat'] text-xs py-2.5 px-3.5 border border-[#2a2a2a]">20% OF TOUR COST + FLIGHT FARE</td>
                <td className="bg-[#161616] text-[#ccc] font-['Montserrat'] text-xs py-2.5 px-3.5 border border-[#2a2a2a]">AT THE TIME OF BOOKING</td>
              </tr>
              <tr className="[&_td]:bg-[#1a1a1a]">
                <td className="text-[#ccc] font-['Montserrat'] text-xs py-2.5 px-3.5 border border-[#2a2a2a]">FINAL PAYMENT</td>
                <td className="text-[#ccc] font-['Montserrat'] text-xs py-2.5 px-3.5 border border-[#2a2a2a]">FULL PAYMENT</td>
                <td className="text-[#ccc] font-['Montserrat'] text-xs py-2.5 px-3.5 border border-[#2a2a2a]">30 DAYS BEFORE THE TOUR</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cancellation Policy */}
        <div className="mb-5">
          <div className="font-['Montserrat'] text-sm font-extrabold text-[#c8a84b] tracking-[2px] uppercase mb-2">CANCELLATION POLICY</div>
          <div className="font-['Montserrat'] text-[11px] text-[#888] mb-3 leading-[1.6]">
            IN ANY CASE OF CANCELLATION OF BOOKING, IT MUST BE INFORMED IN ADVANCE TO TRAVEL HUB 24 BY WRITING.
            CANCELLATION WILL BE EFFECTIVE ONLY ON THE DATE AND TIME OF RECEIPT OF CANCELLATION LETTER.
            THE FOLLOWING CANCELLATION CHARGES SHALL APPLY AS PER THE PERIOD OF CANCELLATION TERMS.
          </div>
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="bg-[#8b0000] text-white font-['Montserrat'] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-[#333]">TIME PERIOD BEFORE DEPARTURE</th>
                <th className="bg-[#8b0000] text-white font-['Montserrat'] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-[#333]">CANCELLATION CHARGE</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["AIRLINE TICKETS", "NON-REFUNDABLE"],
                ["TRAIN TICKETS", "IRCTC CANCELLATION POLICY"],
                ["BEFORE 30 DAYS", "0% CANCELLATION CHARGES"],
                ["BETWEEN 30 DAYS TO 16 DAYS", "20% OF TOUR COST"],
                ["BETWEEN 15 DAYS TO 08 DAYS", "50% OF TOUR COST"],
                ["PRIOR TO 7 DAYS", "100% OF TOUR COST"],
              ].map(([period, charge], i) => (
                <tr key={i} className={i % 2 !== 0 ? "[&_td]:bg-[#1a1a1a]" : ""}>
                  <td className={`${i % 2 === 0 ? 'bg-[#161616]' : ''} text-[#ccc] font-['Montserrat'] text-xs py-2.5 px-3.5 border border-[#2a2a2a]`}>{period}</td>
                  <td className={`${i % 2 === 0 ? 'bg-[#161616]' : ''} text-[#ccc] font-['Montserrat'] text-xs py-2.5 px-3.5 border border-[#2a2a2a]`}>{charge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="font-['Montserrat'] text-[10px] text-[#888] mb-3 leading-[1.6]">
          PLEASE READ AND AGREE TO OUR CANCELLATION POLICY BEFORE CONFIRMING YOUR BOOKING. CANCELLATIONS MADE WITHIN THE
          SPECIFIED PERIOD MAY BE ELIGIBLE FOR A REFUND BASED ON APPLICABLE CHARGES. NO REFUNDS WILL BE GIVEN FOR NO-SHOWS
          OR CANCELLATIONS WITHIN 10 DAYS OF DEPARTURE. REFUNDS, IF APPLICABLE WILL BE PROCESSED PROMPTLY AS DETERMINED BY THE COMPANY.
        </div>

        <div className="bg-[#1a0a0a] border border-[#8b0000] rounded p-2.5 px-3.5 font-['Montserrat'] text-[10px] text-[#aaa] text-center my-4 italic">
          ⚠️ THIS IS NOT THE FINAL DAY WISE ITINERARY – MAY SHUFFLE, BUT WILL COVER ALL SPECIFIED SIGHT SEEING
        </div>

        {/* Payment Details */}
        <div className="font-['Bebas_Neue'] text-[36px] tracking-[4px] text-white mb-5 border-l-[5px] border-[#c8a84b] pl-3 mt-5">PAYMENT DETAILS</div>

        <div className="grid grid-cols-2 gap-5 mt-5">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-5">
            <div className="font-['Montserrat'] text-base font-black text-[#c8a84b] tracking-[1px] mb-[14px] uppercase">Bank Account Details</div>
            <div className="font-['Montserrat'] text-[13px] text-[#ccc] mb-1.5">🏦 <span className="text-white font-bold">HDFC BANK</span></div>
            <div className="font-['Montserrat'] text-[13px] text-[#ccc] mb-1.5">Account No: <span className="text-white font-bold">50200099241251</span></div>
            <div className="font-['Montserrat'] text-[13px] text-[#ccc] mb-1.5">IFSC Code: <span className="text-white font-bold">HDFC0000520</span></div>
            <div className="mt-3.5 py-2.5 px-3 bg-[#1a1a1a] rounded-md font-['Montserrat'] text-[11px] text-[#888] flex gap-1.5 items-center">
              📱 Also accepts: BHIM UPI | G Pay | Paytm | PhonePe
            </div>
          </div>

          <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-5">
            <div className="flex gap-2 mb-3 items-start">
              <span className="text-[20px]">📍</span>
              <div>
                <div className="font-['Montserrat'] text-[13px] font-bold text-white leading-[1.6]">
                  BRINDAVAN BUSINESS CENTRE,<br />
                  MANIMALA ROAD,<br />
                  PONEKKARA, EDAPPALLY,<br />
                  ERNAKULAM, KERALA.
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[16px]">🌐</span>
              <a href="https://www.travelhub24.in" className="font-['Montserrat'] text-[13px] text-[#c8a84b] no-underline font-semibold">www.travelhub24.in</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Phone Numbers */}
      <div className="bg-[#8b0000] py-[14px] px-5 flex justify-center gap-5 flex-wrap">
        {["+91 6238882424", "+91 7902220707", "+91 7902220020", "+91 9778007070"].map((phone, i) => (
          <div className="font-['Montserrat'] text-sm font-extrabold text-white tracking-[1px]" key={i}>📞 {phone}</div>
        ))}
      </div>
    </div>
  );
}