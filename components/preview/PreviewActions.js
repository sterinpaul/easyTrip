"use client";

import { useState } from "react";
import { Printer, Mail, Loader2, Share2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export default function PreviewActions({ itinerary }) {
  const [sending, setSending] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const emailMutation = useMutation({
    mutationFn: async () => {
      // Dynamic import
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById('itinerary-content');
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', pdfBlob, `${itinerary.title}.pdf`); 

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadRes.ok) throw new Error("Failed to upload PDF");
      const { url: pdfUrl } = await uploadRes.json();

      // 3. Send Email
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: itinerary.client.email,
          subject: `Your Itinerary: ${itinerary.title}`,
          message: `Hi ${itinerary.client.name},\n\nPlease find your itinerary attached.\n\nView online: ${window.location.href}`,
          attachmentUrl: pdfUrl
        })
      });

      if (!emailRes.ok) throw new Error("Failed to send email");
      return emailRes.json();
    },
    onSuccess: () => {
      alert("Email sent successfully!");
    },
    onError: (error) => {
      console.error("Email error:", error);
      alert("Error generating or sending email. Check console.");
    }
  });

  const handleEmail = async () => {
    if (!itinerary.client?.email) {
      alert("No client email found for this itinerary.");
      return;
    }

    if (!confirm(`Send itinerary to ${itinerary.client.email}?`)) return;
    
    emailMutation.mutate();
  };

  return (
    <div className="fixed top-6 right-6 flex gap-3 z-50 print:hidden">
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium border border-gray-100"
      >
        <Printer size={18} />
        <span>Print</span>
      </button>
      
      <button 
        onClick={handleEmail}
        disabled={emailMutation.isPending}
        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium disabled:opacity-50 disabled:scale-100"
      >
        {emailMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
        <span>Email Client</span>
      </button>
    </div>
  );
}
