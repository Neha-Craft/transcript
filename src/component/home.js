"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Mic, Settings, HelpCircle, Zap, Mail, Trash2 } from "lucide-react"
import { FileText } from "lucide-react";
import dynamic from "next/dynamic";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import PDFDocument from "@/component/pdfdocument";
import MainButton from "./encounterButton";
import DateEncounter from "./dateEncounter";


export default function Home() {
  const [encounters, setEncounters] = useState([
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
  ])
  const [showPDF, setShowPDF] = useState(false)

  const [showStartDictate, setShowStartDictate] = useState(false)
  const handleNewEncounter = () => {
    const today = new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    const todayIndex = encounters.findIndex((group) => group.date === today)
    if (todayIndex !== -1) {
      const updatedEncounters = [...encounters]
      const newId = Math.max(...updatedEncounters[todayIndex].items.map((item) => item.id), 0) + 1
      updatedEncounters[todayIndex].items.push({ id: newId, status: "Not started", duration: 0 })
      setEncounters(updatedEncounters)
    } else {
   
      setEncounters([{ date: today, items: [{ id: 1, status: "Not started", duration: 0 }] }, ...encounters])
    }
  }
  const toggleDropdown = (e) => {
    e.stopPropagation()
    setShowStartDictate(!showStartDictate)
  }
  const handleStartDictate = () => {
    console.log("Start dictated note clicked")
    setShowStartDictate(false)
 
  }
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
  }
  const isToday = (dateString) => {
    const today = new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    return dateString === today
  }
  return (
    <div className="w-[20%] h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
   
         <p className="text-[27px] font-aeonik text-gray-900 font-extrabold">
            Transcript
          </p>
      </div>
      <MainButton/>
      <DateEncounter encounters={encounters} isToday={isToday} formatDate={formatDate}/>
     
      <div className="mt-auto border-t border-gray-200">
        <div className="p-2">
          <Link
  href="/settings"
  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-aeonik cursor-pointer"
>
  <Settings className="w-4 h-4 text-black " />
  <p className="text-[14px] text-black font-bold font-aeonik">Settings</p>
</Link>

          {/* <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-aeonik cursor-pointer"
          >
            <Settings className="w-4 h-4 font-aeonik" />
            <p className="font-aeonik text-[14px] text-black font-[700]">Settings</p>
           
          </Link> */}
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <HelpCircle className="w-4 h-4 text-black " />
           
              <p className="text-[14px] text-black font-bold font-aeonik"> Help</p>
          </button>
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <Zap className="w-4 h-4 text-black " />
             <p className="text-[14px] text-black font-bold font-aeonik">   What's new!

             </p>
          
          </button>
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <Mail className="w-4 h-4 text-black" />
                   <p className="text-[14px] text-black font-bold font-aeonik">Contact us </p>
           
          </button>
       
            <Link
            href="/pdfencounter"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-aeonik cursor-pointer"
          >
           <FileText className="w-4 h-4 font-aeonik text-black" />
               <p className="text-[14px] text-black font-bold font-aeonik"> PDF Preview </p>
           
          </Link>
        </div>
      </div>
    </div>
  )
}
