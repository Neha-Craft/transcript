
"use client";

import { PDFViewer } from "@react-pdf/renderer";
import PDFDocument from "@/component/pdfdocument";

export default function PDFPreviewPage() {
  const encounters = [
    { date: "6/7/2025", items: [{ id: 1, status: "Not started", duration: 0 }] },
    {
      date: "6/6/2025",
      items: [
        { id: 2, status: "Not started", duration: 0 },
        { id: 3, status: "Not started", duration: 0 },
        { id: 4, status: "Not started", duration: 0 },
        { id: 5, status: "Not started", duration: 0 },
      ],
    },
  ];
  return (
    <div className="w-full h-screen">
      {/* <PDFViewer width="100%" height="100%"> */}
        <PDFDocument encounters={encounters} />
      {/* </PDFViewer> */}

    </div>
  );
}
