import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Globe,
  Edit2,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  LineChart,
  PieChart as PieChartIcon,
  Activity,
  Star,
  Zap,
  Users,
  Brain,
  Lightbulb
} from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { pitchHistoryService, PitchSummary, ProgressDataPoint, LanguageData } from '../services/pitchHistoryService';
import { ProgressChart, LanguageChart, TrendAnalysis } from './ProgressChart';
import SuggestionsPanel from './SuggestionsPanel';

interface DashboardProps {
  onBack: () => void;
  onStartNewPitch: () => void;
  user: AuthUser;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack, onStartNewPitch, user }) => {
  const [pitches, setPitches] = useState<PitchSummary[]>([]);
  const [fullPitches, setFullPitches] = useState<any[]>([]);
  const [filteredPitches, setFilteredPitches] = useState<PitchSummary[]>([]);
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'progress' | 'history'>('overview');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [selectedMetric, setSelectedMetric] = useState<'overall' | 'clarity' | 'tone' | 'pacing' | 'structure'>('overall');
  const [stats, setStats] = useState({
    totalPitches: 0,
    averageScore: 0,
    totalDuration: 0,
    totalWords: 0,
    improvementTrend: 0,
    languagesUsed: [] as string[],
    bestScore: 0,
    recentAverage: 0,
    consistencyScore: 0
  });
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user.uid]);

  useEffect(() => {
    filterAndSortPitches();
  }, [pitches, searchTerm, sortBy, filterLanguage]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [pitchSummaries, userStats, progressChartData, languageChartData, analytics, fullPitchData] = await Promise.all([
        pitchHistoryService.getUserPitchSummaries(user.uid),
        pitchHistoryService.getUserStats(user.uid),
        pitchHistoryService.getProgressData(user.uid),
        pitchHistoryService.getLanguageData(user.uid),
        pitchHistoryService.getDetailedAnalytics(user.uid, 30),
        pitchHistoryService.getUserPitches(user.uid, 50)
      ]);

      setPitches(pitchSummaries);
      setFullPitches(fullPitchData);
      setStats(userStats);
      setProgressData(progressChartData);
      setLanguageData(languageChartData);
      setAchievements(analytics.achievements);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortPitches = () => {
    let filtered = pitches;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(pitch => 
        pitch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pitch.language.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply language filter
    if (filterLanguage !== 'all') {
      filtered = filtered.filter(pitch => pitch.language === filterLanguage);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.overallScore - a.overallScore;
        case 'duration':
          return b.duration - a.duration;
        case 'date':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    setFilteredPitches(filtered);
  };

  const handleDeletePitch = async (pitchId: string) => {
    if (!confirm('Are you sure you want to delete this pitch?')) return;

    try {
      await pitchHistoryService.deletePitch(pitchId);
      setPitches(prev => prev.filter(p => p.id !== pitchId));
      setFullPitches(prev => prev.filter(p => p.id !== pitchId));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLanguageFlag = (language: string) => {
    const flags: Record<string, string> = {
      'English': '🇺🇸',
      'Hindi': '🇮🇳',
      'Tamil': '🇮🇳',
      'French': '🇫🇷',
      'Spanish': '🇪🇸',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Portuguese': '🇵🇹'
    };
    return flags[language] || '🌐';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                  <p className="text-xs text-gray-500">Welcome back, {user.displayName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onStartNewPitch}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>New Pitch</span>
              </button>

              <div className="flex items-center space-x-2">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <div className="flex space-x-1">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'suggestions', name: 'Suggestions', icon: Lightbulb },
              { id: 'progress', name: 'Progress Charts', icon: LineChart },
              { id: 'history', name: 'Pitch History', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.totalPitches}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Total Pitches</h3>
                <p className="text-sm text-gray-600">All time practice sessions</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.averageScore}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Average Score</h3>
                <p className="text-sm text-gray-600">Overall performance rating</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.bestScore}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Best Score</h3>
                <p className="text-sm text-gray-600">Personal record</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    {stats.improvementTrend >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <span className={`text-2xl font-bold ${stats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Improvement</h3>
                <p className="text-sm text-gray-600">Recent vs previous scores</p>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Practice Time</h3>
                <p className="text-sm text-gray-600">Total speaking duration</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-pink-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.recentAverage}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Recent Average</h3>
                <p className="text-sm text-gray-600">Last 5 pitches</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-cyan-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.consistencyScore}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Consistency</h3>
                <p className="text-sm text-gray-600">Performance stability</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TrendAnalysis data={progressData} />
              <LanguageChart data={languageData} />
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <SuggestionsPanel pitches={fullPitches} />
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-8">
            {/* Chart Controls */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Progress Analytics</h2>
                
                <div className="flex flex-wrap gap-3">
                  {/* Metric Selector */}
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="overall">Overall Score</option>
                    <option value="clarity">Clarity</option>
                    <option value="tone">Tone</option>
                    <option value="pacing">Pacing</option>
                    <option value="structure">Structure</option>
                  </select>

                  {/* Chart Type Selector */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {[
                      { type: 'line', icon: LineChart },
                      { type: 'area', icon: Activity },
                      { type: 'bar', icon: BarChart3 }
                    ].map(({ type, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type as any)}
                        className={`p-2 rounded-md transition-colors ${
                          chartType === type
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Progress Chart */}
            <ProgressChart
              data={progressData}
              chartType={chartType}
              metric={selectedMetric}
            />

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TrendAnalysis data={progressData} />
              <LanguageChart data={languageData} />
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-8">
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pitches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'duration')}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                  <option value="duration">Sort by Duration</option>
                </select>

                {/* Language Filter */}
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Languages</option>
                  {stats.languagesUsed.map(lang => (
                    <option key={lang} value={lang}>{getLanguageFlag(lang)} {lang}</option>
                  ))}
                </select>

                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pitch History */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Pitch History</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredPitches.length} of {pitches.length} pitches
                </p>
              </div>

              {filteredPitches.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {pitches.length === 0 ? 'No pitches yet' : 'No matching pitches'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {pitches.length === 0 
                      ? 'Start practicing to see your pitch history here'
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                  {pitches.length === 0 && (
                    <button
                      onClick={onStartNewPitch}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                    >
                      Start Your First Pitch
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredPitches.map((pitch) => (
                    <div key={pitch.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {pitch.title}
                            </h3>
                            <span className="text-lg">{getLanguageFlag(pitch.language)}</span>
                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(pitch.overallScore)}`}>
                              {pitch.overallScore}/10
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(pitch.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(pitch.duration)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>{pitch.wordCount} words</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Globe className="w-4 h-4" />
                              <span>{pitch.language}</span>
                            </div>
                          </div>

                          {pitch.tags && pitch.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pitch.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {pitch.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{pitch.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePitch(pitch.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;