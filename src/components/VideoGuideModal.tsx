import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  Target,
  Mic,
  FileText,
  BarChart3,
  Users,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface VideoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration?: string;
  tips: string[];
  icon: React.ElementType;
}

const VideoGuideModal: React.FC<VideoGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const guideSteps: GuideStep[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with PitchSense',
      description: 'Learn the basics of recording and analyzing your pitch',
      duration: '2:30',
      icon: Play,
      tips: [
        'Ensure you have a quiet environment for recording',
        'Test your microphone before starting',
        'Choose the correct language for better transcription',
        'Speak clearly and at a moderate pace'
      ]
    },
    {
      id: 'recording-setup',
      title: 'Setting Up Your Recording',
      description: 'Configure language settings and microphone permissions',
      duration: '1:45',
      icon: Mic,
      tips: [
        'Select your preferred language from the dropdown',
        'Grant microphone permissions when prompted',
        'Position yourself 6-12 inches from the microphone',
        'Avoid background noise and echo'
      ]
    },
    {
      id: 'recording-process',
      title: 'Recording Your Pitch',
      description: 'Step-by-step guide to recording your presentation',
      duration: '3:15',
      icon: Target,
      tips: [
        'Click the red microphone button to start',
        'Watch the live transcript appear as you speak',
        'Use pause/resume if you need breaks',
        'Stop recording when finished'
      ]
    },
    {
      id: 'transcript-review',
      title: 'Reviewing Your Transcript',
      description: 'How to check and edit your auto-generated transcript',
      duration: '2:00',
      icon: FileText,
      tips: [
        'Review the auto-generated transcript for accuracy',
        'Edit any mistakes in the manual transcript section',
        'Add a descriptive title for your pitch',
        'Check the word count and estimated duration'
      ]
    },
    {
      id: 'ai-analysis',
      title: 'Understanding AI Analysis',
      description: 'Interpreting your pitch analysis and feedback',
      duration: '4:20',
      icon: BarChart3,
      tips: [
        'Overall score combines all metrics',
        'Focus on areas with lower scores first',
        'Read specific feedback for each category',
        'Use improvement suggestions for practice'
      ]
    },
    {
      id: 'improvement-tips',
      title: 'Acting on Feedback',
      description: 'How to use AI suggestions to improve your pitch',
      duration: '3:45',
      icon: Lightbulb,
      tips: [
        'Practice specific areas that need improvement',
        'Record multiple versions to track progress',
        'Focus on one improvement area at a time',
        'Use the chatbot for additional guidance'
      ]
    }
  ];

  const currentStep = guideSteps[activeStep];

  if (!isOpen) return null;

  const handleStepChange = (stepIndex: number) => {
    setActiveStep(stepIndex);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">PitchSense Video Guide</h2>
              <p className="text-sm text-gray-400">Learn how to master your pitch presentations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar - Steps */}
          <div className="w-80 bg-gray-800/50 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Guide Steps</h3>
              <div className="space-y-2">
                {guideSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isActive = index === activeStep;
                  const isCompleted = index < activeStep;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepChange(index)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                          : isCompleted
                          ? 'bg-green-900/30 text-green-300 hover:bg-green-900/40'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive 
                            ? 'bg-white/20' 
                            : isCompleted 
                            ? 'bg-green-500/20' 
                            : 'bg-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <IconComponent className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                          <p className="text-xs opacity-80 line-clamp-2">{step.description}</p>
                          {step.duration && (
                            <div className="flex items-center space-x-1 mt-2">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{step.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Video Player */}
            <div className="relative bg-black flex-1 flex items-center justify-center">
              {/* Demo Video Placeholder */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <currentStep.icon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h3>
                  <p className="text-gray-300 mb-6 max-w-md">{currentStep.description}</p>
                  
                  {/* Demo Play Button */}
                  <button
                    onClick={togglePlay}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors mx-auto"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isPlaying ? 'Pause Demo' : 'Play Demo'}</span>
                  </button>
                </div>
              </div>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div 
                        className="bg-white h-1 rounded-full transition-all duration-300"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <span className="text-white text-sm font-mono">
                    {formatTime(currentTime)} / {currentStep.duration || '0:00'}
                  </span>
                  
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Content Panel */}
            <div className="bg-gray-800/50 border-t border-gray-700 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tips */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <span>Pro Tips</span>
                  </h4>
                  <div className="space-y-3">
                    {currentStep.tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                        </div>
                        <p className="text-gray-300 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Navigation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Current Step:</span>
                      <span className="text-white font-medium">{activeStep + 1} of {guideSteps.length}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStepChange(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <SkipBack className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                      
                      <button
                        onClick={() => handleStepChange(Math.min(guideSteps.length - 1, activeStep + 1))}
                        disabled={activeStep === guideSteps.length - 1}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <span>Next</span>
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>

                    {activeStep === guideSteps.length - 1 && (
                      <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Award className="w-5 h-5 text-green-400" />
                          <span className="font-semibold text-green-300">Congratulations!</span>
                        </div>
                        <p className="text-green-200 text-sm">
                          You've completed the PitchSense guide. You're ready to create amazing pitches!
                        </p>
                        <button
                          onClick={onClose}
                          className="mt-3 flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <span>Start Pitching</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGuideModal;