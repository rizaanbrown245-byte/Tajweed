/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Audio Capture & Real-time Acoustic Analysis Service
 */

export interface AudioAnalysisSnapshot {
  waveform: number[];       // Time-domain amplitude values (-1 to 1 or 0 to 255)
  frequencies: number[];    // Frequency spectrum values (0 to 255)
  averageVolume: number;    // Root mean square volume (0 to 1)
  isSilence: boolean;       // True if below ambient noise threshold
  pitchEstimateHz?: number; // Fundamental frequency estimate
}

export class AudioService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private audioChunks: Blob[] = [];
  private animationFrameId: number | null = null;

  private onSnapshotCallback?: (snapshot: AudioAnalysisSnapshot) => void;
  private recordedBlob: Blob | null = null;
  private recordingStartTime: number = 0;

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio capture is not supported in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Keep noise suppression subtle to avoid clipping subtle Tajweed sounds (e.g. Hams, Ghunnah)
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // Stop test tracks immediately
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.warn('Microphone permission request failed or denied:', err);
      return false;
    }
  }

  async startRecording(onSnapshot?: (snapshot: AudioAnalysisSnapshot) => void): Promise<void> {
    this.stopRecording(); // Clean up any active session
    this.audioChunks = [];
    this.recordedBlob = null;
    this.onSnapshotCallback = onSnapshot;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true
        }
      });

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);

      // Determine supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      this.mediaRecorder = selectedMime
        ? new MediaRecorder(this.mediaStream, { mimeType: selectedMime })
        : new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.recordingStartTime = Date.now();
      this.mediaRecorder.start(100); // 100ms slice
      this.startAnalysisLoop();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  private startAnalysisLoop(): void {
    if (!this.analyser) return;

    const timeBuffer = new Uint8Array(this.analyser.fftSize);
    const freqBuffer = new Uint8Array(this.analyser.frequencyBinCount);

    const tick = () => {
      if (!this.analyser) return;

      this.analyser.getByteTimeDomainData(timeBuffer);
      this.analyser.getByteFrequencyData(freqBuffer);

      let sumSquare = 0;
      const normalizedWaveform: number[] = [];

      for (let i = 0; i < timeBuffer.length; i += 4) { // Downsample for display performance
        const val = (timeBuffer[i] - 128) / 128; // -1 to 1
        normalizedWaveform.push(val);
        sumSquare += val * val;
      }

      const rms = Math.sqrt(sumSquare / (timeBuffer.length / 4));
      const isSilence = rms < 0.02;

      const normalizedFreqs: number[] = [];
      for (let i = 0; i < freqBuffer.length; i += 2) {
        normalizedFreqs.push(freqBuffer[i]);
      }

      if (this.onSnapshotCallback) {
        this.onSnapshotCallback({
          waveform: normalizedWaveform,
          frequencies: normalizedFreqs,
          averageVolume: rms,
          isSilence
        });
      }

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  async stopRecording(): Promise<{ blob: Blob; durationSeconds: number } | null> {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const durationSeconds = (Date.now() - this.recordingStartTime) / 1000;

    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        resolve(this.recordedBlob ? { blob: this.recordedBlob, durationSeconds } : null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        this.recordedBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve({ blob: this.recordedBlob, durationSeconds });
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
  }
}

export const audioService = new AudioService();
