
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Mic, Plus } from "lucide-react";
import { io } from "socket.io-client";
import Notestabs from "@/component/notestabs";
import { ChevronDown } from "lucide-react"
const socket = io("https://whisper.craftandcode.in/", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  path: "/socket.io/",
})
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
  const tabs = ["Transcript", "Note"];
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



console.log("live",liveTranscript)
console.log("trans",transcript)
console.log("patieny",patientContext)
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

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div 
        className={showMainFolder === "true" ? "bg-secondary" : "bg-white"}>
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-aeonik text-gray-900 font-bold">
            Encounter
          </h1>
        </div>
 <div className="px-8 border-b border-gray-200">
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
        </div>
      </div>
      {activeTab === "Transcript"  && !showMainFolder && (
        <div className="flex flex-col items-center justify-center px-8 py-16">
          <div className="mb-12">
            <div
              className="w-20 h-20 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>
          {!showFolder && (
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
          )}

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
            <div className="mb-6">
              <span className="text-sm font-medium font-aeonik text-gray-600 uppercase tracking-wide">
                SETTINGS
              </span>
            </div>

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
              {/* <select
                value={encounterType}
                onChange={(e) => setEncounterType(e.target.value)}
                className="pl-3 font-aeonik pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in-person font-aeonik">In-person</option>
                <option value="virtual font-aeonik">Virtual</option>
                <option value="phone font-aeonik">Phone</option>
              </select> */}
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
              setShowMainFolder(true);
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
          <div className="mt-8 w-full max-w-2xl p-8">
            <label className="text-sm font-semibold text-gray-500  mb-2 block font-aeonik">
              Patient context
            </label>
            {isRecording && transcriptHistory && (
              <div className="mb-4 p-3rounded-md">
                <label className="text-xs font-semibold text-blue-600 mb-1 block font-aeonik">
                </label>
                <div className="text-sm  font-aeonik">
                  {transcriptHistory}
                </div>
              </div>
            )}
            {liveTranscript && !isRecording && (
              <button
                onClick={() => {
                  const newText = liveTranscript.trim();
                  if (newText) {
                    setPatientContext(prev => {
                      return prev ? `${prev}\n\n${newText}` : newText;
                    });
                  }
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium font-aeonik"
              >
           
              </button>
            )}
          </div>
           {showMainFolder && activeTab === "Transcript" && (
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
      {activeTab === "Note" && <Notestabs />}
    </div>
  );
}