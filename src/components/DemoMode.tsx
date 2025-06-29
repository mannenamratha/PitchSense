import React, { useState, useEffect } from 'react';
import {
  Play,
  Zap,
  BarChart3,
  FileText,
  Clock,
  Target,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Download,
  Eye,
  Mic,
  Globe,
  Award,
  TrendingUp,
  Users,
  Lightbulb,
  X
} from 'lucide-react';
import AIFeedbackDisplay from './AIFeedbackDisplay';
import { PitchAnalysis } from '../services/aiAnalysisService';

interface DemoModeProps {
  onClose: () => void;
}

const DemoMode: React.FC<DemoModeProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'transcript' | 'analysis' | 'feedback'>('intro');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const sampleTranscript = `Hello everyone, I'm Sarah Chen, founder of FlowCast. We're solving a critical problem in the $50 billion project management space.

The problem: 73% of software teams miss deadlines because they can't predict bottlenecks before they happen. Current tools like Jira and Asana are reactive - they tell you what went wrong after it's too late.

Our solution: FlowCast uses AI to predict project delays 2-3 weeks in advance. We analyze code commits, team velocity, and communication patterns to give managers early warnings with specific recommendations.

Here's our traction: We have 150 paying customers including teams at Spotify and Airbnb. We're at $75K monthly recurring revenue with 15% month-over-month growth. Our customers report 40% fewer missed deadlines.

The market opportunity is massive. The global project management software market is $6.68 billion and growing 10% annually. Our serviceable addressable market is $2.1 billion.

Our team has deep expertise. I was a senior PM at Google for 6 years, and my co-founder built the analytics platform at Slack. We're backed by experienced advisors from Atlassian and Microsoft.

We're raising a $3 million Series A to expand our AI capabilities and grow our sales team. With this funding, we'll reach $2 million ARR within 18 months and be ready for our Series B.

Thank you, and I'm excited to answer your questions.`;

  const sampleAnalysis: PitchAnalysis = {
    overallScore: 8.7,
    clarity: {
      score: 9.2,
      feedback: "Excellent clarity and articulation. Your speech is crisp and easy to follow."
    },
    tone: {
      score: 8.5,
      feedback: "Confident and professional tone. Shows strong conviction in your solution."
    },
    pacing: {
      score: 8.3,
      feedback: "Well-paced delivery with good rhythm. Consider adding more strategic pauses."
    },
    fillerWords: {
      count: 3,
      percentage: 2.1,
      examples: ["um", "uh"]
    },
    structure: {
      score: 9.1,
      feedback: "Excellent structure following proven investor pitch framework.",
      hasIntroduction: true,
      hasProblemStatement: true,
      hasSolution: true,
      hasMarketSize: true,
      hasBusinessModel: true,
      hasTeam: true,
      hasTraction: true,
      hasFinancials: true,
      hasAsk: true
    },
    improvements: [
      "Add more specific customer testimonials or case studies",
      "Include competitive landscape analysis",
      "Mention your go-to-market strategy in more detail"
    ],
    missingElements: [
      "Competitive analysis",
      "Customer acquisition cost details"
    ],
    strengths: [
      "Clear problem-solution fit",
      "Strong traction metrics",
      "Experienced team with relevant background",
      "Specific funding ask with clear use of funds",
      "Compelling market opportunity"
    ],
    wordCount: 187,
    estimatedDuration: 75
  };

  const handleStartDemo = () => {
    setCurrentStep('transcript');
    setShowTranscript(true);
  };

  const handleAnalyze = () => {
    setCurrentStep('analysis');
    setIsAnalyzing(true);
    
    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentStep('feedback');
    }, 3000);
  };

  const exportToPDF = () => {
    // This would integrate with a PDF generation library
    alert('PDF export feature would be implemented here with jsPDF or similar library');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-green-900/20 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-blue-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">PitchSense Demo</h1>
                <p className="text-blue-100">Experience AI-powered pitch coaching</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="relative mt-6 flex items-center justify-center space-x-8">
            {[
              { id: 'intro', label: 'Introduction', icon: Play },
              { id: 'transcript', label: 'Sample Pitch', icon: Mic },
              { id: 'analysis', label: 'AI Analysis', icon: Brain },
              { id: 'feedback', label: 'Feedback', icon: Award }
            ].map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = ['intro', 'transcript', 'analysis'].indexOf(currentStep) > ['intro', 'transcript', 'analysis'].indexOf(step.id);
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/30 text-white scale-105' 
                      : isCompleted 
                      ? 'bg-green-500/30 text-green-200' 
                      : 'bg-white/10 text-white/60'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-white/20' : isCompleted ? 'bg-green-500/50' : 'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  
                  {index < 3 && (
                    <ArrowRight className={`w-4 h-4 mx-2 ${
                      isCompleted ? 'text-green-200' : 'text-white/40'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 'intro' && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">Welcome to PitchSense</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Experience our AI-powered pitch coaching platform with a real startup pitch example. 
                  See how our advanced analysis helps founders perfect their presentations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-2xl p-6 border border-blue-500/20">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Mic className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real-Time Analysis</h3>
                  <p className="text-gray-300 text-sm">Advanced AI analyzes speech patterns, structure, and delivery in real-time.</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-2xl p-6 border border-purple-500/20">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Smart Feedback</h3>
                  <p className="text-gray-300 text-sm">Get detailed insights on clarity, tone, pacing, and pitch structure.</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-2xl p-6 border border-green-500/20">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
                  <p className="text-gray-300 text-sm">Monitor improvement over time with detailed analytics and suggestions.</p>
                </div>
              </div>

              <button
                onClick={handleStartDemo}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 mx-auto"
              >
                <Play className="w-5 h-5 group-hover:animate-pulse" />
                <span>Start Demo Experience</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {currentStep === 'transcript' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-white">Sample Startup Pitch</h2>
                <p className="text-gray-300">
                  This is a real example of a well-structured startup pitch. Notice the clear problem-solution fit, 
                  strong traction metrics, and specific funding ask.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-6 border border-gray-600/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">FlowCast - AI Project Management</h3>
                      <p className="text-sm text-gray-400">Series A Pitch • 75 seconds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>1:15</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>187 words</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>English</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-6 mb-6">
                  <div className="text-gray-200 leading-relaxed whitespace-pre-line">
                    {sampleTranscript}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Strong structure</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-400">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Clear metrics</span>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Team credibility</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAnalyze}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Analyze with AI</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'analysis' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-white">AI Analysis in Progress</h2>
                <p className="text-gray-300">
                  Our advanced AI is analyzing speech patterns, structure, and delivery quality...
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-8 border border-purple-500/20">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-white font-medium">Analyzing pitch components...</div>
                      <div className="text-gray-300 text-sm">
                        {isAnalyzing ? (
                          <>
                            ✓ Speech clarity and articulation<br/>
                            ✓ Tone and confidence analysis<br/>
                            ✓ Pacing and rhythm evaluation<br/>
                            ⏳ Structure and content review<br/>
                            ⏳ Generating improvement suggestions...
                          </>
                        ) : (
                          "Analysis complete! Generating detailed feedback..."
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'feedback' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Analysis Results</h2>
                  <p className="text-gray-300">Comprehensive feedback and improvement suggestions</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={exportToPDF}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PDF</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep('intro')}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Restart Demo
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl border border-gray-600/30 overflow-hidden">
                <AIFeedbackDisplay analysis={sampleAnalysis} />
              </div>

              <div className="bg-gradient-to-r from-blue-900/40 to-green-900/40 rounded-2xl p-6 border border-blue-500/20">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Ready to Perfect Your Pitch?</h3>
                  <p className="text-gray-300">
                    Sign up for PitchSense to get personalized AI coaching, track your progress, 
                    and access professional pitch templates.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Get Started with PitchSense
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoMode;