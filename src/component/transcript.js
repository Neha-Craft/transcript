"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, Plus, ChevronDown } from 'lucide-react'
import Notestabs from "@/component/notestabs"

export default function AudioTranscription() {
  const [isRecording, setIsRecording] = useState(false)
  const [waitingForStop, setWaitingForStop] = useState(false)
  const [chunkDuration, setChunkDuration] = useState(1000)
  const [websocketUrl, setWebsocketUrl] = useState("wss://whisper.craftandcode.in/asr")
  const [statusText, setStatusText] = useState("Click to start transcription")
  const [linesHtml, setLinesHtml] = useState("")
  const [timer, setTimer] = useState("00:00")

  const [activeTab, setActiveTab] = useState("Transcript")
  const [encounterType, setEncounterType] = useState("in-person")
  const [showFolder, setShowFolder] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [patientContext, setPatientContext] = useState("")
  const [liveTranscript, setLiveTranscript] = useState("")
  const [audioLevel, setAudioLevel] = useState(0)
  const [showMainFolder, setShowMainFolder] = useState(false)
  const [isMicTesting, setIsMicTesting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [transcriptSegments, setTranscriptSegments] = useState([])
  const [transcriptHistory, setTranscriptHistory] = useState("")
  const [finalLines, setFinalLines] = useState([])
  const [completedSentences, setCompletedSentences] = useState([])
    const [timestamp, setTimestamp] = useState(new Date());
  const websocketRef = useRef(null)
  const recorderRef = useRef(null)
  const startTimeRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const microphoneRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastReceivedDataRef = useRef(null)
  const canvasRef = useRef(null)
  const linesTranscriptRef = useRef(null)
  const userClosingRef = useRef(false)
  const transcriptHistoryRef = useRef("")

  const testStreamRef = useRef(null)
  const testAudioContextRef = useRef(null)
  const testAnimationFrameRef = useRef(null)
  const streamRef = useRef(null)

  const tabs = ["Transcript", "Note"]
    useEffect(() => {
        let intervalId;
  
  if (isRecording && !isPaused) {
    intervalId = setInterval(() => {
      setTimestamp(new Date());
    }, 1000);
  }

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [isRecording, isPaused]);
  useEffect(() => {
    if (lastReceivedDataRef.current && Array.isArray(lastReceivedDataRef.current.lines)) {
      lastReceivedDataRef.current.lines.forEach((line) => {
  
        if (line.text && line.text.trim() && line.end !== undefined && line.end > 0) {
          const sentenceId = `${line.text.trim()}_${line.end}`


          setCompletedSentences((prev) => {
            const exists = prev.some((sentence) => sentence.id === sentenceId)

            if (!exists) {
              const newSentence = {
                id: sentenceId,
                text: line.text.trim(),
                end: line.end,
                speaker: line.speaker,
                timestamp: Date.now(),
              }
              return [...prev, newSentence]
            }
            return prev
          })
        }
      })
    }
  }, [lastReceivedDataRef.current])

  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now()
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const minutes = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0")
        const seconds = (elapsed % 60).toString().padStart(2, "0")
        setTimer(`${minutes}:${seconds}`)
      }, 1000)
    } else {
      clearInterval(timerIntervalRef.current)
      // Don't reset timer here - keep the last recorded time
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const minutes = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0")
        const seconds = (elapsed % 60).toString().padStart(2, "0")
        setTimer(`${minutes}:${seconds}`)
      }
    }
  }, [isRecording])

  const renderAudioLevelBars = (level) => {
    const totalBars = 5
    const activeBars = Math.round((level / 255) * totalBars)
    return [...Array(totalBars)].map((_, i) => (
      <div
        key={i}
        className={`w-[3px] rounded-sm transition-all duration-100 ${
          i < activeBars ? "bg-black h-5" : "bg-gray-300 h-2"
        }`}
      />
    ))
  }

  const updateTimer = () => {
    if (!startTimeRef.current) return
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0")
    const seconds = String(elapsed % 60).padStart(2, "0")
    setTimer(`${minutes}:${seconds}`)
  }

  const drawWaveform = () => {
    const analyser = analyserRef.current
    const canvas = canvasRef.current
    if (!analyser || !canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)
    ctx.clearRect(0, 0, width, height)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)

    ctx.lineWidth = 1
    ctx.strokeStyle = "black"
    ctx.beginPath()

    const sliceWidth = width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * height) / 2
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
      x += sliceWidth
    }
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    animationFrameRef.current = requestAnimationFrame(drawWaveform)
  }

  const setupWebSocket = () => {
    return new Promise((resolve, reject) => {
      try {
        websocketRef.current = new WebSocket(websocketUrl)
      } catch (error) {
        setStatusText("Invalid WebSocket URL. Please check and try again.")
        reject(error)
        return
      }

      websocketRef.current.onopen = () => {
        setStatusText("Connected to server.")
        resolve()
      }

      websocketRef.current.onclose = () => {
        if (!userClosingRef.current) {
          if (waitingForStop) {
            setStatusText("Processing finalized or connection closed.")
          } else {
            setStatusText("Disconnected from the WebSocket server.")
            if (isRecording) stopRecording()
          }
        }
        setIsRecording(false)
        setWaitingForStop(false)
        websocketRef.current = null
        updateUI(false, false)
      }

      websocketRef.current.onerror = () => {
        setStatusText("Error connecting to WebSocket.")
        reject(new Error("Error connecting to WebSocket"))
      }
      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log("WebSocket message received:", data)

        if (data.type === "ready_to_stop") {
          setWaitingForStop(false)
          setStatusText("Finished processing audio! Ready to record again.")
          if (websocketRef.current) websocketRef.current.close()
          return
        }

        lastReceivedDataRef.current = data

        // Handle final transcript
        if (data.type === "ready_to_stop" && Array.isArray(data.lines)) {
          setFinalLines((prev) => [...prev, ...data.lines])
          renderTranscript(data)
          return
        }
        if (Array.isArray(data.lines)) {
  data.lines.forEach((line) => {
    if (line.text && line.text.trim()) {
      const sentenceText = line.text.trim();
      const endTime = line.end || null;

      // Append to liveTranscript
      setLiveTranscript((prev) => prev ? `${prev} ${sentenceText}` : sentenceText);

      // Append to transcript
      setTranscript((prev) => prev ? `${prev} ${sentenceText}` : sentenceText);

      // Append to transcript history with timestamp
      if (endTime) {
        setTranscriptHistory((prev) => {
          const newSentence = `${sentenceText} [${endTime}s]`;
          return prev ? `${prev}\n${newSentence}` : newSentence;
        });

        transcriptHistoryRef.current = transcriptHistoryRef.current
          ? `${transcriptHistoryRef.current}\n${sentenceText} [${endTime}s]`
          : `${sentenceText} [${endTime}s]`;
      }

      // Append to patient context
      setPatientContext((prev) => {
        const contextEntry = endTime ? `${sentenceText} [${endTime}s]` : sentenceText;
        return prev && !prev.includes(sentenceText) ? `${prev}\n${contextEntry}` : prev;
      });
    }
  });
}



        const html = renderLines(data)
        setLinesHtml(html)
      }
    })
  }
  const renderLines = (data) => {
    const lines = data.lines || []
    const buffer_diarization = data.buffer_diarization || ""
    const buffer_transcription = data.buffer_transcription || ""

    return lines
      .map((item, idx) => {
        let speakerLabel = ""
        if (item.speaker === -2) {
          speakerLabel = `Silence`
        } else if (item.speaker === -1) {
          // speakerLabel = `Speaker 1`;
        } else if (item.speaker > 0) {
          speakerLabel = `Speaker ${item.speaker}`
        }

        let text = item.text || ""
        if (idx === lines.length - 1) {
          text += buffer_diarization + buffer_transcription
        }

        let endTiming = ""
        if (item.end !== undefined) {
          const endTime = Number.parseFloat(item.end).toFixed(1)
          endTiming = `<span style="color: #666; font-size: 0.875rem; margin-left: 8px;">[${endTime}s]</span>`
        }

        return `<p>${speakerLabel}${endTiming}<br/>${text}</p>`
      })
      .join("")
  }

  const renderTranscript = (data) => {
    const linesDiv = linesTranscriptRef.current
    if (!linesDiv) return

    if (data?.lines?.length) {
      linesDiv.innerHTML = data.lines
        .map((line) => `<p><strong>Speaker ${line.speaker ?? "?"}:</strong> ${line.text}</p>`)
        .join("")
    } else {
      linesDiv.innerHTML = "<p><em>No transcript received.</em></p>"
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const microphone = audioContextRef.current.createMediaStreamSource(stream)
      microphone.connect(analyserRef.current)
      microphoneRef.current = microphone
      streamRef.current = stream

      recorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" })
      recorderRef.current.ondataavailable = (e) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
          websocketRef.current.send(e.data)
        }
      }
      recorderRef.current.start(chunkDuration)

      startTimeRef.current = Date.now()
      timerIntervalRef.current = setInterval(updateTimer, 1000)
      drawWaveform()
      setIsRecording(true)
      updateUI(true, false)
    } catch (err) {
      console.error("Recording error:", err)
      setStatusText("Could not access microphone.")
    }
  }

  const stopRecording = async () => {
    console.log("Stop triggered. isRecording:", isRecording)
    setIsRecording(false)
    setIsPaused(false)
    userClosingRef.current = true
    setWaitingForStop(true)
    setStatusText("Processing final audio...")

    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const emptyBlob = new Blob([], { type: "audio/webm" })
      websocketRef.current.send(emptyBlob)
    }

    if (recorderRef.current) {
      recorderRef.current.stop()
      recorderRef.current = null
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      await audioContextRef.current.close()
      audioContextRef.current = null
    }

    clearInterval(timerIntervalRef.current)
    timerIntervalRef.current = null
    cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = null

    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const minutes = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, "0")
      const seconds = (elapsed % 60).toString().padStart(2, "0")
      setTimer(`${minutes}:${seconds}`)
    }
    setShowButton(false)
    setAudioLevel(0)
    updateUI(false, true)
  }

  const pauseRecording = () => {
    setIsPaused(true)
    setShowButton(true)
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.pause()
    }
  }

  const resumeRecording = async () => {
    if (isPaused && isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
        streamRef.current = stream

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000,
        })

        const analyser = audioContextRef.current.createAnalyser()
        const mic = audioContextRef.current.createMediaStreamSource(stream)
        mic.connect(analyser)
        analyser.fftSize = 256

        analyserRef.current = analyser
        microphoneRef.current = mic

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
        recorder.ondataavailable = (e) => {
          if (websocketRef.current?.readyState === WebSocket.OPEN) {
            websocketRef.current.send(e.data)
          }
        }
        recorder.start(chunkDuration)
        recorderRef.current = recorder

        setIsPaused(false)
        setShowButton(false)
        setStatusText("Recording resumed...")
      } catch (err) {
        console.error("Resume error:", err)
        setIsPaused(true)
        setStatusText("Failed to resume recording.")
      }
    }
  }

  const toggleRecording = async () => {
    if (!isRecording) {
      if (waitingForStop) return
      try {
        if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
          await setupWebSocket()
        }
        setTimer("00:00") // Reset only when starting new recording
        await startRecording()
      } catch (err) {
        setStatusText("Could not connect to WebSocket or access mic. Aborted.")
      }
    } else {
      await stopRecording()
    }
  }

  const updateUI = (recording, waiting) => {
    if (waiting) {
      setStatusText("Please wait for processing to complete...")
    } else if (recording) {
      setStatusText("Recording...")
    } else {
      setStatusText("Click to start transcription")
    }
  }

  const startMicrophoneTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      testStreamRef.current = stream

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 32
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      source.connect(analyser)

      const animate = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
        setAudioLevel(avg)
        testAnimationFrameRef.current = requestAnimationFrame(animate)
      }

      animate()
      testAudioContextRef.current = audioCtx
      setIsMicTesting(true)
    } catch (err) {
      console.error("Microphone test error:", err)
    }
  }

  const stopMicrophoneTest = () => {
    if (testAnimationFrameRef.current) {
      cancelAnimationFrame(testAnimationFrameRef.current)
    }
    if (testAudioContextRef.current) {
      testAudioContextRef.current.close()
    }
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    setAudioLevel(0)
    setIsMicTesting(false)
  }

  useEffect(() => {
    startMicrophoneTest()
    return () => stopMicrophoneTest()
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isRecording) stopRecording()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (isRecording) stopRecording()
    }
  }, [isRecording])

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className={showMainFolder ? "bg-secondary" : "bg-white"}>
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Encounter</h1>
        </div>
        <div className="px-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center gap-2 ${
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

      {activeTab === "Transcript" && !showMainFolder && (
        <div className="flex flex-col items-center justify-center px-8 py-16">
          <div className="mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>

          {!showFolder && (
            <div className="w-full max-w-md mb-4">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">CONTEXT</span>
              </div>
              <button
                className="w-full border border-gray-200 rounded-lg py-2 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
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
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">CONTEXT</span>
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
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">SETTINGS</span>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Encounter type</label>
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">Test your microphone</label>
              <div className="flex items-end space-x-1 h-6">{renderAudioLevelBars(audioLevel)}</div>
            </div>
          </div>

          <button
            onClick={() => {
              toggleRecording()
              setShowMainFolder(true)
            }}
            disabled={waitingForStop}
            className="bg-primary hover:bg-blue-700 cursor-pointer text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center w-full max-w-md justify-center disabled:opacity-50"
          >
            <Mic className="w-4 h-4 mr-2" />
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      )}

      {showMainFolder && activeTab === "Transcript" && (
        <div>
          <div className="mt-8 w-full max-w-2xl p-8">
            {liveTranscript && !isRecording && (
              <div className="mb-4 p-3 rounded-md bg-gray-50">
                <div className="text-sm"></div>
              </div>
            )}

            <div dangerouslySetInnerHTML={{ __html: linesHtml }} />

            <div ref={linesTranscriptRef} className="hidden"></div>
            <canvas ref={canvasRef} width={120} height={60} className="hidden" />
          </div>

          {showMainFolder && activeTab === "Transcript" && (
            <div className="fixed bottom-8 right-8 flex gap-4">
              {!showButton ? (
                <>
                  <button
                    onClick={pauseRecording}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    Pause
                  </button>
                  <button
                    onClick={stopRecording}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
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
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-l-md transition-colors"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Resume encounter
                    </button>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-r-md border-l border-blue-500 transition-colors"
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
  )
}








// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Mic, Plus, ChevronDown } from "lucide-react"
// import Notestabs from "@/component/notestabs"

// export default function AudioTranscription() {
//   const [isRecording, setIsRecording] = useState(false)
//   const [waitingForStop, setWaitingForStop] = useState(false)
//   const [chunkDuration, setChunkDuration] = useState(1000)
//   const [websocketUrl, setWebsocketUrl] = useState("wss://whisper.craftandcode.in/asr")
//   const [statusText, setStatusText] = useState("Click to start transcription")
//   const [linesHtml, setLinesHtml] = useState("")
//   const [timer, setTimer] = useState("00:00")

//   const [activeTab, setActiveTab] = useState("Transcript")
//   const [encounterType, setEncounterType] = useState("in-person")
//   const [showFolder, setShowFolder] = useState(false)
//   const [transcript, setTranscript] = useState("")
//   const [patientContext, setPatientContext] = useState("")
//   const [liveTranscript, setLiveTranscript] = useState("")
//   const [audioLevel, setAudioLevel] = useState(0)
//   const [showMainFolder, setShowMainFolder] = useState(false)
//   const [isMicTesting, setIsMicTesting] = useState(false)
//   const [isPaused, setIsPaused] = useState(false)
//   const [showButton, setShowButton] = useState(false)
//   const [showDropdown, setShowDropdown] = useState(false)
//   const [transcriptSegments, setTranscriptSegments] = useState([])
//   const [transcriptHistory, setTranscriptHistory] = useState("")
//   const [finalLines, setFinalLines] = useState([])
//   const [completedSentences, setCompletedSentences] = useState([])
//   const [timestamp, setTimestamp] = useState(new Date())
//   const websocketRef = useRef(null)
//   const recorderRef = useRef(null)
//   const startTimeRef = useRef(null)
//   const timerIntervalRef = useRef(null)
//   const audioContextRef = useRef(null)
//   const analyserRef = useRef(null)
//   const microphoneRef = useRef(null)
//   const animationFrameRef = useRef(null)
//   const lastReceivedDataRef = useRef(null)
//   const canvasRef = useRef(null)
//   const linesTranscriptRef = useRef(null)
//   const userClosingRef = useRef(false)
//   const transcriptHistoryRef = useRef("")

//   const testStreamRef = useRef(null)
//   const testAudioContextRef = useRef(null)
//   const testAnimationFrameRef = useRef(null)
//   const streamRef = useRef(null)

//   const tabs = ["Transcript", "Note"]
//   useEffect(() => {
//     let intervalId

//     if (isRecording && !isPaused) {
//       intervalId = setInterval(() => {
//         setTimestamp(new Date())
//       }, 1000)
//     }

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId)
//       }
//     }
//   }, [isRecording, isPaused])
//   useEffect(() => {
//     if (lastReceivedDataRef.current && Array.isArray(lastReceivedDataRef.current.lines)) {
//       lastReceivedDataRef.current.lines.forEach((line) => {
//         // Only process sentences that have end time (completed)
//         if (line.text && line.text.trim() && line.end !== undefined && line.end > 0) {
//           const sentenceId = `${line.text.trim()}_${line.end}`

//           // Check if this sentence is already added
//           setCompletedSentences((prev) => {
//             const exists = prev.some((sentence) => sentence.id === sentenceId)

//             if (!exists) {
//               const newSentence = {
//                 id: sentenceId,
//                 text: line.text.trim(),
//                 end: line.end,
//                 speaker: line.speaker,
//                 timestamp: Date.now(),
//               }
//               return [...prev, newSentence]
//             }
//             return prev
//           })
//         }
//       })
//     }
//   }, [lastReceivedDataRef.current])

//   useEffect(() => {
//     if (isRecording) {
//       startTimeRef.current = Date.now()
//       timerIntervalRef.current = setInterval(() => {
//         const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//         const minutes = Math.floor(elapsed / 60)
//           .toString()
//           .padStart(2, "0")
//         const seconds = (elapsed % 60).toString().padStart(2, "0")
//         setTimer(`${minutes}:${seconds}`)
//       }, 1000)
//     } else {
//       clearInterval(timerIntervalRef.current)
//       // Don't reset timer here - keep the last recorded time
//       if (startTimeRef.current) {
//         const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//         const minutes = Math.floor(elapsed / 60)
//           .toString()
//           .padStart(2, "0")
//         const seconds = (elapsed % 60).toString().padStart(2, "0")
//         setTimer(`${minutes}:${seconds}`)
//       }
//     }
//   }, [isRecording])

//   const renderAudioLevelBars = (level) => {
//     const totalBars = 5
//     const activeBars = Math.round((level / 255) * totalBars)
//     return [...Array(totalBars)].map((_, i) => (
//       <div
//         key={i}
//         className={`w-[3px] rounded-sm transition-all duration-100 ${
//           i < activeBars ? "bg-black h-5" : "bg-gray-300 h-2"
//         }`}
//       />
//     ))
//   }

//   const updateTimer = () => {
//     if (!startTimeRef.current) return
//     const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//     const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0")
//     const seconds = String(elapsed % 60).padStart(2, "0")
//     setTimer(`${minutes}:${seconds}`)
//   }

//   const drawWaveform = () => {
//     const analyser = analyserRef.current
//     const canvas = canvasRef.current
//     if (!analyser || !canvas) return

//     const ctx = canvas.getContext("2d")
//     const width = canvas.width / (window.devicePixelRatio || 1)
//     const height = canvas.height / (window.devicePixelRatio || 1)
//     ctx.clearRect(0, 0, width, height)

//     const bufferLength = analyser.frequencyBinCount
//     const dataArray = new Uint8Array(bufferLength)
//     analyser.getByteTimeDomainData(dataArray)

//     ctx.lineWidth = 1
//     ctx.strokeStyle = "black"
//     ctx.beginPath()

//     const sliceWidth = width / bufferLength
//     let x = 0

//     for (let i = 0; i < bufferLength; i++) {
//       const v = dataArray[i] / 128.0
//       const y = (v * height) / 2
//       if (i === 0) ctx.moveTo(x, y)
//       else ctx.lineTo(x, y)
//       x += sliceWidth
//     }
//     ctx.lineTo(width, height / 2)
//     ctx.stroke()

//     animationFrameRef.current = requestAnimationFrame(drawWaveform)
//   }

//   const setupWebSocket = () => {
//     return new Promise((resolve, reject) => {
//       try {
//         websocketRef.current = new WebSocket(websocketUrl)
//       } catch (error) {
//         setStatusText("Invalid WebSocket URL. Please check and try again.")
//         reject(error)
//         return
//       }

//       websocketRef.current.onopen = () => {
//         setStatusText("Connected to server.")
//         resolve()
//       }

//       websocketRef.current.onclose = () => {
//         if (!userClosingRef.current) {
//           if (waitingForStop) {
//             setStatusText("Processing finalized or connection closed.")
//           } else {
//             setStatusText("Disconnected from the WebSocket server.")
//             if (isRecording) stopRecording()
//           }
//         }
//         setIsRecording(false)
//         setWaitingForStop(false)
//         websocketRef.current = null
//         updateUI(false, false)
//       }

//       websocketRef.current.onerror = () => {
//         setStatusText("Error connecting to WebSocket.")
//         reject(new Error("Error connecting to WebSocket"))
//       }
//       websocketRef.current.onmessage = (event) => {
//         const data = JSON.parse(event.data)
//         console.log("WebSocket message received:", data)

//         if (data.type === "ready_to_stop") {
//           setWaitingForStop(false)
//           setStatusText("Finished processing audio! Ready to record again.")
//           if (websocketRef.current) websocketRef.current.close()
//           return
//         }

//         lastReceivedDataRef.current = data

//         // Handle final transcript
//         if (data.type === "ready_to_stop" && Array.isArray(data.lines)) {
//           setFinalLines((prev) => [...prev, ...data.lines])
//           renderTranscript(data)
//           return
//         }
//         if (Array.isArray(data.lines)) {
//           data.lines.forEach((line) => {
//             if (line.text && line.text.trim()) {
//               const sentenceText = line.text.trim()
//               const endTime = line.end || null

//               // Append to liveTranscript
//               setLiveTranscript((prev) => (prev ? `${prev} ${sentenceText}` : sentenceText))

//               // Append to transcript
//               setTranscript((prev) => (prev ? `${prev} ${sentenceText}` : sentenceText))

//               // Append to transcript history with timestamp
//               if (endTime) {
//                 setTranscriptHistory((prev) => {
//                   const newSentence = `${sentenceText} [${endTime}s]`
//                   return prev ? `${prev}\n${newSentence}` : newSentence
//                 })

//                 transcriptHistoryRef.current = transcriptHistoryRef.current
//                   ? `${transcriptHistoryRef.current}\n${sentenceText} [${endTime}s]`
//                   : `${sentenceText} [${endTime}s]`
//               }

//               // Append to patient context
//               setPatientContext((prev) => {
//                 const contextEntry = endTime ? `${sentenceText} [${endTime}s]` : sentenceText
//                 return prev && !prev.includes(sentenceText) ? `${prev}\n${contextEntry}` : prev
//               })
//             }
//           })
//         }

//         const html = renderLines(data)
//         setLinesHtml(html)
//       }
//     })
//   }
//   const renderLines = (data) => {
//     const lines = data.lines || []
//     const buffer_diarization = data.buffer_diarization || ""
//     const buffer_transcription = data.buffer_transcription || ""

//     return lines
//       .map((item, idx) => {
//         let speakerLabel = ""
//         if (item.speaker === -2) {
//           speakerLabel = `Silence`
//         } else if (item.speaker === -1) {
//           // speakerLabel = `Speaker 1`;
//         } else if (item.speaker > 0) {
//           speakerLabel = `Speaker ${item.speaker}`
//         }

//         let text = item.text || ""
//         if (idx === lines.length - 1) {
//           text += buffer_diarization + buffer_transcription
//         }

//         // Format timestamp as MM:SS with proper validation
//         let timeStamp = ""
//         if (item.end !== undefined && item.end !== null && !isNaN(item.end) && item.end > 0) {
//           const totalSeconds = Math.floor(Number(item.end))
//           const minutes = Math.floor(totalSeconds / 60)
//             .toString()
//             .padStart(2, "0")
//           const seconds = (totalSeconds % 60).toString().padStart(2, "0")
//           timeStamp = `${minutes}:${seconds}`
//         } else {
//           // Show current recording time if no end time is available
//           if (startTimeRef.current) {
//             const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//             const minutes = Math.floor(elapsed / 60)
//               .toString()
//               .padStart(2, "0")
//             const seconds = (elapsed % 60).toString().padStart(2, "0")
//             timeStamp = `${minutes}:${seconds}`
//           } else {
//             timeStamp = "00:00"
//           }
//         }

//         return `<p><span style="color: #666; font-size: 0.875rem; font-weight: 500; margin-right: 8px;">${timeStamp}</span>${text}</p>`
//       })
//       .join("")
//   }

//   const renderTranscript = (data) => {
//     const linesDiv = linesTranscriptRef.current
//     if (!linesDiv) return

//     if (data?.lines?.length) {
//       linesDiv.innerHTML = data.lines
//         .map((line) => `<p><strong>Speaker ${line.speaker ?? "?"}:</strong> ${line.text}</p>`)
//         .join("")
//     } else {
//       linesDiv.innerHTML = "<p><em>No transcript received.</em></p>"
//     }
//   }

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
//       analyserRef.current = audioContextRef.current.createAnalyser()
//       const microphone = audioContextRef.current.createMediaStreamSource(stream)
//       microphone.connect(analyserRef.current)
//       microphoneRef.current = microphone
//       streamRef.current = stream

//       recorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" })
//       recorderRef.current.ondataavailable = (e) => {
//         if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//           websocketRef.current.send(e.data)
//         }
//       }
//       recorderRef.current.start(chunkDuration)

//       startTimeRef.current = Date.now()
//       timerIntervalRef.current = setInterval(updateTimer, 1000)
//       drawWaveform()
//       setIsRecording(true)
//       updateUI(true, false)
//     } catch (err) {
//       console.error("Recording error:", err)
//       setStatusText("Could not access microphone.")
//     }
//   }

//   const stopRecording = async () => {
//     console.log("Stop triggered. isRecording:", isRecording)
//     setIsRecording(false)
//     setIsPaused(false)
//     userClosingRef.current = true
//     setWaitingForStop(true)
//     setStatusText("Processing final audio...")

//     if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//       const emptyBlob = new Blob([], { type: "audio/webm" })
//       websocketRef.current.send(emptyBlob)
//     }

//     if (recorderRef.current) {
//       recorderRef.current.stop()
//       recorderRef.current = null
//     }
//     if (microphoneRef.current) {
//       microphoneRef.current.disconnect()
//       microphoneRef.current = null
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop())
//       streamRef.current = null
//     }
//     if (audioContextRef.current && audioContextRef.current.state !== "closed") {
//       await audioContextRef.current.close()
//       audioContextRef.current = null
//     }

//     clearInterval(timerIntervalRef.current)
//     timerIntervalRef.current = null
//     cancelAnimationFrame(animationFrameRef.current)
//     animationFrameRef.current = null

//     if (startTimeRef.current) {
//       const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//       const minutes = Math.floor(elapsed / 60)
//         .toString()
//         .padStart(2, "0")
//       const seconds = (elapsed % 60).toString().padStart(2, "0")
//       setTimer(`${minutes}:${seconds}`)
//     }
//     setShowButton(false)
//     setAudioLevel(0)
//     updateUI(false, true)
//   }

//   const pauseRecording = () => {
//     setIsPaused(true)
//     setShowButton(true)
//     if (recorderRef.current && recorderRef.current.state === "recording") {
//       recorderRef.current.pause()
//     }
//   }

//   const resumeRecording = async () => {
//     if (isPaused && isRecording) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: {
//             sampleRate: 16000,
//             channelCount: 1,
//             echoCancellation: true,
//             noiseSuppression: true,
//           },
//         })
//         streamRef.current = stream

//         audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
//           sampleRate: 16000,
//         })

//         const analyser = audioContextRef.current.createAnalyser()
//         const mic = audioContextRef.current.createMediaStreamSource(stream)
//         mic.connect(analyser)
//         analyser.fftSize = 256

//         analyserRef.current = analyser
//         microphoneRef.current = mic

//         const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
//         recorder.ondataavailable = (e) => {
//           if (websocketRef.current?.readyState === WebSocket.OPEN) {
//             websocketRef.current.send(e.data)
//           }
//         }
//         recorder.start(chunkDuration)
//         recorderRef.current = recorder

//         setIsPaused(false)
//         setShowButton(false)
//         setStatusText("Recording resumed...")
//       } catch (err) {
//         console.error("Resume error:", err)
//         setIsPaused(true)
//         setStatusText("Failed to resume recording.")
//       }
//     }
//   }

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       if (waitingForStop) return
//       try {
//         if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
//           await setupWebSocket()
//         }
//         setTimer("00:00") // Reset only when starting new recording
//         await startRecording()
//       } catch (err) {
//         setStatusText("Could not connect to WebSocket or access mic. Aborted.")
//       }
//     } else {
//       await stopRecording()
//     }
//   }

//   const updateUI = (recording, waiting) => {
//     if (waiting) {
//       setStatusText("Please wait for processing to complete...")
//     } else if (recording) {
//       setStatusText("Recording...")
//     } else {
//       setStatusText("Click to start transcription")
//     }
//   }

//   const startMicrophoneTest = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       testStreamRef.current = stream

//       const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
//       const source = audioCtx.createMediaStreamSource(stream)
//       const analyser = audioCtx.createAnalyser()
//       analyser.fftSize = 32
//       const dataArray = new Uint8Array(analyser.frequencyBinCount)
//       source.connect(analyser)

//       const animate = () => {
//         analyser.getByteFrequencyData(dataArray)
//         const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
//         setAudioLevel(avg)
//         testAnimationFrameRef.current = requestAnimationFrame(animate)
//       }

//       animate()
//       testAudioContextRef.current = audioCtx
//       setIsMicTesting(true)
//     } catch (err) {
//       console.error("Microphone test error:", err)
//     }
//   }

//   const stopMicrophoneTest = () => {
//     if (testAnimationFrameRef.current) {
//       cancelAnimationFrame(testAnimationFrameRef.current)
//     }
//     if (testAudioContextRef.current) {
//       testAudioContextRef.current.close()
//     }
//     if (testStreamRef.current) {
//       testStreamRef.current.getTracks().forEach((track) => track.stop())
//     }
//     setAudioLevel(0)
//     setIsMicTesting(false)
//   }

//   useEffect(() => {
//     startMicrophoneTest()
//     return () => stopMicrophoneTest()
//   }, [])

//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (isRecording) stopRecording()
//     }
//     window.addEventListener("beforeunload", handleBeforeUnload)
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload)
//       if (isRecording) stopRecording()
//     }
//   }, [isRecording])

//   return (
//     <div className="flex-1 bg-white min-h-screen">
//       <div className={showMainFolder ? "bg-secondary" : "bg-white"}>
//         <div className="px-8 py-6 border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-900">Encounter</h1>
//         </div>
//         <div className="px-8 border-b border-gray-200">
//           <nav className="flex space-x-8">
//             {tabs.map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center gap-2 ${
//                   activeTab === tab
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 {tab}
//                 {tab === "Transcript" && isRecording && !isPaused && (
//                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse transition-opacity duration-500"></div>
//                 )}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {activeTab === "Transcript" && !showMainFolder && (
//         <div className="flex flex-col items-center justify-center px-8 py-16">
//           <div className="mb-12">
//             <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
//               <Mic className="w-10 h-10 text-white" />
//             </div>
//           </div>

//           {!showFolder && (
//             <div className="w-full max-w-md mb-4">
//               <div className="mb-4">
//                 <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">CONTEXT</span>
//               </div>
//               <button
//                 className="w-full border border-gray-200 rounded-lg py-2 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
//                 onClick={() => setShowFolder(true)}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add context
//               </button>
//             </div>
//           )}

//           {showFolder && (
//             <div className="w-full max-w-md mb-8">
//               <div className="flex justify-between text-center items-center">
//                 <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">CONTEXT</span>
//                 <Mic className="w-4 h-4 text-gray-400" />
//               </div>
//               <textarea
//                 placeholder="Name, gender, age, medical history..."
//                 value={patientContext}
//                 onChange={(e) => setPatientContext(e.target.value)}
//                 className="w-full border border-gray-200 hover:border-black rounded-lg py-4 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                 rows={3}
//               />
//             </div>
//           )}

//           <div className="w-full max-w-md mb-12">
//             <div className="mb-6">
//               <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">SETTINGS</span>
//             </div>

//             <div className="mb-6 flex items-center justify-between">
//               <label className="text-sm font-medium text-gray-700">Encounter type</label>
//               <div className="relative">
//                 <select
//                   value={encounterType}
//                   onChange={(e) => setEncounterType(e.target.value)}
//                   className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
//                 >
//                   <option value="in-person">In-person</option>
//                   <option value="virtual">Virtual</option>
//                   <option value="phone">Phone</option>
//                 </select>
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-between items-center">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Test your microphone</label>
//               <div className="flex items-end space-x-1 h-6">{renderAudioLevelBars(audioLevel)}</div>
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               toggleRecording()
//               setShowMainFolder(true)
//             }}
//             disabled={waitingForStop}
//             className="bg-primary hover:bg-blue-700 cursor-pointer text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center w-full max-w-md justify-center disabled:opacity-50"
//           >
//             <Mic className="w-4 h-4 mr-2" />
//             {isRecording ? "Stop Recording" : "Start Recording"}
//           </button>
//         </div>
//       )}

//       {showMainFolder && activeTab === "Transcript" && (
//         <div>
//           <div className="mt-8 w-full max-w-2xl p-8">
//             {liveTranscript && !isRecording && (
//               <div className="mb-4 p-3 rounded-md bg-gray-50">
//                 <div className="text-sm"></div>
//               </div>
//             )}

//             <div dangerouslySetInnerHTML={{ __html: linesHtml }} />

//             <div ref={linesTranscriptRef} className="hidden"></div>
//             <canvas ref={canvasRef} width={120} height={60} className="hidden" />
//           </div>

//           {showMainFolder && activeTab === "Transcript" && (
//             <div className="fixed bottom-8 right-8 flex gap-4">
//               {!showButton ? (
//                 <>
//                   <button
//                     onClick={pauseRecording}
//                     className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
//                     </svg>
//                     Pause
//                   </button>
//                   <button
//                     onClick={stopRecording}
//                     className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Generate note
//                   </button>
//                 </>
//               ) : (
//                 <div className="relative">
//                   <div className="flex">
//                     <button
//                       onClick={resumeRecording}
//                       className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-l-md transition-colors"
//                     >
//                       <Mic className="w-4 h-4 mr-2" />
//                       Resume encounter
//                     </button>
//                     <button
//                       onClick={() => setShowDropdown(!showDropdown)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-r-md border-l border-blue-500 transition-colors"
//                     >
//                       <ChevronDown size={16} />
//                     </button>
//                   </div>

//                   {showDropdown && (
//                     <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
//                       <button
//                         onClick={stopRecording}
//                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         End encounter
//                       </button>
//                       <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                         Save draft
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//       {activeTab === "Note" && <Notestabs />}
//     </div>
//   )
// }



// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Mic, Plus, ChevronDown } from 'lucide-react'
// import Notestabs from "@/component/notestabs"

// export default function AudioTranscription() {
//   const [isRecording, setIsRecording] = useState(false)
//   const [waitingForStop, setWaitingForStop] = useState(false)
//   const [chunkDuration, setChunkDuration] = useState(1000)
//   const [websocketUrl, setWebsocketUrl] = useState("wss://whisper.craftandcode.in/asr")
//   const [statusText, setStatusText] = useState("Click to start transcription")
//   const [linesHtml, setLinesHtml] = useState("")
//   const [timer, setTimer] = useState("00:00")

//   const [activeTab, setActiveTab] = useState("Transcript")
//   const [encounterType, setEncounterType] = useState("in-person")
//   const [showFolder, setShowFolder] = useState(false)
//   const [transcript, setTranscript] = useState("")
//   const [patientContext, setPatientContext] = useState("")
//   const [liveTranscript, setLiveTranscript] = useState("")
//   const [audioLevel, setAudioLevel] = useState(0)
//   const [showMainFolder, setShowMainFolder] = useState(false)
//   const [isMicTesting, setIsMicTesting] = useState(false)
//   const [isPaused, setIsPaused] = useState(false)
//   const [showButton, setShowButton] = useState(false)
//   const [showDropdown, setShowDropdown] = useState(false)
//   const [transcriptSegments, setTranscriptSegments] = useState([])
//   const [transcriptHistory, setTranscriptHistory] = useState("")
//   const [finalLines, setFinalLines] = useState([])
//   const [completedSentences, setCompletedSentences] = useState([])
//     const [timestamp, setTimestamp] = useState(new Date());
//   const websocketRef = useRef(null)
//   const recorderRef = useRef(null)
//   const startTimeRef = useRef(null)
//   const timerIntervalRef = useRef(null)
//   const audioContextRef = useRef(null)
//   const analyserRef = useRef(null)
//   const microphoneRef = useRef(null)
//   const animationFrameRef = useRef(null)
//   const lastReceivedDataRef = useRef(null)
//   const canvasRef = useRef(null)
//   const linesTranscriptRef = useRef(null)
//   const userClosingRef = useRef(false)
//   const transcriptHistoryRef = useRef("")

//   const testStreamRef = useRef(null)
//   const testAudioContextRef = useRef(null)
//   const testAnimationFrameRef = useRef(null)
//   const streamRef = useRef(null)

//   const tabs = ["Transcript", "Note"]
//     useEffect(() => {
//         let intervalId;
  
//   if (isRecording && !isPaused) {
//     intervalId = setInterval(() => {
//       setTimestamp(new Date());
//     }, 1000);
//   }

//   return () => {
//     if (intervalId) {
//       clearInterval(intervalId);
//     }
//   };
// }, [isRecording, isPaused]);
//   useEffect(() => {
//     if (lastReceivedDataRef.current && Array.isArray(lastReceivedDataRef.current.lines)) {
//       lastReceivedDataRef.current.lines.forEach((line) => {
//         // Only process sentences that have end time (completed)
//         if (line.text && line.text.trim() && line.end !== undefined && line.end > 0) {
//           const sentenceId = `${line.text.trim()}_${line.end}`

//           // Check if this sentence is already added
//           setCompletedSentences((prev) => {
//             const exists = prev.some((sentence) => sentence.id === sentenceId)

//             if (!exists) {
//               const newSentence = {
//                 id: sentenceId,
//                 text: line.text.trim(),
//                 end: line.end,
//                 speaker: line.speaker,
//                 timestamp: Date.now(),
//               }
//               return [...prev, newSentence]
//             }
//             return prev
//           })
//         }
//       })
//     }
//   }, [lastReceivedDataRef.current])

//   useEffect(() => {
//     if (isRecording) {
//       startTimeRef.current = Date.now()
//       timerIntervalRef.current = setInterval(() => {
//         const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//         const minutes = Math.floor(elapsed / 60)
//           .toString()
//           .padStart(2, "0")
//         const seconds = (elapsed % 60).toString().padStart(2, "0")
//         setTimer(`${minutes}:${seconds}`)
//       }, 1000)
//     } else {
//       clearInterval(timerIntervalRef.current)
//       // Don't reset timer here - keep the last recorded time
//       if (startTimeRef.current) {
//         const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//         const minutes = Math.floor(elapsed / 60)
//           .toString()
//           .padStart(2, "0")
//         const seconds = (elapsed % 60).toString().padStart(2, "0")
//         setTimer(`${minutes}:${seconds}`)
//       }
//     }
//   }, [isRecording])

//   const renderAudioLevelBars = (level) => {
//     const totalBars = 5
//     const activeBars = Math.round((level / 255) * totalBars)
//     return [...Array(totalBars)].map((_, i) => (
//       <div
//         key={i}
//         className={`w-[3px] rounded-sm transition-all duration-100 ${
//           i < activeBars ? "bg-black h-5" : "bg-gray-300 h-2"
//         }`}
//       />
//     ))
//   }

//   const updateTimer = () => {
//     if (!startTimeRef.current) return
//     const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//     const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0")
//     const seconds = String(elapsed % 60).padStart(2, "0")
//     setTimer(`${minutes}:${seconds}`)
//   }

//   const drawWaveform = () => {
//     const analyser = analyserRef.current
//     const canvas = canvasRef.current
//     if (!analyser || !canvas) return

//     const ctx = canvas.getContext("2d")
//     const width = canvas.width / (window.devicePixelRatio || 1)
//     const height = canvas.height / (window.devicePixelRatio || 1)
//     ctx.clearRect(0, 0, width, height)

//     const bufferLength = analyser.frequencyBinCount
//     const dataArray = new Uint8Array(bufferLength)
//     analyser.getByteTimeDomainData(dataArray)

//     ctx.lineWidth = 1
//     ctx.strokeStyle = "black"
//     ctx.beginPath()

//     const sliceWidth = width / bufferLength
//     let x = 0

//     for (let i = 0; i < bufferLength; i++) {
//       const v = dataArray[i] / 128.0
//       const y = (v * height) / 2
//       if (i === 0) ctx.moveTo(x, y)
//       else ctx.lineTo(x, y)
//       x += sliceWidth
//     }
//     ctx.lineTo(width, height / 2)
//     ctx.stroke()

//     animationFrameRef.current = requestAnimationFrame(drawWaveform)
//   }

//   const setupWebSocket = () => {
//     return new Promise((resolve, reject) => {
//       try {
//         websocketRef.current = new WebSocket(websocketUrl)
//       } catch (error) {
//         setStatusText("Invalid WebSocket URL. Please check and try again.")
//         reject(error)
//         return
//       }

//       websocketRef.current.onopen = () => {
//         setStatusText("Connected to server.")
//         resolve()
//       }

//       websocketRef.current.onclose = () => {
//         if (!userClosingRef.current) {
//           if (waitingForStop) {
//             setStatusText("Processing finalized or connection closed.")
//           } else {
//             setStatusText("Disconnected from the WebSocket server.")
//             if (isRecording) stopRecording()
//           }
//         }
//         setIsRecording(false)
//         setWaitingForStop(false)
//         websocketRef.current = null
//         updateUI(false, false)
//       }

//       websocketRef.current.onerror = () => {
//         setStatusText("Error connecting to WebSocket.")
//         reject(new Error("Error connecting to WebSocket"))
//       }
//       websocketRef.current.onmessage = (event) => {
//         const data = JSON.parse(event.data)
//         console.log("WebSocket message received:", data)

//         if (data.type === "ready_to_stop") {
//           setWaitingForStop(false)
//           setStatusText("Finished processing audio! Ready to record again.")
//           if (websocketRef.current) websocketRef.current.close()
//           return
//         }

//         lastReceivedDataRef.current = data

//         // Handle final transcript
//         if (data.type === "ready_to_stop" && Array.isArray(data.lines)) {
//           setFinalLines((prev) => [...prev, ...data.lines])
//           renderTranscript(data)
//           return
//         }
//         if (Array.isArray(data.lines)) {
//   data.lines.forEach((line) => {
//     if (line.text && line.text.trim()) {
//       const sentenceText = line.text.trim();
//       const endTime = line.end || null;

//       // Append to liveTranscript
//       setLiveTranscript((prev) => prev ? `${prev} ${sentenceText}` : sentenceText);

//       // Append to transcript
//       setTranscript((prev) => prev ? `${prev} ${sentenceText}` : sentenceText);

//       // Append to transcript history with timestamp
//       if (endTime) {
//         setTranscriptHistory((prev) => {
//           const newSentence = `${sentenceText} [${endTime}s]`;
//           return prev ? `${prev}\n${newSentence}` : newSentence;
//         });

//         transcriptHistoryRef.current = transcriptHistoryRef.current
//           ? `${transcriptHistoryRef.current}\n${sentenceText} [${endTime}s]`
//           : `${sentenceText} [${endTime}s]`;
//       }

//       // Append to patient context
//       setPatientContext((prev) => {
//         const contextEntry = endTime ? `${sentenceText} [${endTime}s]` : sentenceText;
//         return prev && !prev.includes(sentenceText) ? `${prev}\n${contextEntry}` : prev;
//       });
//     }
//   });
// }



//         const html = renderLines(data)
//         setLinesHtml(html)
//       }
//     })
//   }
//   const renderLines = (data) => {
//     const lines = data.lines || []
//     const buffer_diarization = data.buffer_diarization || ""
//     const buffer_transcription = data.buffer_transcription || ""

//     return lines
//       .map((item, idx) => {
//         let speakerLabel = ""
//         if (item.speaker === -2) {
//           speakerLabel = `Silence`
//         } else if (item.speaker === -1) {
//           // speakerLabel = `Speaker 1`;
//         } else if (item.speaker > 0) {
//           speakerLabel = `Speaker ${item.speaker}`
//         }

//         let text = item.text || ""
//         if (idx === lines.length - 1) {
//           text += buffer_diarization + buffer_transcription
//         }

//         let endTiming = ""
//         if (item.end !== undefined) {
//           const endTime = Number.parseFloat(item.end).toFixed(1)
//           endTiming = `<span style="color: #666; font-size: 0.875rem; margin-left: 8px;">[${endTime}s]</span>`
//         }

//         return `<p>${speakerLabel}${endTiming}<br/>${text}</p>`
//       })
//       .join("")
//   }

//   const renderTranscript = (data) => {
//     const linesDiv = linesTranscriptRef.current
//     if (!linesDiv) return

//     if (data?.lines?.length) {
//       linesDiv.innerHTML = data.lines
//         .map((line) => `<p><strong>Speaker ${line.speaker ?? "?"}:</strong> ${line.text}</p>`)
//         .join("")
//     } else {
//       linesDiv.innerHTML = "<p><em>No transcript received.</em></p>"
//     }
//   }

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
//       analyserRef.current = audioContextRef.current.createAnalyser()
//       const microphone = audioContextRef.current.createMediaStreamSource(stream)
//       microphone.connect(analyserRef.current)
//       microphoneRef.current = microphone
//       streamRef.current = stream

//       recorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" })
//       recorderRef.current.ondataavailable = (e) => {
//         if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//           websocketRef.current.send(e.data)
//         }
//       }
//       recorderRef.current.start(chunkDuration)

//       startTimeRef.current = Date.now()
//       timerIntervalRef.current = setInterval(updateTimer, 1000)
//       drawWaveform()
//       setIsRecording(true)
//       updateUI(true, false)
//     } catch (err) {
//       console.error("Recording error:", err)
//       setStatusText("Could not access microphone.")
//     }
//   }

//   const stopRecording = async () => {
//     console.log("Stop triggered. isRecording:", isRecording)
//     setIsRecording(false)
//     setIsPaused(false)
//     userClosingRef.current = true
//     setWaitingForStop(true)
//     setStatusText("Processing final audio...")

//     if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//       const emptyBlob = new Blob([], { type: "audio/webm" })
//       websocketRef.current.send(emptyBlob)
//     }

//     if (recorderRef.current) {
//       recorderRef.current.stop()
//       recorderRef.current = null
//     }
//     if (microphoneRef.current) {
//       microphoneRef.current.disconnect()
//       microphoneRef.current = null
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop())
//       streamRef.current = null
//     }
//     if (audioContextRef.current && audioContextRef.current.state !== "closed") {
//       await audioContextRef.current.close()
//       audioContextRef.current = null
//     }

//     clearInterval(timerIntervalRef.current)
//     timerIntervalRef.current = null
//     cancelAnimationFrame(animationFrameRef.current)
//     animationFrameRef.current = null

//     if (startTimeRef.current) {
//       const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
//       const minutes = Math.floor(elapsed / 60)
//         .toString()
//         .padStart(2, "0")
//       const seconds = (elapsed % 60).toString().padStart(2, "0")
//       setTimer(`${minutes}:${seconds}`)
//     }
//     setShowButton(false)
//     setAudioLevel(0)
//     updateUI(false, true)
//   }

//   const pauseRecording = () => {
//     setIsPaused(true)
//     setShowButton(true)
//     if (recorderRef.current && recorderRef.current.state === "recording") {
//       recorderRef.current.pause()
//     }
//   }

//   const resumeRecording = async () => {
//     if (isPaused && isRecording) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: {
//             sampleRate: 16000,
//             channelCount: 1,
//             echoCancellation: true,
//             noiseSuppression: true,
//           },
//         })
//         streamRef.current = stream

//         audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
//           sampleRate: 16000,
//         })

//         const analyser = audioContextRef.current.createAnalyser()
//         const mic = audioContextRef.current.createMediaStreamSource(stream)
//         mic.connect(analyser)
//         analyser.fftSize = 256

//         analyserRef.current = analyser
//         microphoneRef.current = mic

//         const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
//         recorder.ondataavailable = (e) => {
//           if (websocketRef.current?.readyState === WebSocket.OPEN) {
//             websocketRef.current.send(e.data)
//           }
//         }
//         recorder.start(chunkDuration)
//         recorderRef.current = recorder

//         setIsPaused(false)
//         setShowButton(false)
//         setStatusText("Recording resumed...")
//       } catch (err) {
//         console.error("Resume error:", err)
//         setIsPaused(true)
//         setStatusText("Failed to resume recording.")
//       }
//     }
//   }

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       if (waitingForStop) return
//       try {
//         if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
//           await setupWebSocket()
//         }
//         setTimer("00:00") // Reset only when starting new recording
//         await startRecording()
//       } catch (err) {
//         setStatusText("Could not connect to WebSocket or access mic. Aborted.")
//       }
//     } else {
//       await stopRecording()
//     }
//   }

//   const updateUI = (recording, waiting) => {
//     if (waiting) {
//       setStatusText("Please wait for processing to complete...")
//     } else if (recording) {
//       setStatusText("Recording...")
//     } else {
//       setStatusText("Click to start transcription")
//     }
//   }

//   const startMicrophoneTest = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       testStreamRef.current = stream

//       const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
//       const source = audioCtx.createMediaStreamSource(stream)
//       const analyser = audioCtx.createAnalyser()
//       analyser.fftSize = 32
//       const dataArray = new Uint8Array(analyser.frequencyBinCount)
//       source.connect(analyser)

//       const animate = () => {
//         analyser.getByteFrequencyData(dataArray)
//         const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
//         setAudioLevel(avg)
//         testAnimationFrameRef.current = requestAnimationFrame(animate)
//       }

//       animate()
//       testAudioContextRef.current = audioCtx
//       setIsMicTesting(true)
//     } catch (err) {
//       console.error("Microphone test error:", err)
//     }
//   }

//   const stopMicrophoneTest = () => {
//     if (testAnimationFrameRef.current) {
//       cancelAnimationFrame(testAnimationFrameRef.current)
//     }
//     if (testAudioContextRef.current) {
//       testAudioContextRef.current.close()
//     }
//     if (testStreamRef.current) {
//       testStreamRef.current.getTracks().forEach((track) => track.stop())
//     }
//     setAudioLevel(0)
//     setIsMicTesting(false)
//   }

//   useEffect(() => {
//     startMicrophoneTest()
//     return () => stopMicrophoneTest()
//   }, [])

//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (isRecording) stopRecording()
//     }
//     window.addEventListener("beforeunload", handleBeforeUnload)
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload)
//       if (isRecording) stopRecording()
//     }
//   }, [isRecording])

//   return (
//     <div className="flex-1 bg-white min-h-screen">
//       <div className={showMainFolder ? "bg-secondary" : "bg-white"}>
//         <div className="px-8 py-6 border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-900">Encounter</h1>
//         </div>
//         <div className="px-8 border-b border-gray-200">
//           <nav className="flex space-x-8">
//             {tabs.map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center gap-2 ${
//                   activeTab === tab
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 {tab}
//                 {tab === "Transcript" && isRecording && !isPaused && (
//                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse transition-opacity duration-500"></div>
//                 )}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {activeTab === "Transcript" && !showMainFolder && (
//         <div className="flex flex-col items-center justify-center px-8 py-16">
//           <div className="mb-12">
//             <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
//               <Mic className="w-10 h-10 text-white" />
//             </div>
//           </div>

//           {!showFolder && (
//             <div className="w-full max-w-md mb-4">
//               <div className="mb-4">
//                 <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">CONTEXT</span>
//               </div>
//               <button
//                 className="w-full border border-gray-200 rounded-lg py-2 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
//                 onClick={() => setShowFolder(true)}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add context
//               </button>
//             </div>
//           )}

//           {showFolder && (
//             <div className="w-full max-w-md mb-8">
//               <div className="flex justify-between text-center items-center">
//                 <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">CONTEXT</span>
//                 <Mic className="w-4 h-4 text-gray-400" />
//               </div>
//               <textarea
//                 placeholder="Name, gender, age, medical history..."
//                 value={patientContext}
//                 onChange={(e) => setPatientContext(e.target.value)}
//                 className="w-full border border-gray-200 hover:border-black rounded-lg py-4 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                 rows={3}
//               />
//             </div>
//           )}

//           <div className="w-full max-w-md mb-12">
//             <div className="mb-6">
//               <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">SETTINGS</span>
//             </div>

//             <div className="mb-6 flex items-center justify-between">
//               <label className="text-sm font-medium text-gray-700">Encounter type</label>
//               <div className="relative">
//                 <select
//                   value={encounterType}
//                   onChange={(e) => setEncounterType(e.target.value)}
//                   className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
//                 >
//                   <option value="in-person">In-person</option>
//                   <option value="virtual">Virtual</option>
//                   <option value="phone">Phone</option>
//                 </select>
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-between items-center">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Test your microphone</label>
//               <div className="flex items-end space-x-1 h-6">{renderAudioLevelBars(audioLevel)}</div>
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               toggleRecording()
//               setShowMainFolder(true)
//             }}
//             disabled={waitingForStop}
//             className="bg-primary hover:bg-blue-700 cursor-pointer text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center w-full max-w-md justify-center disabled:opacity-50"
//           >
//             <Mic className="w-4 h-4 mr-2" />
//             {isRecording ? "Stop Recording" : "Start Recording"}
//           </button>
//         </div>
//       )}

//       {showMainFolder && activeTab === "Transcript" && (
//         <div>
//           <div className="mt-8 w-full max-w-2xl p-8">
//             {liveTranscript && !isRecording && (
//               <div className="mb-4 p-3 rounded-md bg-gray-50">
//                 <div className="text-sm"></div>
//               </div>
//             )}

//             <div dangerouslySetInnerHTML={{ __html: linesHtml }} />

//             <div ref={linesTranscriptRef} className="hidden"></div>
//             <canvas ref={canvasRef} width={120} height={60} className="hidden" />
//           </div>

//           {showMainFolder && activeTab === "Transcript" && (
//             <div className="fixed bottom-8 right-8 flex gap-4">
//               {!showButton ? (
//                 <>
//                   <button
//                     onClick={pauseRecording}
//                     className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
//                     </svg>
//                     Pause
//                   </button>
//                   <button
//                     onClick={stopRecording}
//                     className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Generate note
//                   </button>
//                 </>
//               ) : (
//                 <div className="relative">
//                   <div className="flex">
//                     <button
//                       onClick={resumeRecording}
//                       className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-l-md transition-colors"
//                     >
//                       <Mic className="w-4 h-4 mr-2" />
//                       Resume encounter
//                     </button>
//                     <button
//                       onClick={() => setShowDropdown(!showDropdown)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-r-md border-l border-blue-500 transition-colors"
//                     >
//                       <ChevronDown size={16} />
//                     </button>
//                   </div>

//                   {showDropdown && (
//                     <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
//                       <button
//                         onClick={stopRecording}
//                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         End encounter
//                       </button>
//                       <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                         Save draft
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//       {activeTab === "Note" && <Notestabs />}
//     </div>
//   )
// }


// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { Mic, Plus, ChevronDown } from "lucide-react";
// import Notestabs from "@/component/notestabs";

// export default function AudioTranscription() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [waitingForStop, setWaitingForStop] = useState(false);
//   const [chunkDuration, setChunkDuration] = useState(1000);
//   const [websocketUrl, setWebsocketUrl] = useState("wss://whisper.craftandcode.in/asr");
//   const [statusText, setStatusText] = useState("Click to start transcription");
//   const [linesHtml, setLinesHtml] = useState("");
//   const [timer, setTimer] = useState("00:00");
  

//   const [activeTab, setActiveTab] = useState("Transcript");
//   const [encounterType, setEncounterType] = useState("in-person");
//   const [showFolder, setShowFolder] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [patientContext, setPatientContext] = useState(""); 
//   const [liveTranscript, setLiveTranscript] = useState(""); 
//   const [audioLevel, setAudioLevel] = useState(0);
//   const [showMainFolder, setShowMainFolder] = useState(false);
//   const [isMicTesting, setIsMicTesting] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [showButton, setShowButton] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [transcriptSegments, setTranscriptSegments] = useState([]);
//   const [transcriptHistory, setTranscriptHistory] = useState("");
//   const [finalLines, setFinalLines] = useState([]);
// const [completedSentences, setCompletedSentences] = useState([]);
//   const websocketRef = useRef(null);
//   const recorderRef = useRef(null);
//   const startTimeRef = useRef(null);
//   const timerIntervalRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const microphoneRef = useRef(null);
//   const animationFrameRef = useRef(null);
//   const lastReceivedDataRef = useRef(null);
//   const canvasRef = useRef(null);
//   const linesTranscriptRef = useRef(null);
//   const userClosingRef = useRef(false);
//   const transcriptHistoryRef = useRef("");
  

//   const testStreamRef = useRef(null);
//   const testAudioContextRef = useRef(null);
//   const testAnimationFrameRef = useRef(null);
//   const streamRef = useRef(null);

//   const tabs = ["Transcript", "Note"];
//   useEffect(() => {
//   if (lastReceivedDataRef.current && Array.isArray(lastReceivedDataRef.current.lines)) {
//     lastReceivedDataRef.current.lines.forEach((line) => {
//       // Only process sentences that have end time (completed)
//       if (line.text && line.text.trim() && line.end !== undefined && line.end > 0) {
//         const sentenceId = `${line.text.trim()}_${line.end}`;
        
//         // Check if this sentence is already added
//         setCompletedSentences(prev => {
//           const exists = prev.some(sentence => 
//             sentence.id === sentenceId
//           );
          
//           if (!exists) {
//             const newSentence = {
//               id: sentenceId,
//               text: line.text.trim(),
//               end: line.end,
//               speaker: line.speaker,
//               timestamp: Date.now()
//             };
//             return [...prev, newSentence];
//           }
//           return prev;
//         });
//       }
//     });
//   }
// }, [lastReceivedDataRef.current]);

//   useEffect(() => {
//     if (isRecording) {
//       startTimeRef.current = Date.now();
//       timerIntervalRef.current = setInterval(() => {
//         const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
//         const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
//         const seconds = (elapsed % 60).toString().padStart(2, "0");
//         setTimer(`${minutes}:${seconds}`);
//       }, 1000);
//     } else {
//       clearInterval(timerIntervalRef.current);
//       setTimer("00:00");
//     }
//   }, [isRecording]);


//   const renderAudioLevelBars = (level) => {
//     const totalBars = 5;
//     const activeBars = Math.round((level / 255) * totalBars);
//     return [...Array(totalBars)].map((_, i) => (
//       <div
//         key={i}
//         className={`w-[3px] rounded-sm transition-all duration-100 ${
//           i < activeBars ? "bg-black h-5" : "bg-gray-300 h-2"
//         }`}
//       />
//     ));
//   };

//   const updateTimer = () => {
//     if (!startTimeRef.current) return;
//     const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
//     const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
//     const seconds = String(elapsed % 60).padStart(2, "0");
//     setTimer(`${minutes}:${seconds}`);
//   };

//   const drawWaveform = () => {
//     const analyser = analyserRef.current;
//     const canvas = canvasRef.current;
//     if (!analyser || !canvas) return;

//     const ctx = canvas.getContext("2d");
//     const width = canvas.width / (window.devicePixelRatio || 1);
//     const height = canvas.height / (window.devicePixelRatio || 1);
//     ctx.clearRect(0, 0, width, height);

//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);
//     analyser.getByteTimeDomainData(dataArray);

//     ctx.lineWidth = 1;
//     ctx.strokeStyle = "black";
//     ctx.beginPath();

//     const sliceWidth = width / bufferLength;
//     let x = 0;

//     for (let i = 0; i < bufferLength; i++) {
//       const v = dataArray[i] / 128.0;
//       const y = v * height / 2;
//       if (i === 0) ctx.moveTo(x, y);
//       else ctx.lineTo(x, y);
//       x += sliceWidth;
//     }
//     ctx.lineTo(width, height / 2);
//     ctx.stroke();

//     animationFrameRef.current = requestAnimationFrame(drawWaveform);
//   };

//   const setupWebSocket = () => {
//     return new Promise((resolve, reject) => {
//       try {
//         websocketRef.current = new WebSocket(websocketUrl);
//       } catch (error) {
//         setStatusText("Invalid WebSocket URL. Please check and try again.");
//         reject(error);
//         return;
//       }

//       websocketRef.current.onopen = () => {
//         setStatusText("Connected to server.");
//         resolve();
//       };

//       websocketRef.current.onclose = () => {
//         if (!userClosingRef.current) {
//           if (waitingForStop) {
//             setStatusText("Processing finalized or connection closed.");
//           } else {
//             setStatusText("Disconnected from the WebSocket server.");
//             if (isRecording) stopRecording();
//           }
//         }
//         setIsRecording(false);
//         setWaitingForStop(false);
//         websocketRef.current = null;
//         updateUI(false, false);
//       };

//       websocketRef.current.onerror = () => {
//         setStatusText("Error connecting to WebSocket.");
//         reject(new Error("Error connecting to WebSocket"));
//       };
//       websocketRef.current.onmessage = (event) => {
//   const data = JSON.parse(event.data);
//   console.log("WebSocket message received:", data);

//   if (data.type === "ready_to_stop") {
//     setWaitingForStop(false);
//     setStatusText("Finished processing audio! Ready to record again.");
//     if (websocketRef.current) websocketRef.current.close();
//     return;
//   }

//   lastReceivedDataRef.current = data;
          
//   // Handle final transcript
//   if (data.type === "ready_to_stop" && Array.isArray(data.lines)) {
//     setFinalLines((prev) => [...prev, ...data.lines]);
//     renderTranscript(data);
//     return;
//   }


//   if (Array.isArray(data.lines)) {
//     data.lines.forEach((line) => {
//       if (line.text && line.text.trim()) {
//         const sentenceText = line.text.trim();
//         const endTime = line.end || null;
//         setLiveTranscript(sentenceText);
//         setTranscript(sentenceText);
//         if (endTime) {
//           setTranscriptHistory(prev => {
//             const newSentence = `${sentenceText} [${endTime}s]`;
//             return prev ? `${prev}\n${newSentence}` : newSentence;
//           });
          
//           transcriptHistoryRef.current = transcriptHistoryRef.current 
//             ? `${transcriptHistoryRef.current}\n${sentenceText} [${endTime}s]`
//             : `${sentenceText} [${endTime}s]`;
//         }
//         setPatientContext((prev) => {
//           const newText = sentenceText;
//           if (newText && !prev.includes(newText)) {
//             const contextEntry = endTime ? `${newText} [${endTime}s]` : newText;
//             const updatedContext = prev ? `${prev}\n${contextEntry}` : contextEntry;
//             return updatedContext;
//           }
//           return prev;
//         });
//       }
//     });
//   }

//   const html = renderLines(data);
//   setLinesHtml(html);
// };

  
//     });
//   };
// const renderLines = (data) => {
//   const lines = data.lines || [];
//   const buffer_diarization = data.buffer_diarization || "";
//   const buffer_transcription = data.buffer_transcription || "";

//   return lines.map((item, idx) => {
//     let speakerLabel = "";
//     if (item.speaker === -2) {
//       speakerLabel = `Silence`;
//     } else if (item.speaker === -1) {
//       // speakerLabel = `Speaker 1`;
//     } else if (item.speaker > 0) {
//       speakerLabel = `Speaker ${item.speaker}`;
//     }

//     let text = item.text || "";
//     if (idx === lines.length - 1) {
//       text += buffer_diarization + buffer_transcription;
//     }


//     let endTiming = "";
//     if (item.end !== undefined) {
//       const endTime = parseFloat(item.end).toFixed(1);
//       endTiming = `<span style="color: #666; font-size: 0.875rem; margin-left: 8px;">[${endTime}s]</span>`;
//     }

//     return `<p>${speakerLabel}${endTiming}<br/>${text}</p>`;
//   }).join("");
// };

//   const renderTranscript = (data) => {
//     const linesDiv = linesTranscriptRef.current;
//     if (!linesDiv) return;

//     if (data?.lines?.length) {
//       linesDiv.innerHTML = data.lines
//         .map((line) => `<p><strong>Speaker ${line.speaker ?? "?"}:</strong> ${line.text}</p>`) 
//         .join("");
//     } else {
//       linesDiv.innerHTML = "<p><em>No transcript received.</em></p>";
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
//       analyserRef.current = audioContextRef.current.createAnalyser();
//       const microphone = audioContextRef.current.createMediaStreamSource(stream);
//       microphone.connect(analyserRef.current);
//       microphoneRef.current = microphone;
//       streamRef.current = stream;

//       recorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
//       recorderRef.current.ondataavailable = (e) => {
//         if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//           websocketRef.current.send(e.data);
//         }
//       };
//       recorderRef.current.start(chunkDuration);
      
//       startTimeRef.current = Date.now();
//       timerIntervalRef.current = setInterval(updateTimer, 1000);
//       drawWaveform();
//       setIsRecording(true);
//       updateUI(true, false);
//     } catch (err) {
//       console.error("Recording error:", err);
//       setStatusText("Could not access microphone.");
//     }
//   };

//   const stopRecording = async () => {
//     console.log("Stop triggered. isRecording:", isRecording);
//     setIsRecording(false);
//     setIsPaused(false);
//     userClosingRef.current = true;
//     setWaitingForStop(true);
//     setStatusText("Processing final audio...");

//     if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//       const emptyBlob = new Blob([], { type: 'audio/webm' });
//       websocketRef.current.send(emptyBlob);
//     }

//     if (recorderRef.current) {
//       recorderRef.current.stop();
//       recorderRef.current = null;
//     }
//     if (microphoneRef.current) {
//       microphoneRef.current.disconnect();
//       microphoneRef.current = null;
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     if (audioContextRef.current && audioContextRef.current.state !== "closed") {
//       await audioContextRef.current.close();
//       audioContextRef.current = null;
//     }

//     clearInterval(timerIntervalRef.current);
//     timerIntervalRef.current = null;
//     cancelAnimationFrame(animationFrameRef.current);
//     animationFrameRef.current = null;

//     setTimer("00:00");
//     setShowButton(false);
//     setAudioLevel(0);
//     updateUI(false, true);
//   };

//   const pauseRecording = () => {
//     setIsPaused(true);
//     setShowButton(true);
//     if (recorderRef.current && recorderRef.current.state === "recording") {
//       recorderRef.current.pause();
//     }
//   };

//   const resumeRecording = async () => {
//     if (isPaused && isRecording) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: { 
//             sampleRate: 16000, 
//             channelCount: 1, 
//             echoCancellation: true, 
//             noiseSuppression: true 
//           }
//         });
//         streamRef.current = stream;

//         audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ 
//           sampleRate: 16000 
//         });
        
//         const analyser = audioContextRef.current.createAnalyser();
//         const mic = audioContextRef.current.createMediaStreamSource(stream);
//         mic.connect(analyser);
//         analyser.fftSize = 256;
        
//         analyserRef.current = analyser;
//         microphoneRef.current = mic;
        
//         const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
//         recorder.ondataavailable = (e) => {
//           if (websocketRef.current?.readyState === WebSocket.OPEN) {
//             websocketRef.current.send(e.data);
//           }
//         };
//         recorder.start(chunkDuration);
//         recorderRef.current = recorder;
        
//         setIsPaused(false);
//         setShowButton(false);
//         setStatusText("Recording resumed...");
//       } catch (err) {
//         console.error("Resume error:", err);
//         setIsPaused(true);
//         setStatusText("Failed to resume recording.");
//       }
//     }
//   };

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       if (waitingForStop) return;
//       try {
//         if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
//           await setupWebSocket();
//         }
//         await startRecording();
//       } catch (err) {
//         setStatusText("Could not connect to WebSocket or access mic. Aborted.");
//       }
//     } else {
//       await stopRecording();
//     }
//   };

//   const updateUI = (recording, waiting) => {
//     if (waiting) {
//       setStatusText("Please wait for processing to complete...");
//     } else if (recording) {
//       setStatusText("Recording...");
//     } else {
//       setStatusText("Click to start transcription");
//     }
//   };


//   const startMicrophoneTest = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       testStreamRef.current = stream;

//       const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//       const source = audioCtx.createMediaStreamSource(stream);
//       const analyser = audioCtx.createAnalyser();
//       analyser.fftSize = 32;
//       const dataArray = new Uint8Array(analyser.frequencyBinCount);
//       source.connect(analyser);

//       const animate = () => {
//         analyser.getByteFrequencyData(dataArray);
//         const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
//         setAudioLevel(avg);
//         testAnimationFrameRef.current = requestAnimationFrame(animate);
//       };

//       animate();
//       testAudioContextRef.current = audioCtx;
//       setIsMicTesting(true);
//     } catch (err) {
//       console.error("Microphone test error:", err);
//     }
//   };

//   const stopMicrophoneTest = () => {
//     if (testAnimationFrameRef.current) {
//       cancelAnimationFrame(testAnimationFrameRef.current);
//     }
//     if (testAudioContextRef.current) {
//       testAudioContextRef.current.close();
//     }
//     if (testStreamRef.current) {
//       testStreamRef.current.getTracks().forEach((track) => track.stop());
//     }
//     setAudioLevel(0);
//     setIsMicTesting(false);
//   };


//   useEffect(() => {
//     startMicrophoneTest();
//     return () => stopMicrophoneTest();
//   }, []);


//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (isRecording) stopRecording();
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       if (isRecording) stopRecording();
//     };
//   }, [isRecording]);

//   return (
//     <div className="flex-1 bg-white min-h-screen">
//       <div className={showMainFolder ? "bg-secondary" : "bg-white"}>
//         <div className="px-8 py-6 border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-900">
//          Encounter
//           </h1>
//         </div>
//         <div className="px-8 border-b border-gray-200">
//           <nav className="flex space-x-8">
//             {tabs.map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center gap-2 ${
//                   activeTab === tab
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 {tab}
//                 {tab === "Transcript" && isRecording && !isPaused && (
//                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse transition-opacity duration-500"></div>
//                 )}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>
      
//       {activeTab === "Transcript" && !showMainFolder && (
//         <div className="flex flex-col items-center justify-center px-8 py-16">
//           <div className="mb-12">
//             <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
//               <Mic className="w-10 h-10 text-white" />
//             </div>
//           </div>
          
//           {!showFolder && (
//             <div className="w-full max-w-md mb-4">
//               <div className="mb-4">
//                 <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
//                   CONTEXT
//                 </span>
//               </div>
//               <button
//                 className="w-full border border-gray-200 rounded-lg py-2 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
//                 onClick={() => setShowFolder(true)}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add context
//               </button>
//             </div>
//           )}

//           {showFolder && (
//             <div className="w-full max-w-md mb-8">
//               <div className="flex justify-between text-center items-center">
//                 <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
//                   CONTEXT
//                 </span>
//                 <Mic className="w-4 h-4 text-gray-400" />
//               </div>
//               <textarea
//                 placeholder="Name, gender, age, medical history..."
//                 value={patientContext}
//                 onChange={(e) => setPatientContext(e.target.value)}
//                 className="w-full border border-gray-200 hover:border-black rounded-lg py-4 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                 rows={3}
//               />
//             </div>
//           )}
          
//           <div className="w-full max-w-md mb-12">
//             <div className="mb-6">
//               <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
//                 SETTINGS
//               </span>
//             </div>

//             <div className="mb-6 flex items-center justify-between">
//               <label className="text-sm font-medium text-gray-700">
//                 Encounter type
//               </label>
//               <div className="relative">
//                 <select
//                   value={encounterType}
//                   onChange={(e) => setEncounterType(e.target.value)}
//                   className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
//                 >
//                   <option value="in-person">In-person</option>
//                   <option value="virtual">Virtual</option>
//                   <option value="phone">Phone</option>
//                 </select>
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 </div>
//               </div>
//             </div>

        

//             <div className="flex justify-between items-center">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Test your microphone
//               </label>
//               <div className="flex items-end space-x-1 h-6">
//                 {renderAudioLevelBars(audioLevel)}
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               toggleRecording();
//               setShowMainFolder(true);
//             }}
//             disabled={waitingForStop}
//             className="bg-primary hover:bg-blue-700 cursor-pointer text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center w-full max-w-md justify-center disabled:opacity-50"
//           >
//             <Mic className="w-4 h-4 mr-2" />
//             {isRecording ? "Stop Recording" : "Start Recording"} 
//           </button>
          
    
//         </div>
//       )}
      
//       {showMainFolder && activeTab === "Transcript" && (
//         <div>
//           <div className="mt-8 w-full max-w-2xl p-8">
        
//             {liveTranscript && !isRecording && (
//               <div className="mb-4 p-3 rounded-md bg-gray-50">
            
//                 <div className="text-sm">
             
//                 </div>
            
//               </div>
//             )}

//              <div dangerouslySetInnerHTML={{ __html: linesHtml }} /> 
            
//             <div ref={linesTranscriptRef} className="hidden"></div>
//             <canvas ref={canvasRef} width={120} height={60} className="hidden" />
//           </div>

//           {showMainFolder && activeTab === "Transcript" && (
//             <div className="fixed bottom-8 right-8 flex gap-4">
//               {!showButton ? (
//                 <>
//                   <button
//                     onClick={pauseRecording}
//                     className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
//                     </svg>
//                     Pause
//                   </button>
//                   <button 
//                     onClick={stopRecording}
//                     className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Generate note
//                   </button>
//                 </>
//               ) : (
//                 <div className="relative">
//                   <div className="flex">
//                     <button
//                       onClick={resumeRecording}
//                       className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-l-md transition-colors"
//                     >
//                       <Mic className="w-4 h-4 mr-2" />
//                       Resume encounter
//                     </button>
//                     <button
//                       onClick={() => setShowDropdown(!showDropdown)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-r-md border-l border-blue-500 transition-colors"
//                     >
//                       <ChevronDown size={16} />
//                     </button>
//                   </div>

//                   {showDropdown && (
//                     <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
//                       <button 
//                         onClick={stopRecording}
//                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         End encounter
//                       </button>
//                       <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                         Save draft
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//           {activeTab === "Note" && <Notestabs />}
      
//     </div>
//   );
// }

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { Mic, Plus, ChevronDown } from "lucide-react";
// import Notestabs from "@/component/notestabs";

// export default function AudioTranscription() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [waitingForStop, setWaitingForStop] = useState(false);
//   const [chunkDuration, setChunkDuration] = useState(1000);
//   const [websocketUrl, setWebsocketUrl] = useState("wss://whisper.craftandcode.in/asr");
//   const [statusText, setStatusText] = useState("Click to start transcription");
//   const [linesHtml, setLinesHtml] = useState("");
//   const [timer, setTimer] = useState("00:00");
  

//   const [activeTab, setActiveTab] = useState("Transcript");
//   const [encounterType, setEncounterType] = useState("in-person");
//   const [showFolder, setShowFolder] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [patientContext, setPatientContext] = useState(""); 
//   const [liveTranscript, setLiveTranscript] = useState(""); 
//   const [audioLevel, setAudioLevel] = useState(0);
//   const [showMainFolder, setShowMainFolder] = useState(false);
//   const [isMicTesting, setIsMicTesting] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [showButton, setShowButton] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [transcriptSegments, setTranscriptSegments] = useState([]);
//   const [transcriptHistory, setTranscriptHistory] = useState("");
//   const [finalLines, setFinalLines] = useState([]);

//   const websocketRef = useRef(null);
//   const recorderRef = useRef(null);
//   const startTimeRef = useRef(null);
//   const timerIntervalRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const microphoneRef = useRef(null);
//   const animationFrameRef = useRef(null);
//   const lastReceivedDataRef = useRef(null);
//   const canvasRef = useRef(null);
//   const linesTranscriptRef = useRef(null);
//   const userClosingRef = useRef(false);
//   const transcriptHistoryRef = useRef("");
  

//   const testStreamRef = useRef(null);
//   const testAudioContextRef = useRef(null);
//   const testAnimationFrameRef = useRef(null);
//   const streamRef = useRef(null);

//   const tabs = ["Transcript", "Note"];

//   useEffect(() => {
//     if (isRecording) {
//       startTimeRef.current = Date.now();
//       timerIntervalRef.current = setInterval(() => {
//         const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
//         const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
//         const seconds = (elapsed % 60).toString().padStart(2, "0");
//         setTimer(`${minutes}:${seconds}`);
//       }, 1000);
//     } else {
//       clearInterval(timerIntervalRef.current);
//       setTimer("00:00");
//     }
//   }, [isRecording]);

//   // Audio level visualization
//   const renderAudioLevelBars = (level) => {
//     const totalBars = 5;
//     const activeBars = Math.round((level / 255) * totalBars);
//     return [...Array(totalBars)].map((_, i) => (
//       <div
//         key={i}
//         className={`w-[3px] rounded-sm transition-all duration-100 ${
//           i < activeBars ? "bg-black h-5" : "bg-gray-300 h-2"
//         }`}
//       />
//     ));
//   };

//   const updateTimer = () => {
//     if (!startTimeRef.current) return;
//     const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
//     const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
//     const seconds = String(elapsed % 60).padStart(2, "0");
//     setTimer(`${minutes}:${seconds}`);
//   };

//   const drawWaveform = () => {
//     const analyser = analyserRef.current;
//     const canvas = canvasRef.current;
//     if (!analyser || !canvas) return;

//     const ctx = canvas.getContext("2d");
//     const width = canvas.width / (window.devicePixelRatio || 1);
//     const height = canvas.height / (window.devicePixelRatio || 1);
//     ctx.clearRect(0, 0, width, height);

//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);
//     analyser.getByteTimeDomainData(dataArray);

//     ctx.lineWidth = 1;
//     ctx.strokeStyle = "black";
//     ctx.beginPath();

//     const sliceWidth = width / bufferLength;
//     let x = 0;

//     for (let i = 0; i < bufferLength; i++) {
//       const v = dataArray[i] / 128.0;
//       const y = v * height / 2;
//       if (i === 0) ctx.moveTo(x, y);
//       else ctx.lineTo(x, y);
//       x += sliceWidth;
//     }
//     ctx.lineTo(width, height / 2);
//     ctx.stroke();

//     animationFrameRef.current = requestAnimationFrame(drawWaveform);
//   };

//   const setupWebSocket = () => {
//     return new Promise((resolve, reject) => {
//       try {
//         websocketRef.current = new WebSocket(websocketUrl);
//       } catch (error) {
//         setStatusText("Invalid WebSocket URL. Please check and try again.");
//         reject(error);
//         return;
//       }

//       websocketRef.current.onopen = () => {
//         setStatusText("Connected to server.");
//         resolve();
//       };

//       websocketRef.current.onclose = () => {
//         if (!userClosingRef.current) {
//           if (waitingForStop) {
//             setStatusText("Processing finalized or connection closed.");
//           } else {
//             setStatusText("Disconnected from the WebSocket server.");
//             if (isRecording) stopRecording();
//           }
//         }
//         setIsRecording(false);
//         setWaitingForStop(false);
//         websocketRef.current = null;
//         updateUI(false, false);
//       };

//       websocketRef.current.onerror = () => {
//         setStatusText("Error connecting to WebSocket.");
//         reject(new Error("Error connecting to WebSocket"));
//       };

//       websocketRef.current.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         console.log("WebSocket message received:", data);

//         if (data.type === "ready_to_stop") {
//           setWaitingForStop(false);
//           setStatusText("Finished processing audio! Ready to record again.");
//           if (websocketRef.current) websocketRef.current.close();
//           return;
//         }

//         lastReceivedDataRef.current = data;
        
//         // Handle final transcript
//         if (data.type === "ready_to_stop" && Array.isArray(data.lines)) {
//           setFinalLines((prev) => [...prev, ...data.lines]);
//           renderTranscript(data);
//           return;
//         }

//         // Handle live transcription
//         if (Array.isArray(data.lines)) {
//           const currentText = data.lines
//             .map((line) => line.text)
//             .filter(Boolean)
//             .join(" ");

//           if (currentText.trim()) {
//             const combinedTranscript = transcriptHistoryRef.current
//               ? `${transcriptHistoryRef.current} ${currentText}`
//               : currentText;

//             setLiveTranscript(combinedTranscript);
//             setTranscript(combinedTranscript);
//             setTranscriptHistory(combinedTranscript);
//             transcriptHistoryRef.current = combinedTranscript;

//             setPatientContext((prev) => {
//               const newText = currentText.trim();
//               if (newText && !prev.includes(newText)) {
//                 const updatedContext = prev ? `${prev}\n\n${newText}` : newText;
//                 return updatedContext;
//               }
//               return prev;
//             });
//           }
//         }

//         const html = renderLines(data);
//         setLinesHtml(html);
//       };
//     });
//   };

//   const renderLines = (data) => {
//     const lines = data.lines || [];
//     const buffer_diarization = data.buffer_diarization || "";
//     const buffer_transcription = data.buffer_transcription || "";

//     return lines.map((item, idx) => {
//       let speakerLabel = "";
//       if (item.speaker === -2) {
//         speakerLabel = `Silence`;
//       } else if (item.speaker === -1) {
//         speakerLabel = `Speaker 1`;
//       } else if (item.speaker > 0) {
//         speakerLabel = `Speaker ${item.speaker}`;
//       }

//       let text = item.text || "";
//       if (idx === lines.length - 1) {
//         text += buffer_diarization + buffer_transcription;
//       }

//       return `<p>${speakerLabel}<br/>${text}</p>`;
//     }).join("");
//   };

//   const renderTranscript = (data) => {
//     const linesDiv = linesTranscriptRef.current;
//     if (!linesDiv) return;

//     if (data?.lines?.length) {
//       linesDiv.innerHTML = data.lines
//         .map((line) => `<p><strong>Speaker ${line.speaker ?? "?"}:</strong> ${line.text}</p>`) 
//         .join("");
//     } else {
//       linesDiv.innerHTML = "<p><em>No transcript received.</em></p>";
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
//       analyserRef.current = audioContextRef.current.createAnalyser();
//       const microphone = audioContextRef.current.createMediaStreamSource(stream);
//       microphone.connect(analyserRef.current);
//       microphoneRef.current = microphone;
//       streamRef.current = stream;

//       recorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
//       recorderRef.current.ondataavailable = (e) => {
//         if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//           websocketRef.current.send(e.data);
//         }
//       };
//       recorderRef.current.start(chunkDuration);
      
//       startTimeRef.current = Date.now();
//       timerIntervalRef.current = setInterval(updateTimer, 1000);
//       drawWaveform();
//       setIsRecording(true);
//       updateUI(true, false);
//     } catch (err) {
//       console.error("Recording error:", err);
//       setStatusText("Could not access microphone.");
//     }
//   };

//   const stopRecording = async () => {
//     console.log("Stop triggered. isRecording:", isRecording);
//     setIsRecording(false);
//     setIsPaused(false);
//     userClosingRef.current = true;
//     setWaitingForStop(true);
//     setStatusText("Processing final audio...");

//     if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//       const emptyBlob = new Blob([], { type: 'audio/webm' });
//       websocketRef.current.send(emptyBlob);
//     }

//     if (recorderRef.current) {
//       recorderRef.current.stop();
//       recorderRef.current = null;
//     }
//     if (microphoneRef.current) {
//       microphoneRef.current.disconnect();
//       microphoneRef.current = null;
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     if (audioContextRef.current && audioContextRef.current.state !== "closed") {
//       await audioContextRef.current.close();
//       audioContextRef.current = null;
//     }

//     clearInterval(timerIntervalRef.current);
//     timerIntervalRef.current = null;
//     cancelAnimationFrame(animationFrameRef.current);
//     animationFrameRef.current = null;

//     setTimer("00:00");
//     setShowButton(false);
//     setAudioLevel(0);
//     updateUI(false, true);
//   };

//   const pauseRecording = () => {
//     setIsPaused(true);
//     setShowButton(true);
//     if (recorderRef.current && recorderRef.current.state === "recording") {
//       recorderRef.current.pause();
//     }
//   };

//   const resumeRecording = async () => {
//     if (isPaused && isRecording) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: { 
//             sampleRate: 16000, 
//             channelCount: 1, 
//             echoCancellation: true, 
//             noiseSuppression: true 
//           }
//         });
//         streamRef.current = stream;

//         audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ 
//           sampleRate: 16000 
//         });
        
//         const analyser = audioContextRef.current.createAnalyser();
//         const mic = audioContextRef.current.createMediaStreamSource(stream);
//         mic.connect(analyser);
//         analyser.fftSize = 256;
        
//         analyserRef.current = analyser;
//         microphoneRef.current = mic;
        
//         const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
//         recorder.ondataavailable = (e) => {
//           if (websocketRef.current?.readyState === WebSocket.OPEN) {
//             websocketRef.current.send(e.data);
//           }
//         };
//         recorder.start(chunkDuration);
//         recorderRef.current = recorder;
        
//         setIsPaused(false);
//         setShowButton(false);
//         setStatusText("Recording resumed...");
//       } catch (err) {
//         console.error("Resume error:", err);
//         setIsPaused(true);
//         setStatusText("Failed to resume recording.");
//       }
//     }
//   };

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       if (waitingForStop) return;
//       try {
//         if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
//           await setupWebSocket();
//         }
//         await startRecording();
//       } catch (err) {
//         setStatusText("Could not connect to WebSocket or access mic. Aborted.");
//       }
//     } else {
//       await stopRecording();
//     }
//   };

//   const updateUI = (recording, waiting) => {
//     if (waiting) {
//       setStatusText("Please wait for processing to complete...");
//     } else if (recording) {
//       setStatusText("Recording...");
//     } else {
//       setStatusText("Click to start transcription");
//     }
//   };


//   const startMicrophoneTest = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       testStreamRef.current = stream;

//       const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//       const source = audioCtx.createMediaStreamSource(stream);
//       const analyser = audioCtx.createAnalyser();
//       analyser.fftSize = 32;
//       const dataArray = new Uint8Array(analyser.frequencyBinCount);
//       source.connect(analyser);

//       const animate = () => {
//         analyser.getByteFrequencyData(dataArray);
//         const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
//         setAudioLevel(avg);
//         testAnimationFrameRef.current = requestAnimationFrame(animate);
//       };

//       animate();
//       testAudioContextRef.current = audioCtx;
//       setIsMicTesting(true);
//     } catch (err) {
//       console.error("Microphone test error:", err);
//     }
//   };

//   const stopMicrophoneTest = () => {
//     if (testAnimationFrameRef.current) {
//       cancelAnimationFrame(testAnimationFrameRef.current);
//     }
//     if (testAudioContextRef.current) {
//       testAudioContextRef.current.close();
//     }
//     if (testStreamRef.current) {
//       testStreamRef.current.getTracks().forEach((track) => track.stop());
//     }
//     setAudioLevel(0);
//     setIsMicTesting(false);
//   };


//   useEffect(() => {
//     startMicrophoneTest();
//     return () => stopMicrophoneTest();
//   }, []);


//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (isRecording) stopRecording();
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       if (isRecording) stopRecording();
//     };
//   }, [isRecording]);

//   return (
//     <div className="flex-1 bg-white min-h-screen">
//       <div className={showMainFolder ? "bg-secondary" : "bg-white"}>
//         <div className="px-8 py-6 border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-900">
//          Encounter
//           </h1>
//         </div>
//         <div className="px-8 border-b border-gray-200">
//           <nav className="flex space-x-8">
//             {tabs.map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center gap-2 ${
//                   activeTab === tab
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 {tab}
//                 {tab === "Transcript" && isRecording && !isPaused && (
//                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse transition-opacity duration-500"></div>
//                 )}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>
      
//       {activeTab === "Transcript" && !showMainFolder && (
//         <div className="flex flex-col items-center justify-center px-8 py-16">
//           <div className="mb-12">
//             <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
//               <Mic className="w-10 h-10 text-white" />
//             </div>
//           </div>
          
//           {!showFolder && (
//             <div className="w-full max-w-md mb-4">
//               <div className="mb-4">
//                 <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
//                   CONTEXT
//                 </span>
//               </div>
//               <button
//                 className="w-full border border-gray-200 rounded-lg py-2 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
//                 onClick={() => setShowFolder(true)}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add context
//               </button>
//             </div>
//           )}

//           {showFolder && (
//             <div className="w-full max-w-md mb-8">
//               <div className="flex justify-between text-center items-center">
//                 <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
//                   CONTEXT
//                 </span>
//                 <Mic className="w-4 h-4 text-gray-400" />
//               </div>
//               <textarea
//                 placeholder="Name, gender, age, medical history..."
//                 value={patientContext}
//                 onChange={(e) => setPatientContext(e.target.value)}
//                 className="w-full border border-gray-200 hover:border-black rounded-lg py-4 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                 rows={3}
//               />
//             </div>
//           )}
          
//           <div className="w-full max-w-md mb-12">
//             <div className="mb-6">
//               <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
//                 SETTINGS
//               </span>
//             </div>

//             <div className="mb-6 flex items-center justify-between">
//               <label className="text-sm font-medium text-gray-700">
//                 Encounter type
//               </label>
//               <div className="relative">
//                 <select
//                   value={encounterType}
//                   onChange={(e) => setEncounterType(e.target.value)}
//                   className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
//                 >
//                   <option value="in-person">In-person</option>
//                   <option value="virtual">Virtual</option>
//                   <option value="phone">Phone</option>
//                 </select>
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 </div>
//               </div>
//             </div>

        

//             <div className="flex justify-between items-center">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Test your microphone
//               </label>
//               <div className="flex items-end space-x-1 h-6">
//                 {renderAudioLevelBars(audioLevel)}
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               toggleRecording();
//               setShowMainFolder(true);
//             }}
//             disabled={waitingForStop}
//             className="bg-primary hover:bg-blue-700 cursor-pointer text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center w-full max-w-md justify-center disabled:opacity-50"
//           >
//             <Mic className="w-4 h-4 mr-2" />
//             {isRecording ? "Stop Recording" : "Start Recording"} 
//           </button>
          
    
//         </div>
//       )}
      
//       {showMainFolder && activeTab === "Transcript" && (
//         <div>
//           <div className="mt-8 w-full max-w-2xl p-8">
        
//             {liveTranscript && !isRecording && (
//               <div className="mb-4 p-3 rounded-md bg-gray-50">
//                 <label className="text-xs font-semibold text-gray-600 mb-1 block">
//                   Final Transcript
//                 </label>
//                 <div className="text-sm">
//                   {liveTranscript}
//                 </div>
//                 <button
//                   onClick={() => {
//                     const newText = liveTranscript.trim();
//                     if (newText) {
//                       setPatientContext(prev => {
//                         return prev ? `${prev}\n\n${newText}` : newText;
//                       });
//                     }
//                   }}
//                   className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
//                 >
//                   Add to patient context
//                 </button>
//               </div>
//             )}

//             <div dangerouslySetInnerHTML={{ __html: linesHtml }} />
            
//             <div ref={linesTranscriptRef} className="hidden"></div>
//             <canvas ref={canvasRef} width={120} height={60} className="hidden" />
//           </div>

//           {showMainFolder && activeTab === "Transcript" && (
//             <div className="fixed bottom-8 right-8 flex gap-4">
//               {!showButton ? (
//                 <>
//                   <button
//                     onClick={pauseRecording}
//                     className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
//                     </svg>
//                     Pause
//                   </button>

//                   <button 
//                     onClick={stopRecording}
//                     className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Generate note
//                   </button>
//                 </>
//               ) : (
//                 <div className="relative">
//                   <div className="flex">
//                     <button
//                       onClick={resumeRecording}
//                       className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-l-md transition-colors"
//                     >
//                       <Mic className="w-4 h-4 mr-2" />
//                       Resume encounter
//                     </button>
//                     <button
//                       onClick={() => setShowDropdown(!showDropdown)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-r-md border-l border-blue-500 transition-colors"
//                     >
//                       <ChevronDown size={16} />
//                     </button>
//                   </div>

//                   {showDropdown && (
//                     <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
//                       <button 
//                         onClick={stopRecording}
//                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         End encounter
//                       </button>
//                       <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                         Save draft
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
      
   
//           {activeTab === "Note" && <Notestabs />}
      
//     </div>
//   );
// }
