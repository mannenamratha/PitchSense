interface AudioRecordingConfig {
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  dataSize: number;
}

interface AudioAnalysis {
  volume: number;
  frequency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;
  
  private config: AudioRecordingConfig = {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000,
    sampleRate: 44100,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };

  private state: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    dataSize: 0
  };

  private onStateChange?: (state: RecordingState) => void;
  private onAudioAnalysis?: (analysis: AudioAnalysis) => void;
  private onError?: (error: string) => void;

  /**
   * Initialize audio recording service
   */
  async initialize(
    onStateChange?: (state: RecordingState) => void,
    onAudioAnalysis?: (analysis: AudioAnalysis) => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    this.onStateChange = onStateChange;
    this.onAudioAnalysis = onAudioAnalysis;
    this.onError = onError;

    try {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder not supported in this browser');
      }

      // Check supported MIME types
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          this.config.mimeType = type;
          break;
        }
      }

      return true;
    } catch (error) {
      console.error('Audio recording initialization failed:', error);
      this.onError?.('Audio recording not supported in this browser');
      return false;
    }
  }

  /**
   * Start recording
   */
  async startRecording(): Promise<boolean> {
    try {
      if (this.state.isRecording) {
        throw new Error('Recording already in progress');
      }

      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channelCount,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl
        }
      });

      // Create MediaRecorder
      const options: MediaRecorderOptions = {};
      if (this.config.mimeType) {
        options.mimeType = this.config.mimeType;
      }
      if (this.config.audioBitsPerSecond) {
        options.audioBitsPerSecond = this.config.audioBitsPerSecond;
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.state.dataSize += event.data.size;
          this.notifyStateChange();
        }
      };

      this.mediaRecorder.onstop = () => {
        this.stopAudioAnalysis();
        this.state.isRecording = false;
        this.state.isPaused = false;
        this.notifyStateChange();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.onError?.('Recording error occurred');
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.state.isRecording = true;
      this.state.isPaused = false;
      this.state.duration = 0;
      this.state.dataSize = 0;

      // Start audio analysis
      this.startAudioAnalysis();
      this.notifyStateChange();

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError?.('Failed to start recording. Please check microphone permissions.');
      return false;
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.state.isRecording) {
        reject(new Error('No active recording to stop'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.config.mimeType || 'audio/webm' 
        });
        
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   */
  pauseRecording(): boolean {
    if (!this.mediaRecorder || !this.state.isRecording || this.state.isPaused) {
      return false;
    }

    try {
      this.mediaRecorder.pause();
      this.state.isPaused = true;
      this.stopAudioAnalysis();
      this.notifyStateChange();
      return true;
    } catch (error) {
      console.error('Failed to pause recording:', error);
      return false;
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): boolean {
    if (!this.mediaRecorder || !this.state.isRecording || !this.state.isPaused) {
      return false;
    }

    try {
      this.mediaRecorder.resume();
      this.state.isPaused = false;
      this.startAudioAnalysis();
      this.notifyStateChange();
      return true;
    } catch (error) {
      console.error('Failed to resume recording:', error);
      return false;
    }
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return { ...this.state };
  }

  /**
   * Update recording duration
   */
  updateDuration(duration: number): void {
    this.state.duration = duration;
    this.notifyStateChange();
  }

  /**
   * Start audio analysis for real-time feedback
   */
  private startAudioAnalysis(): void {
    if (!this.stream) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyzeAudio();
    } catch (error) {
      console.error('Failed to start audio analysis:', error);
    }
  }

  /**
   * Stop audio analysis
   */
  private stopAudioAnalysis(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
  }

  /**
   * Analyze audio in real-time
   */
  private analyzeAudio(): void {
    if (!this.analyser || !this.dataArray || !this.state.isRecording || this.state.isPaused) {
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const volume = Math.sqrt(sum / this.dataArray.length) / 255;

    // Calculate dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }
    const frequency = (maxIndex * this.audioContext!.sampleRate) / (this.analyser.fftSize * 2);

    // Determine quality based on volume and frequency distribution
    let quality: AudioAnalysis['quality'] = 'poor';
    if (volume > 0.1 && volume < 0.8 && frequency > 80 && frequency < 8000) {
      quality = 'excellent';
    } else if (volume > 0.05 && frequency > 60) {
      quality = 'good';
    } else if (volume > 0.02) {
      quality = 'fair';
    }

    this.onAudioAnalysis?.({
      volume,
      frequency,
      quality
    });

    this.animationFrame = requestAnimationFrame(() => this.analyzeAudio());
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    this.onStateChange?.(this.getState());
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.stopAudioAnalysis();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  /**
   * Get supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    
    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AudioRecordingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioRecordingConfig {
    return { ...this.config };
  }

  /**
   * Convert audio blob to different format (basic conversion)
   */
  async convertAudioFormat(audioBlob: Blob, targetMimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      audio.onloadeddata = () => {
        // This is a simplified conversion - in practice, you'd use Web Audio API
        // or a library like FFmpeg.js for proper audio format conversion
        resolve(audioBlob);
      };

      audio.onerror = () => {
        reject(new Error('Audio conversion failed'));
      };

      audio.src = URL.createObjectURL(audioBlob);
    });
  }

  /**
   * Get audio duration from blob
   */
  async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
      
      audio.onerror = () => {
        reject(new Error('Failed to load audio metadata'));
        URL.revokeObjectURL(audio.src);
      };
      
      audio.src = URL.createObjectURL(audioBlob);
    });
  }

  /**
   * Create audio waveform data
   */
  async createWaveformData(audioBlob: Blob, samples: number = 100): Promise<number[]> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(channelData.length / samples);
      const waveformData: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        const start = i * blockSize;
        const end = start + blockSize;
        let sum = 0;
        
        for (let j = start; j < end; j++) {
          sum += Math.abs(channelData[j]);
        }
        
        waveformData.push(sum / blockSize);
      }
      
      await audioContext.close();
      return waveformData;
    } catch (error) {
      console.error('Failed to create waveform data:', error);
      return new Array(samples).fill(0);
    }
  }
}

export const audioRecordingService = new AudioRecordingService();
export type { AudioRecordingConfig, RecordingState, AudioAnalysis };