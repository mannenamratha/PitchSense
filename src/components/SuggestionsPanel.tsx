import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  Target,
  Users,
  Mic,
  FileText,
  Clock,
  BarChart3,
  Globe,
  MessageSquare,
  Volume2,
  DollarSign,
  Layout,
  Repeat,
  AlertTriangle,
  ChevronRight,
  CheckCircle,
  Star,
  Zap,
  Brain,
  Award,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { suggestionService, PersonalizedSuggestion, AnalysisInsight } from '../services/suggestionService';

interface SuggestionsPanelProps {
  pitches: any[];
  className?: string;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ pitches, className = '' }) => {
  const [suggestions, setSuggestions] = useState<PersonalizedSuggestion[]>([]);
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [completedSuggestions, setCompletedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateSuggestions();
  }, [pitches]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const personalizedSuggestions = suggestionService.generatePersonalizedSuggestions(pitches);
      const patternInsights = suggestionService.getPatternInsights(pitches);
      
      setSuggestions(personalizedSuggestions);
      setInsights(patternInsights);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'volume-2': Volume2,
      'clock': Clock,
      'message-square': MessageSquare,
      'trending-up': TrendingUp,
      'users': Users,
      'bar-chart-3': BarChart3,
      'dollar-sign': DollarSign,
      'file-text': FileText,
      'scissors': MessageSquare,
      'alert-triangle': AlertTriangle,
      'mic': Mic,
      'globe': Globe,
      'layout': Layout,
      'repeat': Repeat,
      'target': Target
    };
    return iconMap[iconName] || Lightbulb;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'delivery': return 'bg-purple-100 text-purple-700';
      case 'structure': return 'bg-blue-100 text-blue-700';
      case 'content': return 'bg-green-100 text-green-700';
      case 'confidence': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleSuggestionCompletion = (suggestionId: string) => {
    const newCompleted = new Set(completedSuggestions);
    if (newCompleted.has(suggestionId)) {
      newCompleted.delete(suggestionId);
    } else {
      newCompleted.add(suggestionId);
    }
    setCompletedSuggestions(newCompleted);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Practicing for Personalized Tips</h3>
          <p className="text-gray-600">Complete a few pitches to receive AI-powered improvement suggestions tailored to your speaking patterns.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Suggestions for You</h2>
            </div>
            <p className="text-purple-100">
              AI-powered insights based on your {pitches.length} pitch{pitches.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <button
            onClick={generateSuggestions}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Pattern Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pattern Analysis</h3>
          </div>
          
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-orange-900">{insight.pattern}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded-full">
                      {insight.frequency}% frequency
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.impact === 'High' ? 'bg-red-200 text-red-800' :
                      insight.impact === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                </div>
                <p className="text-sm text-orange-800">{insight.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Suggestions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
          </div>
          <div className="text-sm text-gray-500">
            {completedSuggestions.size} of {suggestions.length} completed
          </div>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Great Job!</h4>
            <p className="text-gray-600">
              Your recent pitches show strong performance across all areas. Keep practicing to maintain your momentum!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => {
              const IconComponent = getIconComponent(suggestion.icon);
              const isExpanded = expandedSuggestion === suggestion.id;
              const isCompleted = completedSuggestions.has(suggestion.id);

              return (
                <div
                  key={suggestion.id}
                  className={`border-2 rounded-xl transition-all duration-300 ${
                    isCompleted ? 'border-green-200 bg-green-50' : getPriorityColor(suggestion.priority)
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isCompleted ? 'bg-green-100' : 'bg-white shadow-sm'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <IconComponent className={`w-6 h-6 ${getPriorityTextColor(suggestion.priority)}`} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className={`text-lg font-semibold ${
                              isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                            }`}>
                              {suggestion.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(suggestion.category)}`}>
                              {suggestion.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {suggestion.priority} priority
                            </span>
                          </div>
                          
                          <p className={`text-sm mb-3 ${
                            isCompleted ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {suggestion.description}
                          </p>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Zap className="w-4 h-4" />
                              <span>{suggestion.estimatedImpact}</span>
                            </div>
                            
                            <button
                              onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              <span>{isExpanded ? 'Hide' : 'Show'} Action Items</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleSuggestionCompletion(suggestion.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isCompleted 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                          }`}
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Action Items */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>Action Items</span>
                        </h5>
                        <div className="space-y-3">
                          {suggestion.actionItems.map((item, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-sm text-gray-700 flex-1">{item}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-900">Expected Impact</span>
                          </div>
                          <p className="text-sm text-blue-800">{suggestion.estimatedImpact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Summary */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Your Improvement Journey</h3>
              <p className="text-green-700">
                Complete these suggestions to see significant improvement in your pitch performance.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-green-600">
                  {Math.round((completedSuggestions.size / suggestions.length) * 100)}%
                </span>
              </div>
              <p className="text-sm text-green-600 font-medium">Complete</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedSuggestions.size / suggestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionsPanel;