"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Mic, Settings, HelpCircle, Zap, Mail, Trash2 } from "lucide-react"

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
  const [showStartDictate, setShowStartDictate] = useState(false)

  const handleNewEncounter = () => {
    const today = new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })

    // Check if today's date already exists in encounters
    const todayIndex = encounters.findIndex((group) => group.date === today)

    if (todayIndex !== -1) {
      // Add new encounter to existing date group
      const updatedEncounters = [...encounters]
      const newId = Math.max(...updatedEncounters[todayIndex].items.map((item) => item.id), 0) + 1
      updatedEncounters[todayIndex].items.push({ id: newId, status: "Not started", duration: 0 })
      setEncounters(updatedEncounters)
    } else {
      // Create new date group with encounter
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
    // Add your dictation logic here
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
    <div className="w-full max-w-xs h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 font-aeonik">Transcript</h1>
      </div>

      <div className="p-4">
        <div className="relative">
          <div className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300">
            {/* Left side - clickable for new encounter */}
            <button className="flex items-center gap-2 flex-1" onClick={handleNewEncounter}>
              <span className="text-lg">+</span>
              <span className="font-aeonik">New encounter</span>
            </button>

            {/* Right side - clickable for dropdown */}
            <button className="p-1 hover:bg-gray-200 rounded" onClick={toggleDropdown}>
              <ChevronDown className={`w-4 h-4 transition-transform ${showStartDictate ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showStartDictate && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleStartDictate}
              >
                <Mic className="w-4 h-4" />
                <span className="font-aeonik">Start dictated note</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {encounters.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            <div className="px-4 pb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide font-aeonik">
                {isToday(group.date) ? "TODAY" : formatDate(group.date)}
              </h3>
            </div>

            {group.items.map((item) => (
              <div key={item.id} className="px-4 mb-1">
                <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md group">
                  <div>
                    <div className="text-sm text-gray-900 font-aeonik">Encounter</div>
                    <div className="text-xs text-gray-500">
                      {item.status} • {item.duration} min
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="px-4 text-xs text-gray-500 leading-relaxed mt-2 mb-4 font-aeonik">
        Nabla saves your encounters for 14 days. Remember to copy them into your EHR.
      </div>

      <div className="mt-auto border-t border-gray-200">
        <div className="p-2">
          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            <Settings className="w-4 h-4 font-aeonik" />
            Settings
          </Link>
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <Zap className="w-4 h-4" />
            What's new!
          </button>
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <Mail className="w-4 h-4" />
            Contact us
          </button>
        </div>
      </div>
    </div>
  )
}
// "use client";

// import React, { useState } from "react";
// import Link from 'next/link'

// export default function Home() {
//   const [newEncounter, setNewEncounter] = useState([{}]);

//   const handleEncounter = () => {
//     setNewEncounter([...newEncounter, {}]);
//   };

//   return (
//     <div className="w-75 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
//       <div className="p-4 border-b border-gray-200">
//         <h1 className="text-xl font-semibold text-gray-900">Transcribe</h1>
//       </div>

//       <div className="p-4">
//         <button
//           className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300"
//           onClick={handleEncounter}
//         >
//           <div className="flex items-center gap-2">
//             <span className="text-lg">+</span>
//             <span>New encounter</span>
//           </div>
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M19 9l-7 7-7-7"
//             />
//           </svg>
//         </button>
//       </div>

//       <div className="px-4 pb-2">
//         <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//           TODAY
//         </h3>
//       </div>

//       {newEncounter.map((item, index) => (
//         <div key={index} className="px-4 ">
//           <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md group">
//             <div>
//               <div className="text-sm text-gray-900">Encounter {index + 1}</div>
//               <div className="text-xs text-gray-500">Not started • 0 min</div>
//             </div>
//             <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
//               <svg
//                 className="w-4 h-4 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//       ))}

//       <div className="px-4 text-xs text-gray-500 leading-relaxed">
//         Nabla saves your encounters for 14 days. Remember to copy them into your EHR.
//       </div>

//       <div className="mt-auto border-t border-gray-200">
//         <div className="p-2">
//           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md bg-gray-100 cursor-pointer">
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//               />
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//               />
//             </svg>
//             <Link href="/settings">Settings</Link>
            
//           </button>
//           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             Help
//           </button>
//           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 10V3L4 14h7v7l9-11h-7z"
//               />
//             </svg>
//             What's new!
//           </button>
//           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//               />
//             </svg>
//             Contact us
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


