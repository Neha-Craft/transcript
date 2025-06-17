class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.sampleCount = 0;
  }

  process(inputs) {
    try {
      const input = inputs[0];
      if (!input || input.length === 0) return true;

      const channelData = input[0];
      if (!channelData) return true;

      // Calculate RMS for audio level
      let sum = 0;
      for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sum / channelData.length);

      // Buffer and convert audio
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex] = channelData[i];
        this.bufferIndex++;
        this.sampleCount++;

        if (this.bufferIndex >= this.bufferSize) {
          const pcm = new Int16Array(this.bufferSize);
          for (let j = 0; j < this.bufferSize; j++) {
            const s = Math.max(-1, Math.min(1, this.buffer[j]));
            pcm[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          this.port.postMessage({
            audio: pcm,
            rms: rms,
            count: this.sampleCount
          });

          this.bufferIndex = 0;
        }
      }
      return true;
    } catch (e) {
      console.error("Processor error:", e);
      return false;
    }
  }
}

registerProcessor("audio-processor", AudioProcessor);

