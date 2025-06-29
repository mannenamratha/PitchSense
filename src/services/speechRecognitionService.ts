interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: string[];
}

interface SpeechRecognitionError {
  error: string;
  message: string;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private config: SpeechRecognitionConfig = {
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3
  };

  constructor() {
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize speech recognition
   */
  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      this.configureSpeechRecognition();
    } else {
      console.warn('Speech recognition not supported in this browser');
      this.isSupported = false;
    }
  }

  /**
   * Configure speech recognition settings
   */
  private configureSpeechRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.isListening;
  }

  /**
   * Start speech recognition
   */
  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: SpeechRecognitionError) => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.recognition) {
        const error = { error: 'not_supported', message: 'Speech recognition not supported' };
        onError?.(error);
        reject(error);
        return;
      }

      if (this.isListening) {
        const error = { error: 'already_listening', message: 'Speech recognition already active' };
        onError?.(error);
        reject(error);
        return;
      }

      // Configure event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const alternatives = [];
          
          for (let j = 0; j < result.length; j++) {
            alternatives.push(result[j].transcript);
          }

          onResult({
            transcript: result[0].transcript,
            confidence: result[0].confidence || 0,
            isFinal: result.isFinal,
            alternatives: alternatives.slice(1) // Exclude the main transcript
          });
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        const error = {
          error: event.error,
          message: this.getErrorMessage(event.error)
        };
        onError?.(error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd?.();
      };

      // Start recognition
      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        const speechError = {
          error: 'start_failed',
          message: 'Failed to start speech recognition'
        };
        onError?.(speechError);
        reject(speechError);
      }
    });
  }

  /**
   * Stop speech recognition
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort speech recognition
   */
  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SpeechRecognitionConfig>): void {
    this.config = { ...this.config, ...config };
    this.configureSpeechRecognition();
  }

  /**
   * Set language
   */
  setLanguage(language: string): void {
    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * Get current language
   */
  getLanguage(): string {
    return this.config.language;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{ code: string; name: string; flag: string }> {
    return [
      { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
      { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
      { code: 'en-AU', name: 'English (Australia)', flag: '🇦🇺' },
      { code: 'en-CA', name: 'English (Canada)', flag: '🇨🇦' },
      { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
      { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
      { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
      { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
      { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
      { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
      { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
      { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
      { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
      { code: 'ur-IN', name: 'Urdu', flag: '🇮🇳' },
      { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
      { code: 'fr-CA', name: 'French (Canada)', flag: '🇨🇦' },
      { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
      { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
      { code: 'es-AR', name: 'Spanish (Argentina)', flag: '🇦🇷' },
      { code: 'de-DE', name: 'German', flag: '🇩🇪' },
      { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
      { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
      { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
      { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
      { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
      { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
      { code: 'th-TH', name: 'Thai', flag: '🇹🇭' },
      { code: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
      { code: 'id-ID', name: 'Indonesian', flag: '🇮🇩' },
      { code: 'ms-MY', name: 'Malay', flag: '🇲🇾' },
      { code: 'fil-PH', name: 'Filipino', flag: '🇵🇭' },
      { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
      { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
      { code: 'da-DK', name: 'Danish', flag: '🇩🇰' },
      { code: 'no-NO', name: 'Norwegian', flag: '🇳🇴' },
      { code: 'fi-FI', name: 'Finnish', flag: '🇫🇮' },
      { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
      { code: 'cs-CZ', name: 'Czech', flag: '🇨🇿' },
      { code: 'sk-SK', name: 'Slovak', flag: '🇸🇰' },
      { code: 'hu-HU', name: 'Hungarian', flag: '🇭🇺' },
      { code: 'ro-RO', name: 'Romanian', flag: '🇷🇴' },
      { code: 'bg-BG', name: 'Bulgarian', flag: '🇧🇬' },
      { code: 'hr-HR', name: 'Croatian', flag: '🇭🇷' },
      { code: 'sr-RS', name: 'Serbian', flag: '🇷🇸' },
      { code: 'sl-SI', name: 'Slovenian', flag: '🇸🇮' },
      { code: 'et-EE', name: 'Estonian', flag: '🇪🇪' },
      { code: 'lv-LV', name: 'Latvian', flag: '🇱🇻' },
      { code: 'lt-LT', name: 'Lithuanian', flag: '🇱🇹' },
      { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
      { code: 'el-GR', name: 'Greek', flag: '🇬🇷' },
      { code: 'he-IL', name: 'Hebrew', flag: '🇮🇱' },
      { code: 'fa-IR', name: 'Persian', flag: '🇮🇷' },
      { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪' },
      { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' }
    ];
  }

  /**
   * Get error message for speech recognition errors
   */
  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech was detected. Please try speaking again.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone permissions.';
      case 'network':
        return 'Network error occurred. Please check your internet connection.';
      case 'language-not-supported':
        return 'The selected language is not supported.';
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.';
      case 'bad-grammar':
        return 'Grammar error in speech recognition.';
      case 'aborted':
        return 'Speech recognition was aborted.';
      default:
        return `Speech recognition error: ${error}`;
    }
  }

  /**
   * Test microphone access
   */
  async testMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone test failed:', error);
      return false;
    }
  }

  /**
   * Get microphone permissions status
   */
  async getMicrophonePermission(): Promise<PermissionState> {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permission.state;
    } catch (error) {
      console.error('Permission query failed:', error);
      return 'prompt';
    }
  }

  /**
   * Request microphone permissions
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission request failed:', error);
      return false;
    }
  }

  /**
   * Get available audio input devices
   */
  async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.abort();
    this.recognition = null;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
export type { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionError };