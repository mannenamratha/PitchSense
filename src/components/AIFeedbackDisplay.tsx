import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Clock,
  FileText,
  Users,
  DollarSign,
  Lightbulb,
  Award,
  MessageSquare,
  Zap,
  Volume2,
  Brain,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Download,
  Star,
  TrendingDown,
  Activity,
  Mic,
  Globe,
  Timer,
  Hash,
  Percent
} from 'lucide-react';
import { PitchAnalysis } from '../services/aiAnalysisService';

interface AIFeedbackDisplayProps {
  analysis: PitchAnalysis;
  isLoading?: boolean;
}

const AIFeedbackDisplay: React.FC<AIFeedbackDisplayProps> = ({ analysis, isLoading = false }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [selectedMetric, setSelectedMetric] = useState<'clarity' | 'tone' | 'pacing' | 'structure'>('clarity');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-500/20';
    if (score >= 6) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return 'from-green-500 to-green-600';
    if (score >= 6) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const ScoreCard = ({ title, score, feedback, icon: Icon, maxScore = 10, additionalInfo }: {
    title: string;
    score: number;
    feedback: string;
    icon: React.ElementType;
    maxScore?: number;
    additionalInfo?: string;
  }) => (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getScoreBgColor(score)}`}>
            <Icon className={`w-5 h-5 ${getScoreColor(score)}`} />
          </div>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
          {score}/{maxScore}
        </div>
      </div>
      
      <div className="mb-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(score)} transition-all duration-500`}
            style={{ width: `${(score / maxScore) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-2">{feedback}</p>
      {additionalInfo && (
        <p className="text-xs text-gray-400 font-mono">{additionalInfo}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Overall Score Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">AI Pitch Analysis</h2>
            <p className="text-purple-100">Comprehensive feedback powered by advanced AI</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-4xl font-bold">{analysis.overallScore}</span>
            </div>
            <p className="text-sm text-purple-100">Overall Score</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Hash className="w-4 h-4" />
              <span className="text-sm font-medium">Words</span>
            </div>
            <p className="text-xl font-bold">{analysis.wordCount}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-medium">WPM</span>
            </div>
            <p className="text-xl font-bold">{analysis.pacing.wordsPerMinute}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-xl font-bold">{analysis.estimatedDuration}s</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Percent className="w-4 h-4" />
              <span className="text-sm font-medium">Fillers</span>
            </div>
            <p className="text-xl font-bold">{analysis.fillerWords.percentage}%</p>
          </div>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard
          title="Clarity"
          score={analysis.clarity.score}
          feedback={analysis.clarity.feedback}
          icon={Target}
          additionalInfo={`${analysis.fillerWords.count} filler words detected`}
        />
        <ScoreCard
          title="Tone & Confidence"
          score={analysis.tone.score}
          feedback={analysis.tone.feedback}
          icon={MessageSquare}
          additionalInfo={`Confidence level: ${analysis.confidenceLevel}/10`}
        />
        <ScoreCard
          title="Speaking Pace"
          score={analysis.pacing.score}
          feedback={analysis.pacing.feedback}
          icon={Clock}
          additionalInfo={`${analysis.pacing.wordsPerMinute} words per minute`}
        />
        <ScoreCard
          title="Structure"
          score={analysis.structure.score}
          feedback={analysis.structure.feedback}
          icon={BarChart3}
          additionalInfo={`${Object.values(analysis.structure).filter((v, i) => i > 1 && v).length}/9 elements present`}
        />
      </div>

      {/* Advanced Metrics */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
        <button
          onClick={() => toggleSection('advanced')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span>Advanced Metrics</span>
          </h3>
          {expandedSections.has('advanced') ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.has('advanced') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Engagement Score</span>
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">{analysis.engagementScore}/10</div>
              <p className="text-xs text-gray-400">How well you connect with audience</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Professionalism</span>
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">{analysis.professionalismScore}/10</div>
              <p className="text-xs text-gray-400">Professional language and tone</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Confidence Level</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">{analysis.confidenceLevel}/10</div>
              <p className="text-xs text-gray-400">Certainty and conviction in delivery</p>
            </div>
          </div>
        )}
      </div>

      {/* Smart Tips */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Smart Tips & Recommendations</h3>
        </div>
        
        <div className="space-y-4">
          {analysis.smartTips.map((tip, index) => {
            const priorityColors = {
              high: 'border-red-500/30 bg-red-500/10',
              medium: 'border-yellow-500/30 bg-yellow-500/10',
              low: 'border-blue-500/30 bg-blue-500/10'
            };
            
            const categoryIcons = {
              delivery: Mic,
              content: FileText,
              structure: BarChart3,
              engagement: Users
            };
            
            const CategoryIcon = categoryIcons[tip.category];
            
            return (
              <div key={index} className={`p-4 rounded-lg border ${priorityColors[tip.priority]}`}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CategoryIcon className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-white capitalize">{tip.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tip.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        tip.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {tip.priority} priority
                      </span>
                      {tip.actionable && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                          Actionable
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm">{tip.tip}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filler Words Analysis */}
      {analysis.fillerWords.count > 0 && (
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
          <button
            onClick={() => toggleSection('fillers')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-orange-400" />
              <span>Filler Words Analysis</span>
            </h3>
            {expandedSections.has('fillers') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSections.has('fillers') && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <p className="text-3xl font-bold text-orange-400">{analysis.fillerWords.count}</p>
                  <p className="text-sm text-gray-300">Total Count</p>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <p className="text-3xl font-bold text-orange-400">{analysis.fillerWords.percentage}%</p>
                  <p className="text-sm text-gray-300">Of Total Words</p>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <p className="text-3xl font-bold text-orange-400">{analysis.fillerWords.detectedWords.length}</p>
                  <p className="text-sm text-gray-300">Unique Types</p>
                </div>
              </div>
              
              {analysis.fillerWords.detectedWords.length > 0 && (
                <div>
                  <p className="text-sm text-gray-300 mb-3">Most frequent filler words:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {analysis.fillerWords.detectedWords.slice(0, 6).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                        <span className="text-orange-300 font-medium">"{item.word}"</span>
                        <span className="text-gray-400 text-sm">{item.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Pitch Structure Analysis */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
        <button
          onClick={() => toggleSection('structure')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Pitch Structure Elements</span>
          </h3>
          {expandedSections.has('structure') ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.has('structure') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'hasIntroduction', label: 'Introduction', icon: Users },
              { key: 'hasProblemStatement', label: 'Problem Statement', icon: AlertTriangle },
              { key: 'hasSolution', label: 'Solution', icon: Lightbulb },
              { key: 'hasMarketSize', label: 'Market Size', icon: TrendingUp },
              { key: 'hasBusinessModel', label: 'Business Model', icon: DollarSign },
              { key: 'hasTeam', label: 'Team', icon: Users },
              { key: 'hasTraction', label: 'Traction', icon: BarChart3 },
              { key: 'hasFinancials', label: 'Financials', icon: DollarSign },
              { key: 'hasAsk', label: 'Investment Ask', icon: Target }
            ].map(({ key, label, icon: Icon }) => {
              const hasElement = analysis.structure[key as keyof typeof analysis.structure] as boolean;
              return (
                <div key={key} className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  hasElement 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-gray-600/30 bg-gray-800/30'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      hasElement ? 'bg-green-500/20' : 'bg-gray-700'
                    }`}>
                      {hasElement ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Icon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      hasElement ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Strengths</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-200">{strength}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {analysis.improvements.length > 0 && (
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Improvement Suggestions</h3>
          </div>
          
          <div className="space-y-3">
            {analysis.improvements.map((improvement, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-200">{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Elements */}
      {analysis.missingElements.length > 0 && (
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Missing Elements</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.missingElements.map((element, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-200">{element}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items Summary */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl shadow-xl border border-purple-500/30 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Next Steps</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 text-sm font-bold">1</div>
            <p className="text-purple-200 text-sm">Focus on your lowest scoring area first</p>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 text-sm font-bold">2</div>
            <p className="text-purple-200 text-sm">Practice the high-priority smart tips</p>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 text-sm font-bold">3</div>
            <p className="text-purple-200 text-sm">Record another pitch to track improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeedbackDisplay;