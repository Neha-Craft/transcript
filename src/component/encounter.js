
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Mic, Plus,User,Trash2,Copy, Check, AudioWaveform, FileText, StickyNote, X} from "lucide-react";
import { io } from "socket.io-client";
import Notestabs from "@/component/notestabs";
import { ChevronDown } from "lucide-react"
import DateTimeCalendar from "./calender";
import MicrophoneRecorder from "./microphone";
import Contexttab from "./contexttab";
const socket = io("https://whisper.craftandcode.in/", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  path: "/socket.io/",
})
import {patchPatientDetails,NameChange,getAllInformationApi} from "@/reduxtoolkit/reducer/encounterSlice"
import { useSelector, useDispatch } from "react-redux";
export default function Encounter() {
  const [activeTab, setActiveTab] = useState("Transcript");
  const [encounterType, setEncounterType] = useState("in-person");
  const [showFolder, setShowFolder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [patientContext, setPatientContext] = useState(""); 
  const [liveTranscript, setLiveTranscript] = useState(""); 
  const [audioLevel, setAudioLevel] = useState(0);
  const [showMainFolder, setShowMainFolder] = useState(false);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [transcriptSegments, setTranscriptSegments] = useState([]);
  const [transcriptHistory, setTranscriptHistory] = useState("");
  const [showEncounterFile,setShowEncounterFile]=useState(false)
   const [isEditing, setIsEditing] = useState(false);
   const [headingText, setHeadingText] = useState("Transcript");
    const [isEditingTitle, setIsEditingTitle] = useState(false)
     const [tabCounter, setTabCounter] = useState(1);
       const [showAddDropdown, setShowAddDropdown] = useState(false);
       const[mainFolder,setMainFolder]=useState(true)
       const [allDetails,setAllDetails]=useState({})
         const uuid = useSelector((state) => state?.encounter?.idNumber)
  const [title, setTitle] = useState("Add patient details")
  const defaultTitle = "Add patient details"

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const testStreamRef = useRef(null);
  const testAudioContextRef = useRef(null);
  const testAnimationFrameRef = useRef(null);
  const processorRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);
  const audioBufferQueueRef = useRef([]);
  const sendIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const transcriptHistoryRef = useRef("");
  const dispatch = useDispatch()
 
  const SEND_INTERVAL_MS = 300;
  const MIN_SAMPLES_TO_SEND = Math.floor(16000 * 0.1);
  const renderAudioLevelBars = (level) => {
    const totalBars = 5;
    const activeBars = Math.round((level / 255) * totalBars);
    return [...Array(totalBars)].map((_, i) => (
      <div
        key={i}
        className={`w-[3px] rounded-sm transition-all duration-100 ${
          i < activeBars ? "bg-black h-5" : "bg-gray-300 h-2"
        }`}
      />
    ));
  };
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };
   const handleBlur = () => {
    setIsEditing(false);
  };
const handleTitleChange = (e) => {
  setTitle(e.target.value);
};

const getAllDataInformation = async () => {
   if (!uuid) return;

  try {
    const response = await dispatch(getAllInformationApi(uuid));
  setAllDetails(response.payload)
    console.log("response5", response.payload);
  } catch (error) {
    console.error("Error in getAllDataInformation:", error);
  }
};

useEffect(()=>{
  getAllDataInformation()

},[])
useEffect(() => {
  if (allDetails?.title) {
    setTitle(allDetails.title);
  }
}, [allDetails]);

console.log("alldetails",allDetails?.title)

      const [tabs, setTabs] = useState([
    { id: "Context", label: "Context", icon: FileText, closable: false },
    { id: "Transcript", label: "Transcript", icon: AudioWaveform, closable: false },
    { id: "Note", label: "Note", icon: StickyNote, closable: false },
  ]);


  const handleAddOption = (option) => {
    if (option === "Create a document") {
      const newTabId = `document-${tabCounter}`;
      const newTab = {
        id: newTabId,
        label: `Document ${tabCounter}`,
        icon: FileText,
        closable: true,
        content: "document"
      };
      
      setTabs([...tabs, newTab]);
      setActiveTab(newTabId);
      setTabCounter(tabCounter + 1);
    } else if (option === "New smart dictation") {
      const newTabId = `dictation-${tabCounter}`;
      const newTab = {
        id: newTabId,
        label: `Dictation ${tabCounter}`,
        icon: AudioWaveform,
        closable: true,
        content: "dictation"
      };
      
      setTabs([...tabs, newTab]);
      setActiveTab(newTabId);
      setTabCounter(tabCounter + 1);
    }
    setShowAddDropdown(false);
  };

   const handleCloseTab = (tabId) => {
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);
    
    // If the closed tab was active, switch to the first available tab
    if (activeTab === tabId) {
      setActiveTab(updatedTabs.length > 0 ? updatedTabs[0].id : "");
    }
  };




const handleTitleBlur = async () => {
  if (title.trim() === "") {
    setTitle(defaultTitle);
  } else {
    try {
      const response = await dispatch(patchPatientDetails({
        id: uuid,
        data: { title: title.trim() }
      }));
     
      console.log("response", response?.payload);
      const ab=response?.payload?.title || title
      if(ab){
           dispatch(NameChange(ab))

      }
     
      setTitle(ab)

     

    } catch (error) {
      console.error("Error updating title:", error);
    }
  }
  setIsEditingTitle(false);
};

console.log("title", title)


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };
  const sendAudioData = () => {
  console.log("📡 sendAudioData called");

  const stateCheck = {
    isRecording,
    isPaused,
    socketConnected: socket.connected,
    hasStream: !!streamRef.current,
    hasAudioContext: !!audioContextRef.current,
    audioContextState: audioContextRef.current?.state,
    bufferQueueLength: audioBufferQueueRef.current.length,
    hasProcessor: !!processorRef.current
  };
  

  if (!socket.connected) {
    console.log("❌ Socket not connected");
    return;
  }
  let totalLength = 0;
  audioBufferQueueRef.current.forEach(chunk => {
    totalLength += chunk.length;
  });
  
  console.log("📊 Audio analysis:", {
    totalLength,
    minRequired: MIN_SAMPLES_TO_SEND,
    chunks: audioBufferQueueRef.current.length
  });
  const combinedBuffer = new Int16Array(totalLength);
  let offset = 0;
  while (audioBufferQueueRef.current.length > 0) {
    const chunk = audioBufferQueueRef.current.shift();
    combinedBuffer.set(chunk, offset);
    offset += chunk.length;
  }
  if (combinedBuffer.length > 0) {
    const base64Audio = arrayBufferToBase64(combinedBuffer.buffer);
  
    socket.emit("audio_chunk", { 
      audio: base64Audio 
    });
    console.log("✅ Audio chunk sent successfully");
  }
};
  const startMicrophoneTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      testStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);

      const animate = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        setAudioLevel(avg);
        testAnimationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();
      testAudioContextRef.current = audioCtx;
      setIsMicTesting(true);
    } catch (err) {
      console.error("Microphone test error:", err);
    }
  };

  const stopMicrophoneTest = () => {
    if (testAnimationFrameRef.current) {
      cancelAnimationFrame(testAnimationFrameRef.current);
    }
    if (testAudioContextRef.current) {
      testAudioContextRef.current.close();
    }
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setAudioLevel(0);
    setIsMicTesting(false);
  };
  const startMicVisualizer = (stream) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ 
      sampleRate: 16000 
    });
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 32;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    const animate = () => {
      if (!isRecording || isPaused) return;
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      setAudioLevel(avg);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    audioContextRef.current = audioCtx;
  };

  const stopMicVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setAudioLevel(0);
  };

  const startRecording = async () => {
  try {
    if (isMicTesting) stopMicrophoneTest();
    setIsRecording(true)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { 
        sampleRate: 16000, 
        channelCount: 1, 
        echoCancellation: true, 
        noiseSuppression: true 
      }
    });
    streamRef.current = stream;
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ 
      sampleRate: 16000 
    });
    try {
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
      console.log("✅ Audio worklet loaded successfully");
    } catch (workletError) {
      console.error("❌ Audio Worklet loading error:", workletError);
 
      stream.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      alert("Audio processor not found. Please add audio-processor.js to your public folder.");
      return; 
    }
    mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
    
    mediaStreamSourceRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
    processorRef.current.port.onmessage = (event) => {
      console.log("🎵 Audio data received from worklet:", event.data);
      if (event.data.rms !== undefined) {
        const level = Math.min(255, Math.floor(event.data.rms * 300));
        setAudioLevel(level);
      }
      if (event.data.audio) {
        audioBufferQueueRef.current.push(new Int16Array(event.data.audio));
      }
    };
    setIsRecording(true);
    setIsPaused(false);
    if (socket.connected) {
      socket.emit("start_transcription");
    }
     else {
     
    }
    

    sendIntervalRef.current = setInterval(sendAudioData, SEND_INTERVAL_MS);
    console.log("⏰ Started audio sending interval");

  } catch (err) {
    console.error("❌ Mic error:", err);
    alert(`Could not access microphone: ${err.name} - ${err.message}`);
  }
};

