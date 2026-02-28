"use client";

import { Bebas_Neue, Montserrat } from 'next/font/google';
import { Plane, Car, PlaneTakeoff, PlaneLanding, Globe, Target, Landmark, Smartphone, MapPin, Phone, Edit2, Trash2, Printer, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });


// Extracting helper components to reduce code repetition
const GuestCell = ({ label, value, highlight, colSpan }) => (
  <div className={`p-2.5 px-4 border-r border-b border-gray-200 dark:border-[#2a2a2a] last:border-r-0 ${colSpan ? colSpan : ''}`}>
    <div className="[font-family:var(--font-montserrat)] text-[10px] font-bold text-gray-500 dark:text-[#888] tracking-[1px] uppercase">{label}</div>
    <div className={`[font-family:var(--font-montserrat)] text-sm font-bold mt-0.5 ${highlight ? 'text-[#c8a84b]' : 'text-gray-900 dark:text-white'}`}>{value}</div>
  </div>
);

const CheckOption = ({ label, checked }) => (
  <div className="flex items-center gap-2 [font-family:var(--font-montserrat)] text-[13px] font-semibold text-gray-700 dark:text-[#ccc]">
    <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-[3px] ${checked ? 'bg-[#c8a84b] border-[#c8a84b] text-black text-[13px] font-black' : 'border-[#555] bg-transparent'}`}>
      {checked ? '✓' : ''}
    </div>
    {label}
  </div>
);

const DayCard = ({ day, title, items }) => (
  <div className="mb-4 border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden print:break-inside-avoid print:mt-4 shadow-sm print:shadow-none">
    <div className="flex justify-between items-center bg-[#fafafa] dark:bg-[#1a1a1a] py-3 px-[18px] border-b border-gray-200 dark:border-[#2a2a2a]">
      <div className="[font-family:var(--font-montserrat)] text-[15px] font-extrabold text-gray-900 dark:text-white underline uppercase tracking-[1px]">{title}</div>
      <div className="bg-[#c8a84b] text-gray-900 whitespace-nowrap [font-family:var(--font-montserrat)] text-[13px] font-extrabold py-1 px-3.5 rounded tracking-[1px]">DAY {day}</div>
    </div>
    <div className="p-4 px-[18px] bg-white dark:bg-[#161616]">
      {items.map((item, i) => (
        <div className="flex items-start gap-2.5 mb-2 [font-family:var(--font-montserrat)] text-[13px] text-gray-700 dark:text-[#ccc] leading-[1.4]" key={i}>
          <div className="w-3 h-3 min-w-[12px] bg-[#c8a84b] rounded-full mt-1"></div>
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const InfoCard = ({ title, items }) => (
  <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden print:break-inside-avoid">
    <div className={`bg-[#c8a84b] py-2.5 px-4 [font-family:var(--font-montserrat)] text-sm font-black tracking-[2px] text-gray-900 dark:text-white`}>{title}</div>
    <div className="py-[14px] px-4 bg-white dark:bg-[#161616]">
      {items.map((item, i) => (
        <div className="flex gap-2 items-start mb-2 [font-family:var(--font-montserrat)] text-xs text-gray-700 dark:text-[#ccc]" key={i}>
          <div className={`w-2.5 h-2.5 min-w-[10px] rounded-full mt-[3px] bg-[#c8a84b]`}></div>
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function ItineraryView({ itinerary }) {
  const contentRef = useRef(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const heroImageUrl = 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07'

  const onEdit = () => {
    router.push(`/itinerary/${itinerary.id}/edit`);
  }

  const onDelete = () => {
    setIsDeleting(true);
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current || isDownloading) return;

    setIsDownloading(true);
    const isDarkMode = document.documentElement.classList.contains('dark');
    const bgColor = isDarkMode ? '#0a0a0a' : '#ffffff';

    // Inline computed visual styles so the captured image retains correct
    // theme colors. html-to-image clones nodes into an isolated SVG context
    // which loses CSS cascade (dark mode ancestor).
    // NOTE: 'background' shorthand is excluded — it resets background-color.
    const inlineComputedStyles = (root) => {
      const elements = [root, ...root.querySelectorAll('*')];
      const props = [
        'background-color', 'background-image', 'color',
        'border-color', 'border-top-color', 'border-bottom-color',
        'border-left-color', 'border-right-color'
      ];
      for (const el of elements) {
        const computed = window.getComputedStyle(el);
        for (const prop of props) {
          el.style.setProperty(prop, computed.getPropertyValue(prop), 'important');
        }
      }
    };

    // Helper: fill a PDF page with the correct theme background
    const fillPageBg = (pdf, w, h) => {
      if (isDarkMode) {
        pdf.setFillColor(10, 10, 10); // #0a0a0a
        pdf.rect(0, 0, w, h, 'F');
      }
    };

    // Create an off-screen wrapper so the visible UI is never touched.
    const A4_WIDTH = 900;
    const offscreen = document.createElement('div');
    offscreen.style.cssText =
      `position:fixed;left:-${A4_WIDTH + 200}px;top:0;z-index:-9999;width:${A4_WIDTH}px;pointer-events:none;`;

    try {
      // Deep-clone the content into the off-screen wrapper
      const clone = contentRef.current.cloneNode(true);
      clone.style.width = `${A4_WIDTH}px`;
      clone.style.minWidth = `${A4_WIDTH}px`;
      clone.style.maxWidth = `${A4_WIDTH}px`;
      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);

      // Allow the browser to reflow the clone at the forced width
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Extract flat chunks from the clone
      const chunks = Array.from(clone.children);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      // Fill first page background
      fillPageBg(pdf, pdfWidth, pdfPageHeight);

      const pageMarginTop = 0;
      const pageMarginBottom = 10;
      const maxUsableHeight = pdfPageHeight - pageMarginTop - pageMarginBottom;
      let cursorY = pageMarginTop;

      const flatChunks = [];
      const extractChunks = (el) => {
        if (el.classList.contains('pdf-page') || el.classList.contains('print:bg-white')) {
          Array.from(el.children).forEach(extractChunks);
        } else {
          if (el.id === 'deleteModal' || el.classList.contains('print:hidden') || el.tagName === 'STYLE') return;
          flatChunks.push(el);
        }
      };
      chunks.forEach(extractChunks);

      for (let i = 0; i < flatChunks.length; i++) {
        const chunk = flatChunks[i];

        if (window.getComputedStyle(chunk).display === 'none') continue;
        if (chunk.offsetHeight < 5) continue;

        // If the element has negative horizontal margins (e.g. the footer's -mx-6),
        // convert them into extra width so the full-width background is captured.
        const chunkStyle = window.getComputedStyle(chunk);
        const ml = parseFloat(chunkStyle.marginLeft) || 0;
        const mr = parseFloat(chunkStyle.marginRight) || 0;
        if (ml < 0 || mr < 0) {
          chunk.style.marginLeft = '0';
          chunk.style.marginRight = '0';
          chunk.style.paddingLeft = `${parseFloat(chunkStyle.paddingLeft || 0) + Math.abs(ml)}px`;
          chunk.style.paddingRight = `${parseFloat(chunkStyle.paddingRight || 0) + Math.abs(mr)}px`;
        }

        // Inline computed styles on the clone (no restore needed — clone is discarded)
        inlineComputedStyles(chunk);

        // If the chunk root has a transparent/missing background, fill it with
        // the theme color so the PDF page background doesn't bleed through.
        // This replaces toPng's backgroundColor option which applies to the ROOT
        // element and would OVERWRITE real backgrounds like the footer's gold.
        const rootBg = chunk.style.getPropertyValue('background-color');
        const isTransparent = !rootBg || rootBg === 'transparent'
          || rootBg === 'rgba(0, 0, 0, 0)' || rootBg.startsWith('rgba(0, 0, 0, 0)');
        if (isTransparent) {
          chunk.style.setProperty('background-color', bgColor, 'important');
        }

        const dataUrl = await toPng(chunk, {
          quality: 0.85,
          pixelRatio: 1.5,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            marginTop: '0',
            marginBottom: '0'
          }
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        // Calculate positioning relative to the clone container
        const containerRect = clone.getBoundingClientRect();
        const chunkRect = chunk.getBoundingClientRect();

        const widthRatio = chunkRect.width / containerRect.width;
        const xOffsetRatio = (chunkRect.left - containerRect.left) / containerRect.width;

        const drawWidth = pdfWidth * widthRatio;
        const drawX = pdfWidth * xOffsetRatio;

        const imgProps = pdf.getImageProperties(dataUrl);
        const chunkPdfHeight = (imgProps.height * drawWidth) / imgProps.width;

        if (cursorY + chunkPdfHeight <= pdfPageHeight - pageMarginBottom) {
          pdf.addImage(dataUrl, 'PNG', drawX, cursorY, drawWidth, chunkPdfHeight, undefined, 'FAST');
          cursorY += chunkPdfHeight;
        } else {
          if (chunkPdfHeight > maxUsableHeight) {
            pdf.addPage();
            fillPageBg(pdf, pdfWidth, pdfPageHeight);
            cursorY = pageMarginTop;

            let leftToDraw = chunkPdfHeight;
            let slicePosition = cursorY;

            pdf.addImage(dataUrl, 'PNG', drawX, slicePosition, drawWidth, chunkPdfHeight, undefined, 'FAST');
            leftToDraw -= maxUsableHeight;

            while (leftToDraw > 0) {
              pdf.addPage();
              fillPageBg(pdf, pdfWidth, pdfPageHeight);
              slicePosition -= maxUsableHeight;
              pdf.addImage(dataUrl, 'PNG', drawX, slicePosition, drawWidth, chunkPdfHeight, undefined, 'FAST');
              leftToDraw -= maxUsableHeight;
            }
            cursorY = slicePosition + chunkPdfHeight;
          } else {
            pdf.addPage();
            fillPageBg(pdf, pdfWidth, pdfPageHeight);
            cursorY = pageMarginTop;
            pdf.addImage(dataUrl, 'PNG', drawX, cursorY, drawWidth, chunkPdfHeight, undefined, 'FAST');
            cursorY += chunkPdfHeight;
          }
        }

        // Small gap between components for visual separation
        cursorY += 2;
      }

      pdf.save('TravelHub24-Itinerary.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details: ' + error.message);
    } finally {
      offscreen.remove();
      setIsDownloading(false);
    }
  };
  return (
    <div className={`font-['Segoe_UI',sans-serif] bg-[#f5f5f5] dark:bg-[#0a0a0a] text-gray-900 dark:text-white print:absolute print:left-0 print:top-0 print:w-full print:z-9999 print:bg-white print:text-black print:m-0 print:p-0 min-h-screen max-w-[900px] mx-auto p-0 ${bebasNeue.variable} ${montserrat.variable} transition-colors duration-300`}>

      {/* Action Bar (Hidden in Print) */}
      <div className="print:hidden sticky top-0 z-50 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#222] p-4 mb-4 flex justify-between items-center rounded-b-lg shadow-sm">
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 flex items-center gap-2 [font-family:var(--font-montserrat)] text-xs font-bold text-gray-600 dark:text-[#aaa] hover:text-[#c8a84b] dark:hover:text-[#c8a84b] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded transition-colors">
            <Edit2 className="w-4 h-4" /> <span className="hidden sm:inline">EDIT</span>
          </button>
          <button onClick={onDelete} className="p-2 flex items-center gap-2 [font-family:var(--font-montserrat)] text-xs font-bold text-gray-600 dark:text-[#aaa] hover:text-red-500 hover:bg-red-50 dark:hover:bg-[#1a0a0a] rounded transition-colors">
            <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">DELETE</span>
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="px-4 py-2 flex items-center gap-2 [font-family:var(--font-montserrat)] text-xs font-bold border border-[#c8a84b] text-[#c8a84b] hover:bg-[#c8a84b] hover:text-white dark:hover:text-black rounded transition-colors">
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">PRINT</span>
          </button>
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="px-4 py-2 flex items-center justify-center min-w-[150px] gap-2 [font-family:var(--font-montserrat)] text-xs font-bold bg-[#c8a84b] text-black hover:bg-[#b09442] rounded shadow-[0_2px_10px_rgba(200,168,75,0.3)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDownloading ? 'GENERATING...' : 'DOWNLOAD PDF'}</span>
          </button>
        </div>
      </div>

      <div ref={contentRef} className="print:bg-white print:text-black">
        <div className="pdf-page bg-white dark:bg-[#111] border-x border-t border-gray-200 dark:border-[#222]">
          {/* Hero */}
          <div className="relative flex flex-col justify-between gap-2 p-5 min-h-[400px] h-fit isolate print:h-[400px]">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10" style={{ backgroundImage: `url(${heroImageUrl})` }}></div>
            <div className="absolute inset-0 dark:bg-linear-to-b from-black/30 to-black/70"></div>

            <div className="border bg-black border-[#c8a84b] p-2 rounded-lg w-fit z-10">
              <img className="w-28 aspect-square" src="/logos/travelhub24_logo_400w.png" alt="TravelHub24 - Keep your dreams alive" width="200" height="auto" />
            </div>

            <h1 className="[font-family:var(--font-bebas)] text-5xl md:text-[80px] leading-[0.9] text-white/92 text-center drop-shadow-[2px_4px_20px_rgba(0,0,0,0.9)] tracking-[2px] md:tracking-[4px]">MALAYSIA-SINGAPORE-PHUKET</h1>

            <div className="bg-black/60 w-fit p-2 rounded-md z-10">
              <p className="[font-family:var(--font-montserrat)] text-[13px] font-semibold text-white/90 tracking-[1px]">PROPOSAL <span className="bg-[#c8a84b] text-black [font-family:var(--font-montserrat)] font-bold text-xs rounded p-1 inline-block align-middle">3N 4D</span></p>
              <p className="[font-family:var(--font-montserrat)] text-[11px] font-semibold text-white/90 tracking-[1px]">SEGMENTS: Malaysia, Singapore</p>
              <p className="[font-family:var(--font-montserrat)] text-[11px] font-semibold text-white/90 tracking-[1px]">PACKAGE ID: PU-KRA-APRIL01</p>
            </div>
          </div>

          {/* Guest Details */}
          <div className="grid grid-cols-2 bg-[#fafafa] dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]">
            <GuestCell label="Guest Name" value="SANOJ" highlight colSpan="col-span-2 md:col-span-1" />
            <div className="grid grid-cols-2">
              <GuestCell label="Total Cost" value="₹50,000" />
              <GuestCell label="Reward Points" value="500" colSpan="!border-r border-gray-200 dark:border-[#2a2a2a]" />
            </div>
            <GuestCell label="No of Guests" value="2 ADULT" />
            <GuestCell label="Tour Duration" value="4 DAYS" />
            <GuestCell label="Departing From" value="COK" />
            <GuestCell label="Arriving At" value="COK" />
            <GuestCell label="Tour Start Date" value="11/04/2026" />
            <GuestCell label="Tour End Date" value="19/03/2026" />
          </div>

          {/* Category Row */}
          <div className="flex flex-col md:grid md:grid-cols-2 bg-[#fafafa] dark:bg-[#1a1a1a] border-x border-gray-200 dark:border-[#2a2a2a]">
            <div className="border-r border-gray-200 dark:border-[#2a2a2a] p-4 [font-family:var(--font-montserrat)] text-[22px] font-black text-gray-900 dark:text-white tracking-[2px]">CATEGORY</div>
            <div className="flex items-center gap-5 py-3 px-5 flex-wrap">
              <CheckOption label="HONEYMOON" checked />
              <CheckOption label="FAMILY" />
              <CheckOption label="GROUP" />
            </div>
          </div>

          {/* Type Row */}
          <div className="flex flex-col md:grid md:grid-cols-2 bg-[#fafafa] dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]">
            <div className="border-r border-gray-200 dark:border-[#2a2a2a] p-4 [font-family:var(--font-montserrat)] text-[22px] font-black text-gray-900 dark:text-white tracking-[2px]">TYPE</div>
            <div className="flex items-center gap-5 py-3 px-5 flex-wrap">
              <CheckOption label="ECONOMY" />
              <CheckOption label="STANDARD" checked />
              <CheckOption label="PREMIUM" />
            </div>
          </div>

          {/* Transportation */}
          <div className="px-5">
            <div className="[font-family:var(--font-montserrat)] text-base font-black text-[#c8a84b] tracking-[2px] pt-[14px] px-5 pb-2 uppercase border-b-2 border-[#c8a84b] mx-0">TRANSPORTATION</div>
          </div>
          <div className="grid grid-cols-3 gap-3 py-4 px-5">
            <div className="flex-1 border-2 border-[#c8a84b] rounded-lg flex items-center justify-center p-3.5  transition-colors"><Plane className="w-8 h-8 text-black dark:text-white" /></div>
            <div className="flex-1 border-2 border-[#c8a84b] rounded-lg flex items-center justify-center p-3.5  transition-colors"><Car className="w-8 h-8 text-black dark:text-white" /></div>
          </div>

          {/* Travel Details */}
          <div className="px-5">
            <div className="[font-family:var(--font-montserrat)] text-base font-black text-[#c8a84b] tracking-[2px] pt-[14px] px-5 pb-2 uppercase border-b-2 border-[#c8a84b] mx-0">TRAVEL DETAILS</div>
          </div>
          <div className="pdf-page m-[12px_20px_20px]">
            <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden">
              <div className="flex flex-col md:flex-row bg-white dark:bg-[#161616]">
                {/* Outbound Flight */}
                <div className="flex-1 flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center shrink-0"><PlaneTakeoff className="w-10 h-10 text-[#c8a84b]" /></div>
                  <div className="[font-family:var(--font-montserrat)]">
                    <div className="text-lg font-extrabold text-gray-900 dark:text-white">COK → KUL</div>
                    <div className="text-xs text-gray-600 dark:text-[#aaa] mt-0.5">MON, 16 APR 2026</div>
                    <div className="text-xl font-bold text-[#c8a84b] mt-1">00:30 → 07:20</div>
                    <div className="text-[10px] text-gray-500 dark:text-[#888] mt-1">BAGGAGE: 7 KGS | 0 KGS</div>
                  </div>
                </div>
                {/* Divider: horizontal on mobile, vertical on desktop */}
                <div className="h-px md:h-auto md:w-px bg-gray-200 dark:bg-[#2a2a2a] mx-4 md:mx-0 md:my-4 min-h-0 md:min-h-[60px]"></div>
                {/* Inbound Flight */}
                <div className="flex-1 flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center shrink-0"><PlaneLanding className="w-10 h-10 text-[#c8a84b]" /></div>
                  <div className="[font-family:var(--font-montserrat)]">
                    <div className="text-lg font-extrabold text-gray-900 dark:text-white">KUL → COK</div>
                    <div className="text-xs text-gray-600 dark:text-[#aaa] mt-0.5">THU, 19 APRIL 2026</div>
                    <div className="text-xl font-bold text-[#c8a84b] mt-1">20:25 → 22:00 +1 DAY</div>
                    <div className="text-[10px] text-gray-500 dark:text-[#888] mt-1">BAGGAGE: 7 KGS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Details */}
          <div className="px-5">
            <div className="[font-family:var(--font-montserrat)] text-base font-black text-[#c8a84b] tracking-[2px] pt-[14px] px-5 pb-2 uppercase border-b-2 border-[#c8a84b] mx-0">HOTEL DETAILS</div>
          </div>
          <div className="m-[12px_20px_0] pb-5 print:break-inside-avoid">
            <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden">
              <div className="py-2.5 px-5 flex justify-between items-center">
                <span className="ml-auto bg-[#c8a84b] text-black [font-family:var(--font-montserrat)] text-[11px] font-extrabold py-1 px-3 rounded tracking-[1px]">STANDARD</span>
              </div>
              <div className="bg-white dark:bg-[#161616] p-5 text-center">
                <div className="[font-family:var(--font-montserrat)] text-base font-bold text-gray-900 dark:text-white tracking-[1px]">PACIFIC EXPRESS HOTEL CENTRAL MARKET</div>
                <div className="[font-family:var(--font-montserrat)] text-[13px] text-gray-500 dark:text-[#888] mt-1">- 3 NIGHTS</div>
                <div className="[font-family:var(--font-montserrat)] text-sm text-[#c8a84b] font-bold my-2">OR</div>
                <div className="[font-family:var(--font-montserrat)] text-base font-bold text-gray-900 dark:text-white tracking-[1px]">ASTO HOTELS KUALA LUMPUR</div>
                <div className="[font-family:var(--font-montserrat)] text-[13px] text-gray-500 dark:text-[#888] mt-1">- 3 NIGHTS</div>
              </div>
              <div className="[font-family:var(--font-montserrat)] text-[9px] text-gray-400 dark:text-[#555] text-right p-2 italic border-t border-gray-200 dark:border-[#2a2a2a]">
                SIMILAR PROPERTIES WILL BE PROVIDED IN CASE THE QUOTED PROPERTY IS UNAVAILABLE
              </div>
            </div>
          </div>
        </div>

        {/* ITINERARY */}
        <div className="pdf-page print:break-after-page bg-white dark:bg-[#111] border-x border-b border-gray-200 dark:border-[#222] px-6">
          <div className="[font-family:var(--font-bebas)] text-[36px] tracking-[4px] text-gray-900 dark:text-white mb-5 border-l-[5px] border-[#c8a84b] pl-3">ITINERARY</div>

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


          {/* INCLUDES / EXCLUDES / HIGHLIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 print:break-inside-avoid print:mt-4">
            <InfoCard title="INCLUDES THE FOLLOWING" items={[
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
          <div className="flex mb-5 p-4 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-lg">
            <div className="[font-family:var(--font-bebas)] text-[22px] tracking-[3px] [writing-mode:vertical-rl] rotate-180 text-[#c8a84b] border-r-2 border-[#c8a84b] pr-2 mr-3">TRIP HIGHLIGHTS</div>
            <div className="flex gap-2 flex-1 items-center flex-wrap">
              {[
                "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=300&q=80",
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
                "https://images.unsplash.com/photo-1568454537842-d933259bb258?w=300&q=80",
                "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=300&q=80",
              ].map((src, i) => (
                <div className="flex-1 min-w-[100px] h-[100px] rounded-lg overflow-hidden border-2 border-gray-200 dark:border-[#2a2a2a]" key={i}>
                  <img src={src} alt={`highlight ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Offers */}
          <div className="print:break-inside-avoid print:mt-4">
            <div className="[font-family:var(--font-bebas)] text-[36px] tracking-[4px] text-gray-900 dark:text-white mb-5 border-l-[5px] border-[#c8a84b] pl-3">OFFERS AND DISCOUNTS</div>
            <div className="bg-linear-to-br from-amber-50 to-white dark:from-[#1a1a1a] dark:to-[#0d0d0d] border border-[#c8a84b] rounded-lg p-5 flex gap-5 items-center">
              <div className="flex-1">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-1">
                  <Globe className="w-10 h-10 text-[#c8a84b]" />
                  <div>
                    <div className="[font-family:var(--font-montserrat)] text-[11px] text-[#c8a84b] tracking-[2px] uppercase mb-1">GET A CHANCE TO WIN AN</div>
                    <div className="[font-family:var(--font-bebas)] text-[42px] text-gray-900 dark:text-white leading-none">INTERNATIONAL<br />TRIP!</div>
                  </div>
                </div>
              </div>
              <div className="w-px bg-gray-300 dark:bg-[#333] min-h-[80px]"></div>
              <div className="flex-1 text-right">
                <div className="flex justify-end gap-1.5 items-center [font-family:var(--font-montserrat)] text-[13px] font-bold text-[#c8a84b] tracking-[1px] uppercase"><Target className="w-5 h-5 mb-0.5 text-[#c8a84b]" /> LUCKY DRAW CONTEST ALERT!</div>
                <div className="[font-family:var(--font-montserrat)] text-[11px] text-gray-600 dark:text-[#aaa] mt-2 leading-[1.6]">
                  <strong className="text-gray-900 dark:text-white">HOW TO PARTICIPATE? IT'S SIMPLE!</strong><br />
                  BOOK ANY ONE TRAVEL PACKAGE FROM OUR COMPANY BEFORE 31 DECEMBER 2025..<br />
                  THAT'S IT - YOU'RE AUTOMATICALLY ENTERED INTO THE LUCKY DRAW!
                </div>
              </div>
            </div>
          </div>

          {/* T&C */}
          <div className="[font-family:var(--font-bebas)] text-[36px] tracking-[4px] text-gray-900 dark:text-white my-5 border-l-[5px] border-[#c8a84b] pl-3">TERMS AND CONDITIONS</div>

          {/* Payment Policy */}
          <div className="mb-5 print:break-inside-avoid print:mt-4">
            <div className="[font-family:var(--font-montserrat)] text-sm font-extrabold text-[#c8a84b] tracking-[2px] uppercase mb-3">PAYMENT POLICY</div>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr>
                  <th className="bg-[#c8a84b] text-black [font-family:var(--font-montserrat)] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-gray-300 dark:border-[#333]">PAYMENT SCHEDULE</th>
                  <th className="bg-[#c8a84b] text-black [font-family:var(--font-montserrat)] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-gray-300 dark:border-[#333]">AMOUNT</th>
                  <th className="bg-[#c8a84b] text-black [font-family:var(--font-montserrat)] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-gray-300 dark:border-[#333]">REMARK</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-white dark:bg-[#161616] text-gray-700 dark:text-[#ccc] [font-family:var(--font-montserrat)] text-xs py-2.5 px-3.5 border border-gray-200 dark:border-[#2a2a2a]">ADVANCE PAYMENT</td>
                  <td className="bg-white dark:bg-[#161616] text-gray-700 dark:text-[#ccc] [font-family:var(--font-montserrat)] text-xs py-2.5 px-3.5 border border-gray-200 dark:border-[#2a2a2a]">20% OF TOUR COST + FLIGHT FARE</td>
                  <td className="bg-white dark:bg-[#161616] text-gray-700 dark:text-[#ccc] [font-family:var(--font-montserrat)] text-xs py-2.5 px-3.5 border border-gray-200 dark:border-[#2a2a2a]">AT THE TIME OF BOOKING</td>
                </tr>
                <tr className="[&_td]:bg-[#fafafa] dark:[&_td]:bg-[#1a1a1a]">
                  <td className="text-gray-700 dark:text-[#ccc] [font-family:var(--font-montserrat)] text-xs py-2.5 px-3.5 border border-gray-200 dark:border-[#2a2a2a]">FINAL PAYMENT</td>
                  <td className="text-gray-700 dark:text-[#ccc] [font-family:var(--font-montserrat)] text-xs py-2.5 px-3.5 border border-gray-200 dark:border-[#2a2a2a]">FULL PAYMENT</td>
                  <td className="text-gray-700 dark:text-[#ccc] [font-family:var(--font-montserrat)] text-xs py-2.5 px-3.5 border border-gray-200 dark:border-[#2a2a2a]">30 DAYS BEFORE THE TOUR</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cancellation Policy */}
          <div className="mb-5 print:break-inside-avoid print:mt-4">
            <div className="[font-family:var(--font-montserrat)] text-sm font-extrabold text-[#c8a84b] tracking-[2px] uppercase mb-2">CANCELLATION POLICY</div>
            <div className="[font-family:var(--font-montserrat)] text-[11px] text-gray-500 dark:text-[#888] mb-3 leading-[1.6]">
              IN ANY CASE OF CANCELLATION OF BOOKING, IT MUST BE INFORMED IN ADVANCE TO TRAVEL HUB 24 BY WRITING.
              CANCELLATION WILL BE EFFECTIVE ONLY ON THE DATE AND TIME OF RECEIPT OF CANCELLATION LETTER.
              THE FOLLOWING CANCELLATION CHARGES SHALL APPLY AS PER THE PERIOD OF CANCELLATION TERMS.
            </div>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr>
                  <th className="bg-[#c8a84b] text-black [font-family:var(--font-montserrat)] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-gray-300 dark:border-[#333]">TIME PERIOD BEFORE DEPARTURE</th>
                  <th className="bg-[#c8a84b] text-black [font-family:var(--font-montserrat)] text-[11px] font-bold tracking-[1px] uppercase py-2.5 px-3.5 text-left border border-gray-300 dark:border-[#333]">CANCELLATION CHARGE</th>
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
                  <tr key={i} className={i % 2 !== 0 ? "[&_td]:bg-[#fafafa] dark:[&_td]:bg-[#1a1a1a]" : ""}>
                    <td className={`${i % 2 === 0 ? 'bg-white dark:bg-[#161616]' : ''} text-gray-700 dark:text-[#ccc] [font-family:var(--font-montserrat)] text-xs py-2.5 px-3.5 border border-gray-200 dark:border-[#2a2a2a]`}>{period}</td>
                    <td className={`${i % 2 === 0 ? 'bg-white dark:bg-[#161616]' : ''} text-gray-700 dark:text-[#ccc] [font-family:var(--font-montserrat)] text-xs py-2.5 px-3.5 border border-gray-200 dark:border-[#2a2a2a]`}>{charge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="[font-family:var(--font-montserrat)] text-[10px] text-gray-500 dark:text-[#888] mb-3 leading-[1.6]">
            PLEASE READ AND AGREE TO OUR CANCELLATION POLICY BEFORE CONFIRMING YOUR BOOKING. CANCELLATIONS MADE WITHIN THE
            SPECIFIED PERIOD MAY BE ELIGIBLE FOR A REFUND BASED ON APPLICABLE CHARGES. NO REFUNDS WILL BE GIVEN FOR NO-SHOWS
            OR CANCELLATIONS WITHIN 10 DAYS OF DEPARTURE. REFUNDS, IF APPLICABLE WILL BE PROCESSED PROMPTLY AS DETERMINED BY THE COMPANY.
          </div>

          <div className="bg-red-50 dark:bg-[#1a0a0a] border border-red-700 dark:border-[#8b0000] rounded p-2.5 px-3.5 [font-family:var(--font-montserrat)] text-[10px] text-gray-600 dark:text-[#aaa] text-center my-4 italic">
            THIS IS NOT THE FINAL DAY WISE ITINERARY – MAY SHUFFLE, BUT WILL COVER ALL SPECIFIED SIGHT SEEING
          </div>

          {/* Payment Details */}
          <div className="print:break-inside-avoid mt-5">
            <h2 className="[font-family:var(--font-bebas)] text-[36px] tracking-[4px] text-gray-900 dark:text-white border-l-[5px] border-[#c8a84b] pl-3">PAYMENT DETAILS</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
              <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-5">
                <div className="[font-family:var(--font-montserrat)] text-base font-black text-[#c8a84b] tracking-[1px] mb-[14px] uppercase">Bank Account Details</div>
                <div className="[font-family:var(--font-montserrat)] flex gap-1.5 items-center text-[13px] text-gray-700 dark:text-[#ccc] mb-1.5"><Landmark className="w-4 h-4 text-[#c8a84b]" /> <span className="text-gray-900 dark:text-white font-bold ml-1">HDFC BANK</span></div>
                <div className="[font-family:var(--font-montserrat)] text-[13px] text-gray-700 dark:text-[#ccc] mb-1.5">Account No: <span className="text-gray-900 dark:text-white font-bold">50200099241251</span></div>
                <div className="[font-family:var(--font-montserrat)] text-[13px] text-gray-700 dark:text-[#ccc] mb-1.5">IFSC Code: <span className="text-gray-900 dark:text-white font-bold">HDFC0000520</span></div>
                <div className="mt-3.5 py-2.5 px-3 bg-[#fafafa] dark:bg-[#1a1a1a] rounded-md [font-family:var(--font-montserrat)] text-[11px] text-gray-500 dark:text-[#888] flex gap-2 items-center">
                  <Smartphone className="w-4 h-4 text-[#c8a84b]" /> Also accepts: BHIM UPI | G Pay | Paytm | PhonePe
                </div>
              </div>

              <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-5">
                <div className="flex gap-2 mb-3 items-start">
                  <div className="mt-0.5"><MapPin className="w-5 h-5 text-[#c8a84b]" fill="currentColor" /></div>
                  <div>
                    <div className="[font-family:var(--font-montserrat)] text-[13px] font-bold text-gray-900 dark:text-white leading-[1.6]">
                      BRINDAVAN BUSINESS CENTRE,<br />
                      MANIMALA ROAD,<br />
                      PONEKKARA, EDAPPALLY,<br />
                      ERNAKULAM, KERALA.
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="ml-0.5"><Globe className="w-4 h-4 text-[#c8a84b]" /></div>
                  <a href="https://www.travelhub24.in" className="[font-family:var(--font-montserrat)] text-[13px] text-[#c8a84b] no-underline font-semibold">www.travelhub24.in</a>
                </div>
              </div>
            </div>
          </div>
          {/* Footer Phone Numbers */}
          <div className="bg-[#c8a84b] py-[14px] px-5 -mx-6 flex justify-center gap-5 flex-wrap print:break-inside-avoid">
            {["+91 6238882424", "+91 7902220707", "+91 7902220020", "+91 9778007070"].map((phone, i) => (
              <div className="flex items-center gap-1.5 [font-family:var(--font-montserrat)] text-sm font-extrabold text-black tracking-[1px]" key={i}><Phone className="w-4 h-4 text-black" fill="currentColor" /> {phone}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden p-4">
          <div className="bg-white dark:bg-[#111] p-6 rounded-lg w-full max-w-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-[#222]">
            <h3 className="[font-family:var(--font-montserrat)] text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Itinerary?</h3>
            <p className="[font-family:var(--font-montserrat)] text-[13px] text-gray-600 dark:text-[#aaa] mb-6 leading-relaxed">
              Are you sure you want to permanently delete this itinerary? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-5 py-2.5 rounded [font-family:var(--font-montserrat)] text-[13px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  // Actual delete API call goes here
                  console.log('Delete confirmed');
                  setIsDeleting(false);
                }}
                className="px-5 py-2.5 rounded [font-family:var(--font-montserrat)] text-[13px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md flex items-center justify-center"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
