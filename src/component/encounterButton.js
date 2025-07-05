"use client"

import React,{useState} from "react";
import {
  ChevronDown,

} from "lucide-react";
import {postEncounterApi,getAllEncounterApi} from "@/reduxtoolkit/reducer/encounterSlice"
import { useSelector, useDispatch } from "react-redux";

export default function EncounterButton() {

    const [encounters, setEncounters] = useState([])
  


  const dispatch = useDispatch()


  const handleNewEncounter = async () => {
  try {
    const response = await dispatch(postEncounterApi());
    console.log("response", response.payload); 
    setEncounters(response.payload);


    setTimeout(() => {
      window.location.reload();
    }, 500); 
  } catch (error) {
    console.error("Error in handleNewEncounter:", error);
  }
};



  return (
    <div>
      <div className="p-4">
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          <button className="flex-1 flex items-center px-3 py-2 text-sm justify-center text-white hover:bg-black bg-black cursor-pointer" onClick={handleNewEncounter}>
            <span className="text-lg mr-2 font-extrabold">+</span>
            <p className="font-aeonik text-[14px] font-extrabold">
              New encounter
            </p>
          </button>

      <button className="flex items-center justify-center px-3 py-2 text-black bg-white hover:bg-white hover:text-black border-l border-gray-300 focus:outline-none focus:ring-0">
  <ChevronDown size={16} />
</button>

        </div>
      </div>
    </div>
  );
}
