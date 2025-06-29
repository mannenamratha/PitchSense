import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  ChevronDown, 
  Menu, 
  X, 
  Globe,
  Zap,
  Users,
  Award,
  ArrowRight,
  Target,
  Brain,
  BarChart3,
  Languages,
  Clock,
  CheckCircle,
  LogOut,
  User,
  FileText,
  BookOpen,
  Play,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Volume2,
  AlertTriangle,
  Lightbulb,
  Send,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Github,
  ExternalLink
} from 'lucide-react';
import PitchPractice from './components/PitchPractice';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import TemplatesLibrary from './components/TemplatesLibrary';
import StartupCoach from './components/StartupCoach';
import ChatbotCoach from './components/ChatbotCoach';
import DemoMode from './components/DemoMode';
import { authService, AuthUser } from './services/authService';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'practice' | 'dashboard' | 'templates' | 'coach'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoModeOpen, setIsDemoModeOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' }
  ];

  // Reordered navigation items as requested
  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Templates', id: 'templates' },
    { name: 'Features', id: 'features' },
    { name: 'About', id: 'about' }
  ];

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setCurrentPage('home');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleStartPitch = () => {
    setCurrentPage('practice');
  };

  const handleLoginClick = () => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    // User will be set automatically via auth state listener
    setCurrentPage('practice');
  };

  const handleNavClick = (itemId: string) => {
    if (itemId === 'templates') {
      setCurrentPage('templates');
    } else if (itemId === 'coach') {
      setCurrentPage('coach');
    } else if (itemId === 'home') {
      setCurrentPage('home');
    } else if (itemId === 'features' || itemId === 'about') {
      // Scroll to section
      const element = document.getElementById(itemId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/20 to-green-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading PitchSense...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'practice') {
    return (
      <>
        <PitchPractice onBack={() => setCurrentPage('home')} />
        <ChatbotCoach />
      </>
    );
  }

  if (currentPage === 'dashboard' && user) {
    return (
      <>
        <Dashboard 
          onBack={() => setCurrentPage('home')} 
          onStartNewPitch={() => setCurrentPage('practice')}
          user={user}
        />
        <ChatbotCoach />
      </>
    );
  }

  if (currentPage === 'templates') {
    return (
      <>
        <TemplatesLibrary onBack={() => setCurrentPage('home')} />
        <ChatbotCoach />
      </>
    );
  }

  if (currentPage === 'coach') {
    return (
      <>
        <StartupCoach onBack={() => setCurrentPage('home')} />
        <ChatbotCoach />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/20 to-green-900/20">
      {/* Header */}
      <header className="relative bg-black/80 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                  PitchSense
                </h1>
                <p className="text-xs text-gray-400 font-medium">AI Pitch Coach</p>
              </div>
            </div>

            {/* Desktop Navigation - Reordered */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    (item.id === 'home' && currentPage === 'home') || 
                    (item.id === 'templates' && currentPage === 'templates')
                      ? 'text-blue-400' 
                      : 'text-gray-300'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right Side - Language Selector & Auth */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-600/30"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {languages.find(lang => lang.name === selectedLanguage)?.flag} {selectedLanguage}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 py-2 z-50">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setSelectedLanguage(language.name);
                          setIsLanguageDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 flex items-center space-x-3"
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth Section - Moved to top right */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-600/30"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  Sign In / Sign Up
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    (item.id === 'home' && currentPage === 'home') || 
                    (item.id === 'templates' && currentPage === 'templates')
                      ? 'text-blue-400 bg-blue-900/20' 
                      : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800/50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              {user ? (
                <div className="pt-2 border-t border-gray-700/50">
                  <button
                    onClick={() => {
                      setCurrentPage('dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-colors"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-green-900/10 opacity-50"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Main Heading - Removed microphone emoji */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                FUELING CONFIDENCE
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-200 font-semibold italic">
                One Pitch at a Time
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Analyze. Improve. Impress.
            </p>

            {/* CTA Button - Single button now */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              {/* Primary Record Button - Changed to blue gradient */}
              <button 
                onClick={handleStartPitch}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3"
              >
                <div className="relative">
                  <Mic className="w-6 h-6 group-hover:animate-pulse" />
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <span className="text-lg">START PITCHING</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* User Status */}
            {user && (
              <div className="mb-8 p-4 bg-green-900/20 border border-green-500/30 rounded-xl max-w-md mx-auto backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">
                    Welcome back, {user.displayName}!
                  </span>
                </div>
                <p className="text-sm text-green-400 mt-1">
                  Your pitch history is saved and ready to review.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Analysis Section */}
        <div id="analyze" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What We Analyze</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get comprehensive feedback on every aspect of your pitch performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Analysis Cards */}
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Clarity Score</h3>
              <p className="text-gray-300 text-sm mb-4">Get a score from 0–10 on how clear and understandable your pitch is</p>
              <div className="text-2xl font-bold text-blue-400">0/10</div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 md:mt-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Tone Analysis</h3>
              <p className="text-gray-300 text-sm mb-4">Understand if you sound friendly, assertive, confident, or need adjustment</p>
              <div className="text-2xl font-bold text-green-400">0/10</div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Speaking Pace</h3>
              <p className="text-gray-300 text-sm mb-4">Track your words per minute and find the perfect speaking rhythm</p>
              <div className="text-2xl font-bold text-purple-400">0 WPM</div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Filler Words</h3>
              <p className="text-gray-300 text-sm mb-4">Count and reduce "um", "uh", "you know" and other filler words</p>
              <div className="text-2xl font-bold text-yellow-400">0%</div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Tips</h3>
              <p className="text-gray-300 text-sm mb-4">Get personalized improvement suggestions for your specific pitch</p>
              <div className="text-2xl font-bold text-indigo-400">0 Tips</div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time</h3>
              <p className="text-gray-300 text-sm mb-4">See live transcription and get instant feedback as you speak</p>
              <div className="text-2xl font-bold text-red-400">Live</div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleStartPitch}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 mx-auto"
            >
              <Mic className="w-5 h-5" />
              <span>PRACTICE NOW</span>
            </button>
          </div>
        </div>
      </main>

      {/* Features Section - Removed hover effects */}
      <section id="features" className="relative py-24 bg-gray-900/60 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/60"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              How PitchSense Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform analyzes every aspect of your pitch to help you deliver compelling presentations that captivate your audience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6 border border-blue-500/30">
                  <Target className="w-4 h-4 mr-2" />
                  How It Works
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
                  Advanced AI Analysis for 
                  <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"> Perfect Pitches</span>
                </h3>
                
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  PitchSense uses cutting-edge artificial intelligence to analyze your speech patterns, tone, pacing, and content structure, providing real-time feedback and actionable insights to improve your presentation skills.
                </p>
              </div>

              {/* Process Steps */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                    <span className="text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Record Your Pitch</h4>
                    <p className="text-gray-300 text-sm">Use our advanced recording system with multi-language support and real-time transcription.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                    <span className="text-green-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">AI Analysis</h4>
                    <p className="text-gray-300 text-sm">Our AI analyzes clarity, tone, pacing, structure, and identifies areas for improvement.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                    <span className="text-purple-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Get Detailed Feedback</h4>
                    <p className="text-gray-300 text-sm">Receive comprehensive scores, suggestions, and personalized recommendations for improvement.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                    <span className="text-yellow-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Practice & Improve</h4>
                    <p className="text-gray-300 text-sm">Use our insights to practice and track your progress over time with detailed analytics.</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <button 
                  onClick={handleStartPitch}
                  className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>Try It Now</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Visual Content */}
            <div className="relative">
              {/* Main Visual Container */}
              <div className="relative bg-gradient-to-br from-blue-900/40 to-green-900/40 rounded-3xl p-8 shadow-2xl border border-blue-500/20 backdrop-blur-sm">
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl opacity-60 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl opacity-60 blur-xl"></div>
                
                {/* Central Dashboard Mockup */}
                <div className="relative bg-gray-900/60 rounded-2xl shadow-lg p-6 border border-gray-700/50 backdrop-blur-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Live Analysis</h4>
                        <p className="text-xs text-gray-400">Elevator Pitch Practice</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">Recording</span>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full mb-3 border border-green-500/30">
                      <span className="text-2xl font-bold text-green-400">87</span>
                    </div>
                    <p className="text-sm text-gray-300">Overall Score</p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Clarity</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-4/5 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-white">92%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Pace</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-white">85%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Engagement</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-5/6 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-white">89%</span>
                      </div>
                    </div>
                  </div>

                  {/* Language Indicator */}
                  <div className="mt-6 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center justify-center space-x-2">
                      <Languages className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">Analyzing in English</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards - Removed hover effects */}
                <div className="absolute -top-6 -left-6 bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-700/50 transform rotate-3 transition-transform duration-300">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">2:34</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Practice Time</p>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-700/50 transform -rotate-3 transition-transform duration-300">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">+15</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 bg-gradient-to-br from-gray-900/80 to-black/60">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">About PitchSense</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto italic">
              Empowering your pitch, one word at a time.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-3xl p-8 shadow-2xl border border-purple-500/20 backdrop-blur-sm mb-16">
              <div className="space-y-6 text-gray-200 leading-relaxed">
                <p>
                  PitchSense was born from one moment — our very first pitch. Four best friends, one stage, and a whole lot of nerves. We stumbled, we forgot lines, and we wished we had something to guide us. That moment of stage fright turned into something powerful: an idea.
                </p>
                <p>
                  We built PitchSense for every student, dreamer, and future leader who wants to speak better but doesn't know where to start. It's more than just a tool — it's your personal pitch coach.
                </p>
                <p>
                  With real-time voice analysis, PitchSense gives you instant feedback on clarity, tone, speaking speed, filler words, and confidence. It even suggests practical tips to help you improve each time you practice. Whether you're preparing for a classroom pitch, a startup demo, or your very first public speech — PitchSense is here to help you sound your best, feel your best, and own the moment.
                </p>
              </div>
            </div>

            {/* Founders Section */}
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-white mb-8">Meet Our Founders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    name: 'Sneha Dindi',
                    image: '/api/placeholder/150/150',
                    social: {
                      instagram: 'https://instagram.com/sneha_dindi',
                      linkedin: 'https://linkedin.com/in/sneha-dindi',
                      github: 'https://github.com/snehadindi'
                    }
                  },
                  {
                    name: 'Dasari Manvanth',
                    image: '/api/placeholder/150/150',
                    social: {
                      instagram: 'https://instagram.com/manvanth.d',
                      linkedin: 'https://linkedin.com/in/d-manvanth',
                      github: 'https://github.com/dasarimanvanth'
                    }
                  },
                  {
                    name: 'Pati Yuktha',
                    image: '/api/placeholder/150/150',
                    social: {
                      instagram: 'https://instagram.com/yukta_pati',
                      linkedin: 'https://linkedin.com/in/yuktha-pati',
                      github: 'https://github.com/Yukthapati'
                    }
                  },
                  {
                    name: 'Manne Namratha Sai',
                    image: '/api/placeholder/150/150',
                    social: {
                      instagram: 'https://instagram.com/mannenamratha',
                      linkedin: 'https://linkedin.com/in/manne-namratha-sai-029771259',
                      github: 'https://github.com/mannenamratha'
                    }
                  }
                ].map((founder, index) => (
                  <div key={index} className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center border border-purple-500/30">
                      <User className="w-16 h-16 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-3">{founder.name}</h4>
                    <div className="flex justify-center space-x-3">
                      <a
                        href={founder.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center hover:bg-pink-500/30 transition-colors"
                      >
                        <Instagram className="w-4 h-4 text-pink-400" />
                      </a>
                      <a
                        href={founder.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-blue-400" />
                      </a>
                      <a
                        href={founder.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center hover:bg-gray-500/30 transition-colors"
                      >
                        <Github className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-24 bg-gradient-to-br from-blue-900/40 to-purple-900/40">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Let's Connect</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have a question, feedback, or just want to say hi? We'd love to hear from you!
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleContactSubmit} className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">&copy; 2025 PitchSense. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Mode Modal */}
      {isDemoModeOpen && (
        <DemoMode onClose={() => setIsDemoModeOpen(false)} />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Chatbot Coach */}
      <ChatbotCoach />
    </div>
  );
}

export default App;