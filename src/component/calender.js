"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import LanguageComponent from "./languages"

// Simple utility function to combine class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

export default function DateTimeCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const calendarRef = useRef(null)
  const [hasSelectedDate, setHasSelectedDate] = useState(false)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatSelectedDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    const time = formatTime(currentTime)
    return `${day}/${month}/${year} ${time}`
  }

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar)
  }

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear)
    const days = []

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: day,
        isCurrentMonth: true,
        isPrevMonth: false,
      })
    }

    // Next month days
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day: day,
        isCurrentMonth: false,
        isPrevMonth: false,
      })
    }

    return days
  }

  const handleDateClick = (day, isCurrentMonth, isPrevMonth) => {
    if (isCurrentMonth) {
      const newDate = new Date(currentYear, currentMonth, day)
      setSelectedDate(newDate)
      setHasSelectedDate(true)
    } else if (isPrevMonth) {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
      const newDate = new Date(
        currentMonth === 0 ? currentYear - 1 : currentYear,
        currentMonth === 0 ? 11 : currentMonth - 1,
        day,
      )
      setSelectedDate(newDate)
      setHasSelectedDate(true)
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
      const newDate = new Date(
        currentMonth === 11 ? currentYear + 1 : currentYear,
        currentMonth === 11 ? 0 : currentMonth + 1,
        day,
      )
      setSelectedDate(newDate)
      setHasSelectedDate(true)
    }
    setShowCalendar(false)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Close calendar on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatDisplayDate = () => {
    if (!hasSelectedDate) {
      const today = currentTime.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
      })
      const time = formatTime(currentTime)
      return `Today ${today.replace("/", ":")}${time.slice(-2)}`
    }
    return formatSelectedDate(selectedDate)
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="flex">
    <div className="relative max-w-md  rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={toggleCalendar}
          className="flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer"
        >
          <CalendarIcon className="w-4 h-4 text-gray-600" />
          <p className="text-[16px]  font-aeonik text-gray-800 underline decoration-dotted decoration-1 underline-offset-2">
            {formatDisplayDate()}
          </p>
        </button>
      </div>

      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute top-full left-0 z-10 mt-2 bg-white  rounded-lg shadow-lg w-80 p-4"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Session start time</h3>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg ">
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span className="text-base text-gray-800">{formatTime(currentTime)}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Session date</h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg border">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <h4 className="text-base font-medium text-gray-900">
                    {months[currentMonth]} {currentYear}
                  </h4>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg border">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dateObj, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateClick(dateObj.day, dateObj.isCurrentMonth, dateObj.isPrevMonth)}
                      className={cn(
                        "w-8 h-8 text-center rounded-lg text-xs font-medium transition-colors",
                        // Check if this is the selected date OR if it's today and no date has been manually selected
                        (dateObj.day === selectedDate.getDate() &&
                          dateObj.isCurrentMonth &&
                          currentMonth === selectedDate.getMonth() &&
                          currentYear === selectedDate.getFullYear() &&
                          hasSelectedDate) ||
                          (!hasSelectedDate &&
                            dateObj.day === new Date().getDate() &&
                            dateObj.isCurrentMonth &&
                            currentMonth === new Date().getMonth() &&
                            currentYear === new Date().getFullYear())
                          ? "bg-gray-900 text-white hover:bg-gray-900"
                          : dateObj.isCurrentMonth
                            ? "text-gray-900 hover:bg-gray-100"
                            : "text-gray-300 hover:bg-gray-50",
                      )}
                    >
                      {dateObj.day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <div>
      <LanguageComponent/>
      
      </div>
    
    </div>
  )
}

// "use client"

// "use client"

// import { useState, useEffect, useRef } from "react";

// export default function DateTimeCalendar() {
//   const [selectedDate, setSelectedDate] = useState(2);
//   const [currentMonth, setCurrentMonth] = useState(6); // July = 6 (0-indexed)
//   const [currentYear, setCurrentYear] = useState(2025);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [showCalendar, setShowCalendar] = useState(false);

//   const calendarRef = useRef(null);

