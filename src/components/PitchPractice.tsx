import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, Play, Pause, Upload, Download, RefreshCw, Globe, Volume2, FileText, BarChart3, Lightbulb, Zap, Clock, Users, Target, Brain, MessageSquare, Video, ChevronDown, ChevronUp, Copy, Share2, Save, Trash2, Settings, HelpCircle, Sparkles, Languages, AudioWaveform as Waveform, Activity, TrendingUp } from 'lucide-react';
import AIFeedbackDisplay from './AIFeedbackDisplay';
import PDFExport from './PDFExport';
import VideoGuideModal from './VideoGuideModal';
import { aiAnalysisService, PitchAnalysis } from '../services/aiAnalysisService';
import { voiceAnalysisAPI, VoiceAnalysisRequest } from '../services/voiceAnalysisAPI';
import { speechRecognitionService } from '../services/speechRecognitionService';
import { audioRecordingService } from '../services/audioRecordingService';
import { translationService } from '../services/translationService';
import { authService } from '../services/authService';
import { pitchHistoryService } from '../services/pitchHistoryService';

interface PitchPracticeProps {
  onBack: () => void;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

interface TranscriptState {
  text: string;
  isTranscribing: boolean;
  language: string;
  confidence: number;
}

interface AnalysisState {
  isAnalyzing: boolean;
  result: PitchAnalysis | null;
  voiceAnalysis: any | null;
  error: string | null;
}

interface AudioQualityState {
  volume: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  snr: number;
}

const PitchPractice: React.FC<PitchPracticeProps> = ({ onBack }) => {
  // Recording states
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null
  });

  // Transcript states
  const [transcript, setTranscript] = useState<TranscriptState>({
    text: '',
    isTranscribing: false,
    language: 'en-US',
    confidence: 0
  });

  // Analysis states
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    voiceAnalysis: null,
    error: null
  });

  // Audio quality monitoring
  const [audioQuality, setAudioQuality] = useState<AudioQualityState>({
    volume: 0,
    quality: 'poor',
    snr: 0
  });

  // UI states
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'transcript' | 'analysis'>('record');
  const [showVideoGuide, setShowVideoGuide] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [pitchTitle, setPitchTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      // Initialize audio recording service
      await audioRecordingService.initialize(
        (state) => {
          setRecording(prev => ({
            ...prev,
            isRecording: state.isRecording,
            isPaused: state.isPaused,
            duration: state.duration
          }));
        },
        (audioAnalysis) => {
          setAudioQuality({
            volume: audioAnalysis.volume,
            quality: audioAnalysis.quality,
            snr: 20 + audioAnalysis.volume * 20 // Estimate SNR
          });
        },
        (error) => {
          console.error('Audio recording error:', error);
          setAnalysis(prev => ({ ...prev, error }));
        }
      );

      // Set language for speech recognition
      speechRecognitionService.setLanguage(selectedLanguage);
    };

    initializeServices();
  }, [selectedLanguage]);

  // Timer for recording duration
  useEffect(() => {
    if (recording.isRecording && !recording.isPaused) {
      timerRef.current = setInterval(() => {
        audioRecordingService.updateDuration(recording.duration + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording.isRecording, recording.isPaused, recording.duration]);

  // Start recording with advanced features
  const startRecording = async () => {
    try {
      setAnalysis({ isAnalyzing: false, result: null, voiceAnalysis: null, error: null });
      setTranscript({ text: '', isTranscribing: false, language: selectedLanguage, confidence: 0 });

      // Start audio recording
      const recordingStarted = await audioRecordingService.startRecording();
      if (!recordingStarted) {
        throw new Error('Failed to start audio recording');
      }

      // Start speech recognition
      if (speechRecognitionService.isSupported()) {
        await speechRecognitionService.start(
          (result) => {
            if (result.isFinal) {
              setTranscript(prev => ({
                ...prev,
                text: prev.text + ' ' + result.transcript,
                confidence: result.confidence
              }));
            }
          },
          (error) => {
            console.error('Speech recognition error:', error);
            setTranscript(prev => ({ ...prev, isTranscribing: false }));
          },
          () => {
            setTranscript(prev => ({ ...prev, isTranscribing: false }));
          }
        );
        setTranscript(prev => ({ ...prev, isTranscribing: true }));
      }

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please check permissions and try again.');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      speechRecognitionService.stop();
      const audioBlob = await audioRecordingService.stopRecording();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setRecording(prev => ({
        ...prev,
        audioBlob,
        audioUrl,
        isRecording: false,
        isPaused: false
      }));

      // Auto-switch to transcript tab
      setActiveTab('transcript');

    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Error stopping recording. Please try again.');
    }
  };

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (recording.isPaused) {
      audioRecordingService.resumeRecording();
      if (speechRecognitionService.isSupported()) {
        speechRecognitionService.start(
          (result) => {
            if (result.isFinal) {
              setTranscript(prev => ({
                ...prev,
                text: prev.text + ' ' + result.transcript,
                confidence: result.confidence
              }));
            }
          }
        );
      }
    } else {
      audioRecordingService.pauseRecording();
      speechRecognitionService.stop();
    }
  };

  // Play recorded audio
  const playRecording = () => {
    if (recording.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(recording.audioUrl);
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
      };

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setPlaybackTime(audioRef.current.currentTime);
        }
      };
    }
  };

  // Pause playback
  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const audioUrl = URL.createObjectURL(file);
      
      // Get audio duration
      const duration = await audioRecordingService.getAudioDuration(file);
      
      setRecording(prev => ({
        ...prev,
        audioBlob: file,
        audioUrl,
        duration: Math.floor(duration)
      }));

      setActiveTab('transcript');
    } else {
      alert('Please select a valid audio file.');
    }
  };

  // Comprehensive pitch analysis
  const analyzePitch = async () => {
    const textToAnalyze = transcript.text.trim() || manualTranscript.trim();
    
    if (!textToAnalyze && !recording.audioBlob) {
      alert('Please record audio or enter a transcript to analyze.');
      return;
    }

    setAnalysis({ isAnalyzing: true, result: null, voiceAnalysis: null, error: null });
    setAnalysisProgress(0);
    setCurrentAnalysisStep('Preparing analysis...');

    try {
      let finalTranscript = textToAnalyze;
      let voiceAnalysisResult = null;

      // Step 1: Voice Analysis (if audio available)
      if (recording.audioBlob) {
        setCurrentAnalysisStep('Analyzing voice patterns...');
        setAnalysisProgress(20);

        const voiceRequest: VoiceAnalysisRequest = {
          audioBlob: recording.audioBlob,
          language: selectedLanguage,
          transcript: textToAnalyze,
          duration: recording.duration
        };

        const voiceResponse = await voiceAnalysisAPI.analyzeVoice(voiceRequest);
        
        if (voiceResponse.success && voiceResponse.data) {
          voiceAnalysisResult = voiceResponse.data;
          
          // Use voice analysis transcript if available and better
          if (!textToAnalyze && voiceAnalysisResult.transcript) {
            finalTranscript = voiceAnalysisResult.transcript;
          }
        }
      }

      // Step 2: Translation (if needed)
      setCurrentAnalysisStep('Processing language...');
      setAnalysisProgress(40);

      let translatedText = finalTranscript;
      if (selectedLanguage !== 'en-US' && selectedLanguage !== 'en-GB') {
        const translationResult = await translationService.translateToEnglish(
          finalTranscript, 
          selectedLanguage
        );
        
        if (!('error' in translationResult)) {
          translatedText = translationResult.translatedText;
        }
      }

      // Step 3: AI Content Analysis
      setCurrentAnalysisStep('Analyzing content structure...');
      setAnalysisProgress(60);

      const contentAnalysis = await aiAnalysisService.analyzePitch(
        translatedText, 
        selectedLanguage, 
        recording.duration
      );
      
      if ('error' in contentAnalysis) {
        throw new Error(contentAnalysis.message);
      }

      // Step 4: Combine analyses
      setCurrentAnalysisStep('Generating insights...');
      setAnalysisProgress(80);

      // Merge voice analysis with content analysis
      let finalAnalysis = contentAnalysis;
      
      if (voiceAnalysisResult) {
        finalAnalysis = {
          ...contentAnalysis,
          clarity: {
            score: voiceAnalysisResult.clarity.score,
            feedback: voiceAnalysisResult.clarity.feedback
          },
          tone: {
            score: voiceAnalysisResult.tone.score,
            feedback: voiceAnalysisResult.tone.feedback
          },
          pacing: {
            score: voiceAnalysisResult.pacing.score,
            feedback: voiceAnalysisResult.pacing.feedback,
            wordsPerMinute: voiceAnalysisResult.pacing.wordsPerMinute
          },
          fillerWords: {
            count: voiceAnalysisResult.fillerWords.totalCount,
            percentage: voiceAnalysisResult.fillerWords.percentage,
            examples: voiceAnalysisResult.fillerWords.detectedWords.map(w => w.word),
            detectedWords: voiceAnalysisResult.fillerWords.detectedWords
          },
          // Add new metrics from voice analysis
          confidenceLevel: voiceAnalysisResult.confidence.score,
          engagementScore: voiceAnalysisResult.engagement.score,
          professionalismScore: voiceAnalysisResult.tone.professionalism,
          smartTips: [
            ...contentAnalysis.smartTips || [],
            ...voiceAnalysisResult.smartTips
          ]
        };

        // Recalculate overall score with voice metrics
        finalAnalysis.overallScore = Math.round(
          (voiceAnalysisResult.clarity.score + 
           voiceAnalysisResult.tone.score + 
           voiceAnalysisResult.pacing.score + 
           contentAnalysis.structure.score) / 4 * 10
        ) / 10;
      }

      // Step 5: Save to history
      setCurrentAnalysisStep('Saving results...');
      setAnalysisProgress(90);

      const user = authService.getCurrentUser();
      if (user) {
        try {
          await pitchHistoryService.savePitch(
            user.uid,
            finalTranscript,
            finalAnalysis,
            selectedLanguage,
            translatedText !== finalTranscript ? translatedText : undefined,
            pitchTitle || undefined
          );
        } catch (error) {
          console.error('Failed to save pitch:', error);
        }
      }

      // Complete
      setCurrentAnalysisStep('Analysis complete!');
      setAnalysisProgress(100);

      setAnalysis({
        isAnalyzing: false,
        result: finalAnalysis,
        voiceAnalysis: voiceAnalysisResult,
        error: null
      });

      setActiveTab('analysis');

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis({
        isAnalyzing: false,
        result: null,
        voiceAnalysis: null,
        error: error instanceof Error ? error.message : 'Analysis failed. Please try again.'
      });
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get selected language info
  const getSelectedLanguageInfo = () => {
    const supportedLanguages = speechRecognitionService.getSupportedLanguages();
    return supportedLanguages.find(lang => lang.code === selectedLanguage) || supportedLanguages[0];
  };

  // Clear all data
  const clearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      // Stop any ongoing recording
      if (recording.isRecording) {
        audioRecordingService.stopRecording();
        speechRecognitionService.stop();
      }

      setRecording({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null
      });
      setTranscript({ text: '', isTranscribing: false, language: selectedLanguage, confidence: 0 });
      setAnalysis({ isAnalyzing: false, result: null, voiceAnalysis: null, error: null });
      setAudioQuality({ volume: 0, quality: 'poor', snr: 0 });
      setManualTranscript('');
      setPitchTitle('');
      setActiveTab('record');
    }
  };

  // Copy transcript
  const copyTranscript = () => {
    const textToCopy = transcript.text || manualTranscript;
    navigator.clipboard.writeText(textToCopy);
  };

  // Download audio
  const downloadAudio = () => {
    if (recording.audioBlob) {
      const url = URL.createObjectURL(recording.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pitch-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const supportedLanguages = speechRecognitionService.getSupportedLanguages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-green-900/20">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <div className="h-6 w-px bg-gray-600"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Advanced Pitch Practice</h1>
                  <p className="text-xs text-gray-400">AI-powered voice & content analysis</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-600/30"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {getSelectedLanguageInfo().flag} {getSelectedLanguageInfo().name}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 py-2 z-50 max-h-64 overflow-y-auto">
                    {supportedLanguages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setSelectedLanguage(language.code);
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-800/50 flex items-center space-x-3 ${
                          selectedLanguage === language.code ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <button
                onClick={() => setShowVideoGuide(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-600/30"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Guide</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={clearAll}
                className="p-2 text-gray-300 hover:text-red-400 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'record', name: 'Record', icon: Mic },
              { id: 'upload', name: 'Upload', icon: Upload },
              { id: 'transcript', name: 'Transcript', icon: FileText },
              { id: 'analysis', name: 'AI Analysis', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Record Tab */}
          {activeTab === 'record' && (
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8">
              <div className="text-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Advanced Voice Recording</h2>
                  <p className="text-gray-400">Real-time voice analysis in {getSelectedLanguageInfo().name}</p>
                </div>

                {/* Recording Controls */}
                <div className="flex items-center justify-center space-x-6 mb-8">
                  {!recording.isRecording ? (
                    <button
                      onClick={startRecording}
                      className="group relative w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Mic className="w-8 h-8 text-white group-hover:animate-pulse" />
                      <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={togglePauseRecording}
                        className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        {recording.isPaused ? (
                          <Play className="w-6 h-6 text-white" />
                        ) : (
                          <Pause className="w-6 h-6 text-white" />
                        )}
                      </button>
                      
                      <button
                        onClick={stopRecording}
                        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        <Square className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Recording Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-mono text-white">
                        {formatDuration(recording.duration)}
                      </span>
                    </div>
                    
                    {recording.isRecording && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-red-400">
                          {recording.isPaused ? 'Paused' : 'Recording'}
                        </span>
                      </div>
                    )}

                    {audioQuality.volume > 0 && (
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">
                          {audioQuality.quality} quality
                        </span>
                      </div>
                    )}
                  </div>

                  {transcript.isTranscribing && (
                    <div className="flex items-center justify-center space-x-2 text-blue-400">
                      <Waveform className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Live transcription active...</span>
                    </div>
                  )}

                  {/* Audio Quality Indicator */}
                  {recording.isRecording && (
                    <div className="max-w-md mx-auto">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <span>Audio Quality</span>
                        <span className={`font-medium ${
                          audioQuality.quality === 'excellent' ? 'text-green-400' :
                          audioQuality.quality === 'good' ? 'text-blue-400' :
                          audioQuality.quality === 'fair' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {audioQuality.quality}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            audioQuality.quality === 'excellent' ? 'bg-green-500' :
                            audioQuality.quality === 'good' ? 'bg-blue-500' :
                            audioQuality.quality === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, audioQuality.volume * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Transcript Preview */}
                {transcript.text && (
                  <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-300">Live Transcript</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          Confidence: {Math.round(transcript.confidence * 100)}%
                        </span>
                        <Languages className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-200 text-left leading-relaxed">
                      {transcript.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8">
              <div className="text-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Upload Audio File</h2>
                  <p className="text-gray-400">Upload an existing recording for comprehensive analysis</p>
                </div>

                <div className="max-w-md mx-auto">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Click to upload audio file</p>
                    <p className="text-sm text-gray-500">Supports MP3, WAV, M4A, WebM, FLAC</p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {recording.audioUrl && (
                  <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-600/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-300">Uploaded Audio</h3>
                      <span className="text-sm text-gray-400">
                        Duration: {formatDuration(recording.duration)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={isPlaying ? pausePlayback : playRecording}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>
                      
                      <button
                        onClick={downloadAudio}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transcript Tab */}
          {activeTab === 'transcript' && (
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Transcript & Analysis</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyTranscript}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <p className="text-gray-400">Review transcript and start comprehensive AI analysis</p>
              </div>

              {/* Pitch Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pitch Title (Optional)
                </label>
                <input
                  type="text"
                  value={pitchTitle}
                  onChange={(e) => setPitchTitle(e.target.value)}
                  placeholder="e.g., Series A Pitch - Q4 2024"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Auto-generated Transcript */}
              {transcript.text && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">Auto-Generated Transcript</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>Language: {getSelectedLanguageInfo().name}</span>
                      <span>•</span>
                      <span>Confidence: {Math.round(transcript.confidence * 100)}%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {transcript.text}
                    </p>
                  </div>
                </div>
              )}

              {/* Manual Transcript */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Manual Transcript {!transcript.text && <span className="text-red-400">*</span>}
                </label>
                <textarea
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  placeholder="Type or paste your pitch transcript here..."
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-400 mt-2">
                  {manualTranscript.length} characters • {manualTranscript.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              {/* Analysis Progress */}
              {analysis.isAnalyzing && (
                <div className="mb-6 p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Analysis in Progress</h3>
                      <p className="text-sm text-purple-300">{currentAnalysisStep}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-purple-900/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-purple-400">{analysisProgress}% complete</p>
                </div>
              )}

              {/* Analyze Button */}
              <div className="flex justify-center">
                <button
                  onClick={analyzePitch}
                  disabled={analysis.isAnalyzing || (!transcript.text && !manualTranscript.trim() && !recording.audioBlob)}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {analysis.isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Start AI Analysis</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-8">
              {analysis.error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-300">Analysis Failed</h3>
                      <p className="text-red-400 text-sm">{analysis.error}</p>
                    </div>
                  </div>
                  <button
                    onClick={analyzePitch}
                    className="mt-4 flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              {analysis.result && (
                <div className="space-y-6">
                  {/* Voice Analysis Summary */}
                  {analysis.voiceAnalysis && (
                    <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-2xl shadow-xl border border-green-500/30 p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Voice Analysis Results</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400 mb-1">
                            {analysis.voiceAnalysis.clarity.score}/10
                          </div>
                          <p className="text-sm text-green-300">Voice Clarity</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {analysis.voiceAnalysis.pacing.wordsPerMinute}
                          </div>
                          <p className="text-sm text-blue-300">Words/Min</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400 mb-1">
                            {analysis.voiceAnalysis.tone.score}/10
                          </div>
                          <p className="text-sm text-purple-300">Tone Quality</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400 mb-1">
                            {analysis.voiceAnalysis.fillerWords.percentage}%
                          </div>
                          <p className="text-sm text-yellow-300">Filler Words</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <AIFeedbackDisplay analysis={analysis.result} />
                  
                  {/* Export Options */}
                  <PDFExport
                    analysis={analysis.result}
                    transcript={transcript.text || manualTranscript}
                    userName={authService.getCurrentUser()?.displayName || 'Anonymous'}
                    pitchTitle={pitchTitle || 'Untitled Pitch'}
                    language={getSelectedLanguageInfo().name}
                    onExport={() => console.log('PDF exported')}
                  />
                </div>
              )}

              {!analysis.isAnalyzing && !analysis.result && !analysis.error && (
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h3>
                  <p className="text-gray-400 mb-6">Record audio or upload a file, then run AI analysis to get comprehensive feedback.</p>
                  <button
                    onClick={() => setActiveTab('record')}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl mx-auto"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Playback Controls */}
        {recording.audioUrl && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-4 z-40">
            <div className="flex items-center space-x-4">
              <button
                onClick={isPlaying ? pausePlayback : playRecording}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300 font-mono">
                  {formatDuration(Math.floor(playbackTime))} / {formatDuration(recording.duration)}
                </span>
              </div>
              
              <button
                onClick={downloadAudio}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Video Guide Modal */}
      <VideoGuideModal 
        isOpen={showVideoGuide}
        onClose={() => setShowVideoGuide(false)}
      />
    </div>
  );
};

export default PitchPractice;