const pauseRecording = () => {
  console.log("⏸️ Pause called - Current state:", { isRecording, isPaused });
  
  if (isRecording && !isPaused) {
    if (liveTranscript.trim()) {
      setTranscriptHistory(prev => {
        const newContent = liveTranscript.trim();
        return prev ? `${prev} ${newContent}` : newContent;
      });
    }
    setIsPaused(true);
    console.log("✅ Set isPaused to true");
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
      console.log("⏹️ Cleared send interval");
    }
    
    stopMicVisualizer();
    console.log("🔇 Stopped mic visualizer");
    
    setShowButton(true);
    console.log("👆 Show resume button");
    
    if (socket.connected) {
      socket.emit("process_final_audio");
      console.log("📤 Sent final audio to server");
    }
    console.log("✅ Pause completed");
  } else {
    console.log("❌ Cannot pause - isRecording:", isRecording, "isPaused:", isPaused);
  }
};



useEffect(() => {
  socket.on("transcript", (data) => {
    console.log("Received transcript data:", data);
    if (data.segments && Array.isArray(data.segments)) {
      setTranscriptSegments(data.segments);
      
      const currentText = data.segments
        .map(segment => segment.text)
        .filter(text => text)
        .join(' ');
      
   
      const combinedTranscript = transcriptHistoryRef.current ? 
        `${transcriptHistoryRef.current} ${currentText}` : currentText;
      
      setLiveTranscript(combinedTranscript);
      setTranscript(combinedTranscript);
      

      setTranscriptHistory(combinedTranscript);
      
  
      if (data.is_final && currentText.trim()) {
        transcriptHistoryRef.current = combinedTranscript;
        
        setPatientContext(prev => {
          const newText = currentText.trim();
          if (newText && !prev.includes(newText)) {
            return prev ? `${prev}\n\n${newText}` : newText;
          }
          return prev;
        });
      }
    }
  });

  socket.on("error", (data) => {
    console.error("Server error:", data.message);
    alert("Transcription error: " + data.message);
  });

  return () => {
    socket.off("transcript");
    socket.off("error");
  };
}, []); 




const resumeRecording = async () => {
  console.log("🔄 Resume called - Current state:", { isRecording, isPaused });
  
  if (isPaused && isRecording) {
    try {
      console.log("🔄 Starting resume process...");
      
  
      const currentLiveTranscript = liveTranscript;
      const currentPatientContext = patientContext;
      
      console.log("💾 Preserved state:", {
        liveTranscriptLength: currentLiveTranscript.length,
        patientContextLength: currentPatientContext.length
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          sampleRate: 16000, 
          channelCount: 1, 
          echoCancellation: true, 
          noiseSuppression: true 
        }
      });
      streamRef.current = stream;


      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ 
        sampleRate: 16000 
      });
      console.log("🔊 Audio context created:", audioContextRef.current.state);
      
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
      console.log("🔧 Audio worklet loaded");
      mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
      mediaStreamSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      console.log("🔗 Audio chain connected");
      processorRef.current.port.onmessage = (event) => {
        console.log("🎵 Worklet message received:", event.data);
        const hasStream = !!streamRef.current;
        const hasContext = !!audioContextRef.current && audioContextRef.current.state !== 'closed';
        if (!hasStream || !hasContext) {
          console.log("❌ No stream or context available");
          return;
        }
        if (event.data.rms !== undefined) {
          const level = Math.min(255, Math.floor(event.data.rms * 300));
          setAudioLevel(level);
        }
        if (event.data.audio) {
          console.log("📦 Adding audio to buffer, current queue length:", audioBufferQueueRef.current.length);
          audioBufferQueueRef.current.push(new Int16Array(event.data.audio));
        }
      };
      setIsPaused(false);
      console.log("✅ Set isPaused to false");
      if (socket.connected) {
        socket.emit("start_transcription");
        console.log("🚀 Restarted transcription");
      }
      sendIntervalRef.current = setInterval(sendAudioData, SEND_INTERVAL_MS);
      console.log("⏰ Resume interval started");
      setShowButton(false);
      console.log("✅ Resume completed successfully");
    } catch (err) {
      console.error("❌ Resume mic error:", err);
      setIsPaused(true);
    }
  } else {
    console.log("❌ Cannot resume - isPaused:", isPaused, "isRecording:", isRecording);
  }
};
  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsPaused(false);
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }
    sendAudioData();
    if (processorRef.current) processorRef.current.disconnect();
    if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (socket.connected) {
      socket.emit("process_final_audio");
    }
    stopMicVisualizer();
    setShowButton(false);
  };
  useEffect(() => {
    startMicrophoneTest();
    return () => stopMicrophoneTest();
  }, []);
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isRecording) stopRecording();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isRecording) stopRecording();
    };
  }, [isRecording]);

  console.log("show",showFolder)

  return (
    <div className="flex-1 bg-[rgb(248,250,252)] min-h-screen">
       {/* { !showFolder && (
         <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-aeonik text-gray-900 font-bold">
            Encounter
          </h1>
        </div>

      )} 
       */}
       <div>
      { showMainFolder && (
        <div >
        <div className="px-8 pt-4 ">
          <div >
          <div>
            <div className="flex items-center  ">           
     <div className="flex items-center space-x-2 pl-[5px]">  
      <div>           
       <User className="w-4 h-4 text-gray-600" /> 
       </div>  
       <div>          
       {isEditingTitle ? (               
         <input                 
           type="text"                 
           value={title}                 
           onChange={handleTitleChange}                 
           onBlur={handleTitleBlur}  
           onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleTitleBlur(); // Submit title
  } else if (e.key === "Escape") {
    setTitle(defaultTitle);
    setIsEditingTitle(false);
  }
}}
               
                        
           placeholder="Add patient details"                 
           className="text-[14px] font-aeonik  text-gray-700 bg-transparent border-none focus:outline-none min-w-0 w-[300px]"                 
           autoFocus               
         />             
       ) : (               
         <p                 
           className="text-[18px] font-extrabold font-aeonik text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"                 
           onClick={() => setIsEditingTitle(true)}               
         >                 
           {title || defaultTitle}               
         </p>             
       )}           
     </div>   
     </div>   
     <div>     
     <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors pt-[13px]">             
       <Trash2 className="w-4 h-4" />           
     </button>         
     </div>
   </div>
             
           
        
          <div className="flex justify-between pt-2">
            <div>
          {  showMainFolder && <DateTimeCalendar />}
          </div>
            <div>
          <MicrophoneRecorder isRecording={isRecording}/>
          </div>
          </div>
        </div>
      
        </div>
        </div>
        </div>
      )}

           {showMainFolder &&  (
        <div className="flex items-center  mb-6 pl-[33px]">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <div key={tab.id} className="flex items-center">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "text-blue-600 bg-blue-50 border-blue-600"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-transparent"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
                {tab.closable && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(tab.id);
                    }}
                    className="ml-1 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
          
          {/* Add button with dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>

            {showAddDropdown && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowAddDropdown(false)}
                />
                
                {/* Dropdown menu */}
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleAddOption("Create a document")}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      Create a document
                    </button>
                    <button
                      onClick={() => handleAddOption("New smart dictation")}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <AudioWaveform className="w-4 h-4 text-gray-500" />
                      New smart dictation
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>

      
     
         

{/*       
      {activeTab === "Transcript" && showMainFolder && (
  <div className="px-8 py-6 border-b border-gray-200">
    {isEditing ? (
      <input
        type="text"
        className="text-2xl font-bold text-gray-900 outline-none border-b border-gray-300 bg-transparent"
        value={headingText}
        autoFocus
        onChange={(e) => setHeadingText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    ) : (
      <div className="flex items-center gap-2 group">
        <h1
          className="text-2xl font-bold text-gray-900 cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          {headingText}
        </h1>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    )}
     {activeTab === "Transcript" && showMainFolder && (
<DateTimeCalendar/>
  )}
  </div>
)} */}
 
   

      {/* {activeTab === "Transcript" && showMainFolder && (
      <div className="px-8 py-6 border-b border-gray-200">
        {isEditing ? (
          <input
            type="text"
            className="text-2xl font-aeonik text-gray-900 font-bold outline-none border-b border-gray-300"
            value={headingText}
            autoFocus
            onChange={(e) => setHeadingText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <h1
            className="text-2xl font-aeonik text-gray-900 font-bold cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {headingText}
          </h1>
        )}
      </div>
    )
  }
   */}

    
         
        
    
        {/* {activeTab === "Transcript"  && showMainFolder &&  (
           <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-aeonik text-gray-900 font-bold">
            hello
          </h1>
        </div>
        
      )} */}
      <div 
        // className={showMainFolder === "true" ? "bg-secondary" : "bg-white"}
        >

      

         
     
 {/* <div className="px-8 ">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer font-aeonik flex items-center gap-2 ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
            
                {tab === "Transcript" && isRecording && !isPaused && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse transition-opacity duration-500"></div>
                )}
              </button>
            ))}
          </nav>
        </div> */}
      </div>
       {/* {activeTab === "transcript" && showMainFolder && (
            <div className="p-6 pr-20">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base min-h-[200px]">hello</div>
                </div>
              </div>
            </div>
          )}
      */}

      {activeTab === "Transcript"  && !showMainFolder && (
        <div className="flex flex-col items-center justify-center px-8 py-16">
          <div className="mb-12">
            <div
              className="w-20 h-20 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>
          {/* {!showFolder && (
            <div className="w-full max-w-md mb-4">
              <div className="mb-4">
                <span className="text-sm font-medium font-aeonik text-gray-600 uppercase tracking-wide">
                  CONTEXT
                </span>
              </div>
              <button
                className="w-full font-aeonik border border-gray-200 rounded-lg py-2 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-[rgb(220,224,233)] transition-all duration-200 flex items-center justify-center"
                onClick={() => setShowFolder(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add context
              </button>
            </div>
          )} */}

          {showFolder && (
            <div className="w-full max-w-md mb-8">
              <div className="flex justify-between text-center items-center">
                <span className="text-sm font-medium font-aeonik text-gray-600 uppercase tracking-wide">
                  CONTEXT
                </span>
                <Mic className="w-4 h-4 text-gray-400" />
              </div>
              <textarea
                placeholder="Name, gender, age, medical history..."
                value={patientContext}
                onChange={(e) => setPatientContext(e.target.value)}
                className="w-full border border-gray-200 hover:border-black rounded-lg py-4 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
          )}
          <div className="w-full max-w-md mb-12">
      

            <div className="mb-6 flex items-center justify-between">
              <label className="text-sm font-aeonik font-medium text-gray-700">
                Encounter type
              </label>
                 <div className="relative">
        <select
          value={encounterType}
          onChange={(e) => setEncounterType(e.target.value)}
          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
        >
          <option value="in-person">In-person</option>
          <option value="virtual">Virtual</option>
          <option value="phone">Phone</option>
        </select>

        {/* Custom arrow icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
            
            </div>

            <div className="flex justify-between items-center">
              <label className="block text-sm font-aeonik font-medium text-gray-700 mb-2">
                Test your microphone
              </label>
              <div className="flex items-end space-x-1 h-6">
                {renderAudioLevelBars(audioLevel)}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (isRecording) {
                stopRecording();
              } else {
                startRecording();
              }
              setShowMainFolder(true);{
                setShowEncounterFile(false)
              }
              setShowFolder(true)

            }}
            className="bg-[rgb(97,81,213)] hover:bg-primary cursor-pointer text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center w-[431px] justify-center"
          >
            <Mic className="w-4 h-4 mr-2" />
            <p className="font-aeonik">
              Start encounter
            </p>
          </button>
        </div>
      )}
      {showMainFolder && activeTab==="Transcript" && (
        <div>
             <div className="p-6 pr-20">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base min-h-[200px]">hello</div>
                </div>
              </div>
            </div>
         
        
           {showMainFolder && (
        <div className="fixed bottom-[30px] ml-[10px] flex gap-[20px] right-0 pr-12">
          {!showButton ? (
            <>
              <button
                onClick={pauseRecording}
                className="bg-white border cursor-pointer border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <p className="font-aeonik">Stop</p>
              </button>
              <button className="bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generate note
              </button>
            </>
          ) : (
            <div className="relative">
              <div className="flex">
                <button
                  onClick={resumeRecording}
                  className="flex cursor-pointer items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#5B5EF0] text-white font-medium py-3 px-4 rounded-l-md transition-colors font-aeonik"
                >
                       <Mic className="w-4 h-4 mr-2" />
             
                  Resume encounter
                </button>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-[#6366F1] hover:bg-[#5B5EF0] text-white px-3 py-3 rounded-r-md border-l border-[#5B5EF0] transition-colors font-aeonik"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <button 
                    onClick={stopRecording}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    End encounter
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Save draft
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}         
        </div>
      )}

      {activeTab === "Context" && (
        <Contexttab/>
       
       
 
)}

      {activeTab === "Note" && <Notestabs />}
    </div>
  );
}