//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = (date) => {
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const formatDate = (date) => {
//     const today = date.toLocaleDateString('en-US', {
//       month: '2-digit',
//       day: '2-digit'
//     });
//     const time = formatTime(date);
//     return `Today ${today.replace('/', ':')}${time.slice(-2)}`;
//   };

//   const getDaysInMonth = (month, year) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (month, year) => {
//     return new Date(year, month, 1).getDay();
//   };

//   const generateCalendarDays = () => {
//     const daysInMonth = getDaysInMonth(currentMonth, currentYear);
//     const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
//     const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear);
    
//     const days = [];

//     for (let i = firstDay - 1; i >= 0; i--) {
//       days.push({
//         day: daysInPrevMonth - i,
//         isCurrentMonth: false,
//         isPrevMonth: true
//       });
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push({
//         day: day,
//         isCurrentMonth: true,
//         isPrevMonth: false
//       });
//     }

//     const remainingCells = 42 - days.length;
//     for (let day = 1; day <= remainingCells; day++) {
//       days.push({
//         day: day,
//         isCurrentMonth: false,
//         isPrevMonth: false
//       });
//     }

//     return days;
//   };

//   const handleDateClick = (day, isCurrentMonth, isPrevMonth) => {
//     if (isCurrentMonth) {
//       setSelectedDate(day);
//     } else if (isPrevMonth) {
//       if (currentMonth === 0) {
//         setCurrentMonth(11);
//         setCurrentYear(currentYear - 1);
//       } else {
//         setCurrentMonth(currentMonth - 1);
//       }
//       setSelectedDate(day);
//     } else {
//       if (currentMonth === 11) {
//         setCurrentMonth(0);
//         setCurrentYear(currentYear + 1);
//       } else {
//         setCurrentMonth(currentMonth + 1);
//       }
//       setSelectedDate(day);
//     }
//     setShowCalendar(false);
//   };

//   const handlePrevMonth = () => {
//     if (currentMonth === 0) {
//       setCurrentMonth(11);
//       setCurrentYear(currentYear - 1);
//     } else {
//       setCurrentMonth(currentMonth - 1);
//     }
//   };

//   const handleNextMonth = () => {
//     if (currentMonth === 11) {
//       setCurrentMonth(0);
//       setCurrentYear(currentYear + 1);
//     } else {
//       setCurrentMonth(currentMonth + 1);
//     }
//   };

//   const toggleCalendar = () => {
//     setShowCalendar(!showCalendar);
//   };

//   // Close calendar on click outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (calendarRef.current && !calendarRef.current.contains(event.target)) {
//         setShowCalendar(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const calendarDays = generateCalendarDays();

//   return (
//     <div className="relative max-w-md bg-white  rounded-lg ">
 
//       <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={toggleCalendar}
//           className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
//         >
//           <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center">
//             <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
//           </div>
//           <span className="text-lg font-medium text-gray-800">{formatDate(currentTime)}</span>
//         </button>
//       </div>

    
//       {showCalendar && (
//         <div
//           ref={calendarRef}
//           className="absolute top-full left-0 z-10 mt-2 bg-white border rounded-lg shadow-lg w-[90%]"
//         >
//           <div className="p-4">
//             <h3 className="text-lg font-semibold text-gray-900 mb-3">Session start time</h3>
//             <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg border mb-2">
//               <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
//               </div>
//               <span className="text-lg text-gray-800">{formatTime(currentTime)}</span>
//             </div>

//             <div className="mb-2 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">Session date</h3>
//               <button className="p-2 hover:bg-gray-100 rounded">
//                 <div className="w-1 h-1 bg-gray-600 rounded-full mb-1"></div>
//                 <div className="w-1 h-1 bg-gray-600 rounded-full mb-1"></div>
//                 <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
//               </button>
//             </div>

         
//             <div className="flex items-center justify-between mb-4">
//               <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg border">
//                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//               </button>
//               <h4 className="text-lg font-medium text-gray-900">
//                 {months[currentMonth]} {currentYear}
//               </h4>
//               <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg border">
//                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </button>
//             </div>

//             <div className="grid grid-cols-7  mb-2">
//               {daysOfWeek.map((day) => (
//                 <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
//                   {day}
//                 </div>
//               ))}
//             </div>

//             <div className="grid grid-cols-7 gap-1">
//               {calendarDays.map((dateObj, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleDateClick(dateObj.day, dateObj.isCurrentMonth, dateObj.isPrevMonth)}
//                   className={`
//                     w-10 h-10 text-center rounded-lg text-sm font-medium transition-colors
//                     ${
//                       dateObj.day === selectedDate && dateObj.isCurrentMonth
//                         ? "bg-gray-900 text-white"
//                         : dateObj.isCurrentMonth
//                         ? "text-gray-900 hover:bg-gray-100"
//                         : "text-gray-300 hover:bg-gray-50"
//                     }
//                   `}
//                 >
//                   {dateObj.day}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from "react";

// export default function DateTimeCalendar() {
//   const [selectedDate, setSelectedDate] = useState(2);
//   const [currentMonth, setCurrentMonth] = useState(6); // July = 6 (0-indexed)
//   const [currentYear, setCurrentYear] = useState(2025);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [showCalendar, setShowCalendar] = useState(false);

//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

//   // Update current time every second
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   // Format time for display
//   const formatTime = (date) => {
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   // Format date for header
//   const formatDate = (date) => {
//     const today = date.toLocaleDateString('en-US', {
//       month: '2-digit',
//       day: '2-digit'
//     });
//     const time = formatTime(date);
//     return `Today ${today.replace('/', ':')}${time.slice(-2)}`;
//   };

//   // Get days in month
//   const getDaysInMonth = (month, year) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   // Get first day of month (0 = Sunday, 1 = Monday, etc.)
//   const getFirstDayOfMonth = (month, year) => {
//     return new Date(year, month, 1).getDay();
//   };

//   // Generate calendar days
//   const generateCalendarDays = () => {
//     const daysInMonth = getDaysInMonth(currentMonth, currentYear);
//     const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
//     const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear);
    
//     const days = [];

//     // Previous month's trailing days
//     for (let i = firstDay - 1; i >= 0; i--) {
//       days.push({
//         day: daysInPrevMonth - i,
//         isCurrentMonth: false,
//         isPrevMonth: true
//       });
//     }

//     // Current month days
//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push({
//         day: day,
//         isCurrentMonth: true,
//         isPrevMonth: false
//       });
//     }

//     // Next month's leading days
//     const remainingCells = 42 - days.length; // 6 rows × 7 days = 42 cells
//     for (let day = 1; day <= remainingCells; day++) {
//       days.push({
//         day: day,
//         isCurrentMonth: false,
//         isPrevMonth: false
//       });
//     }

//     return days;
//   };

//   const handleDateClick = (day, isCurrentMonth, isPrevMonth) => {
//     if (isCurrentMonth) {
//       setSelectedDate(day);
//     } else if (isPrevMonth) {
//       // Go to previous month and select the day
//       if (currentMonth === 0) {
//         setCurrentMonth(11);
//         setCurrentYear(currentYear - 1);
//       } else {
//         setCurrentMonth(currentMonth - 1);
//       }
//       setSelectedDate(day);
//     } else {
//       // Go to next month and select the day
//       if (currentMonth === 11) {
//         setCurrentMonth(0);
//         setCurrentYear(currentYear + 1);
//       } else {
//         setCurrentMonth(currentMonth + 1);
//       }
//       setSelectedDate(day);
//     }
//   };

//   const handlePrevMonth = () => {
//     if (currentMonth === 0) {
//       setCurrentMonth(11);
//       setCurrentYear(currentYear - 1);
//     } else {
//       setCurrentMonth(currentMonth - 1);
//     }
//   };

//   const handleNextMonth = () => {
//     if (currentMonth === 11) {
//       setCurrentMonth(0);
//       setCurrentYear(currentYear + 1);
//     } else {
//       setCurrentMonth(currentMonth + 1);
//     }
//   };

//   const toggleCalendar = () => {
//     setShowCalendar(!showCalendar);
//   };

//   const calendarDays = generateCalendarDays();

//   return (
//     <div className="max-w-md  bg-white p-6 rounded-lg shadow-sm">
//       {/* Header - Clickable */}
//       <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={toggleCalendar}
//           className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
//         >
//           <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center">
//             <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
//           </div>
//           <span className="text-lg font-medium text-gray-800">{formatDate(currentTime)}</span>
//         </button>
//         {/* <div className="flex items-center space-x-2">
//           <span className="text-lg font-medium text-gray-800">🌐 English</span>
//         </div> */}
//       </div>

//       {/* Calendar and Time Picker - Show/Hide based on state */}
//       {showCalendar && (
//         <div>
//           {/* Session start time */}
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-3">Session start time</h3>
//             <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
//               <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
//               </div>
//               <span className="text-lg text-gray-800">{formatTime(currentTime)}</span>
//             </div>
//           </div>

//           {/* Session date */}
//           <div className="mb-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Session date</h3>
//               <button className="p-2 hover:bg-gray-100 rounded">
//                 <div className="w-1 h-1 bg-gray-600 rounded-full mb-1"></div>
//                 <div className="w-1 h-1 bg-gray-600 rounded-full mb-1"></div>
//                 <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
//               </button>
//             </div>

//             {/* Calendar */}
//             <div className="bg-white border rounded-lg p-4">
//               {/* Month navigation */}
//               <div className="flex items-center justify-between mb-4">
//                 <button 
//                   onClick={handlePrevMonth}
//                   className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300"
//                 >
//                   <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>
//                 <h4 className="text-lg font-medium text-gray-900">{months[currentMonth]} {currentYear}</h4>
//                 <button 
//                   onClick={handleNextMonth}
//                   className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300"
//                 >
//                   <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Days of week header */}
//               <div className="grid grid-cols-7 gap-1 mb-2">
//                 {daysOfWeek.map((day) => (
//                   <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Calendar days */}
//               <div className="grid grid-cols-7 gap-1">
//                 {calendarDays.map((dateObj, index) => (
//                   <button
//                     key={index}
//                     onClick={() => handleDateClick(dateObj.day, dateObj.isCurrentMonth, dateObj.isPrevMonth)}
//                     className={`
//                       w-10 h-10 text-center rounded-lg text-sm font-medium transition-colors
//                       ${
//                         dateObj.day === selectedDate && dateObj.isCurrentMonth
//                           ? "bg-gray-900 text-white"
//                           : dateObj.isCurrentMonth
//                           ? "text-gray-900 hover:bg-gray-100"
//                           : "text-gray-300 hover:bg-gray-50"
//                       }
//                     `}
//                   >
//                     {dateObj.day}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }