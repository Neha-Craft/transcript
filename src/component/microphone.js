import { useState, useRef, useEffect } from 'react';
import { Mic, ChevronDown, Check } from 'lucide-react';

export default function MicrophoneRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMicrophone, setSelectedMicrophone] = useState('Internal Microphone (Built-in)');
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [devices, setDevices] = useState([]);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request microphone permission first to get proper device labels
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (permissionError) {
          console.log("Microphone permission not granted yet");
        }

        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(mediaDevices);
        
        // Filter audio inputs and remove duplicates
        const audioInputs = mediaDevices.filter(d => d.kind === 'audioinput');
        
        // Remove duplicates by deviceId and filter out devices without proper labels
        const uniqueDevices = audioInputs.filter((device, index, self) => 
          index === self.findIndex(d => d.deviceId === device.deviceId) && 
          device.deviceId !== '' &&
          device.label !== '' &&
          !device.label.toLowerCase().includes('default')
        );
        
        setAvailableMicrophones(uniqueDevices);
        
        // Set default selection to first available microphone if none selected
        if (uniqueDevices.length > 0 && !selectedDeviceId) {
          const defaultMic = uniqueDevices[0];
          const deviceName = defaultMic.label || 'Internal Microphone (Built-in)';
          setSelectedMicrophone(deviceName);
          setSelectedDeviceId(defaultMic.deviceId);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    getDevices();

    navigator.mediaDevices.ondevicechange = () => {
      getDevices();
    };

    return () => {
      navigator.mediaDevices.ondevicechange = null;
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      const startMic = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
          });
          mediaStreamRef.current = stream;

          const track = stream.getAudioTracks()[0];
          const settings = track.getSettings();
          const matchedDevice = devices.find(d => d.deviceId === settings.deviceId);

          if (matchedDevice && matchedDevice.label) {
            setSelectedMicrophone(matchedDevice.label);
          }

          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          source.connect(analyser);
          analyser.fftSize = 256;
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const getVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(avg);
            if (isRecording) requestAnimationFrame(getVolume);
          };
          getVolume();
        } catch (err) {
          console.error("Microphone access error:", err);
        }
      };

      startMic();
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording, selectedDeviceId, devices]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMicrophoneSelect = (device) => {
    setSelectedMicrophone(device.label || `Microphone ${device.deviceId.substr(0, 5)}`);
    setSelectedDeviceId(device.deviceId);
    setIsDropdownOpen(false);
  };

  const generateAudioBars = () => {
    const bars = [];
    const barCount = 4;
    const maxHeight = (audioLevel / 255) * 100;

    for (let i = 0; i < barCount; i++) {
      const height = Math.max(10, maxHeight - (i * 10));
      bars.push(
        <div
          key={i}
          className="w-1 bg-green-500 rounded-sm transition-all duration-75"
          style={{ height: `${height}%` }}
        />
      );
    }
    return bars;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-12">
        <div className={`w-4 h-4 border-2 ${
          isRecording ? 'border-red-500' : 'border-gray-300'
        } rounded-full flex items-center justify-center`}>
          <div className={`w-3 h-3 ${
            isRecording ? 'bg-red-500' : 'bg-gray-400'
          } rounded-full ${isRecording ? 'animate-pulse' : ''}`}></div>
        </div>

        <span className="text-[15px] font-light text-gray-700">
          {formatTime(recordingTime)}
        </span>

        <Mic className={`w-4 h-4 ${isRecording ? 'text-green-500' : 'text-gray-400'}`} />

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <div className="flex items-center gap-1 h-6">
              {isRecording ? generateAudioBars() : (
                <>
                  <div className="w-1 h-4 bg-gray-400 rounded-sm"></div>
                  <div className="w-1 h-6 bg-gray-400 rounded-sm"></div>
                  <div className="w-1 h-3 bg-gray-400 rounded-sm"></div>
                  <div className="w-1 h-5 bg-gray-400 rounded-sm"></div>
                </>
              )}
            </div>
            <span className="text-sm">
              {selectedMicrophone.length > 20
                ? selectedMicrophone.substring(0, 20) + '...'
                : selectedMicrophone}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-64 z-10">
              {availableMicrophones.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => handleMicrophoneSelect(device)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                >
                  <span>{device.label || 'Internal Microphone (Built-in)'}</span>
                  {selectedDeviceId === device.deviceId && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording active</span>
          </div>
        </div>
      )}
    </div>
  );
}