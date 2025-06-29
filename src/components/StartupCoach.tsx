import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Globe,
  Zap,
  Award,
  Building,
  Rocket,
  Brain,
  Star,
  ChevronRight,
  Filter,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  FileText,
  Eye,
  EyeOff,
  Bookmark,
  Share2
} from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  category: 'fundamentals' | 'metrics' | 'funding' | 'strategy' | 'legal' | 'product';
  definition: string;
  sampleSentence: string;
  tip: string;
  relatedTerms: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ElementType;
  color: string;
  examples?: string[];
  commonMistakes?: string[];
}

interface StartupCoachProps {
  onBack: () => void;
}

const StartupCoach: React.FC<StartupCoachProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [bookmarkedTerms, setBookmarkedTerms] = useState<Set<string>>(new Set());

  const glossaryTerms: GlossaryTerm[] = [
    {
      id: 'problem-statement',
      term: 'Problem Statement',
      category: 'fundamentals',
      definition: 'A clear, concise description of the specific problem your startup aims to solve. It should be relatable, urgent, and affect a significant number of people.',
      sampleSentence: '"Our problem statement is that 73% of small businesses struggle with cash flow management, leading to 82% of business failures."',
      tip: 'Make your problem statement specific and quantifiable. Avoid vague problems like "people need better solutions." Instead, focus on measurable pain points.',
      relatedTerms: ['Value Proposition', 'Target Market', 'Market Research'],
      difficulty: 'beginner',
      icon: Target,
      color: 'red',
      examples: [
        'Airbnb: "Travelers can\'t find affordable, authentic accommodations"',
        'Uber: "Getting a taxi is unreliable and expensive"',
        'Slack: "Team communication is scattered across emails and tools"'
      ],
      commonMistakes: [
        'Making the problem too broad or generic',
        'Not validating the problem with real customers',
        'Focusing on solutions instead of the actual problem'
      ]
    },
    {
      id: 'value-proposition',
      term: 'Value Proposition',
      category: 'fundamentals',
      definition: 'A clear statement that explains how your product solves customers\' problems, what benefits it delivers, and why customers should choose you over competitors.',
      sampleSentence: '"Our value proposition is helping small businesses increase revenue by 30% through AI-powered customer insights."',
      tip: 'Focus on outcomes, not features. Customers care about what your product does for them, not how it works.',
      relatedTerms: ['Problem Statement', 'Unique Selling Proposition', 'Product-Market Fit'],
      difficulty: 'beginner',
      icon: Star,
      color: 'yellow',
      examples: [
        'Zoom: "Frictionless video communications"',
        'Stripe: "Increase revenue and lower costs"',
        'Canva: "Design anything. Publish anywhere."'
      ],
      commonMistakes: [
        'Listing features instead of benefits',
        'Being too vague or generic',
        'Not differentiating from competitors'
      ]
    },
    {
      id: 'traction',
      term: 'Traction',
      category: 'metrics',
      definition: 'Measurable evidence that your startup is gaining momentum and customer adoption. This includes user growth, revenue, partnerships, or other key performance indicators.',
      sampleSentence: '"We have strong traction with 10,000 active users, $50K monthly recurring revenue, and 20% month-over-month growth."',
      tip: 'Choose metrics that matter to your business model. For SaaS, focus on MRR and churn. For marketplaces, focus on transaction volume and user engagement.',
      relatedTerms: ['KPIs', 'Product-Market Fit', 'Growth Rate', 'Customer Acquisition'],
      difficulty: 'intermediate',
      icon: TrendingUp,
      color: 'green',
      examples: [
        'User metrics: 100K monthly active users',
        'Revenue metrics: $2M ARR, 15% month-over-month growth',
        'Partnership metrics: Signed with 3 Fortune 500 companies'
      ],
      commonMistakes: [
        'Focusing on vanity metrics instead of meaningful ones',
        'Not showing consistent growth trends',
        'Comparing to irrelevant benchmarks'
      ]
    },
    {
      id: 'go-to-market-strategy',
      term: 'Go-to-Market Strategy',
      category: 'strategy',
      definition: 'A comprehensive plan that outlines how you will reach your target customers, deliver your value proposition, and achieve sustainable growth.',
      sampleSentence: '"Our go-to-market strategy focuses on direct sales to enterprise clients, supported by content marketing and industry partnerships."',
      tip: 'Start with one channel and perfect it before expanding. It\'s better to dominate one channel than to be mediocre in many.',
      relatedTerms: ['Customer Acquisition', 'Sales Funnel', 'Marketing Channels', 'Customer Segmentation'],
      difficulty: 'intermediate',
      icon: Rocket,
      color: 'blue',
      examples: [
        'B2B SaaS: Direct sales + content marketing + partnerships',
        'Consumer app: App store optimization + social media + influencers',
        'Marketplace: Chicken-and-egg strategy for both sides'
      ],
      commonMistakes: [
        'Trying to target everyone at once',
        'Not testing channels before scaling',
        'Underestimating customer acquisition costs'
      ]
    },
    {
      id: 'product-market-fit',
      term: 'Product-Market Fit',
      category: 'fundamentals',
      definition: 'The degree to which a product satisfies strong market demand. It means you\'ve built something people want and are willing to pay for.',
      sampleSentence: '"We achieved product-market fit when 40% of our users said they\'d be very disappointed if our product disappeared."',
      tip: 'Use the Sean Ellis test: Survey users asking how disappointed they\'d be if your product disappeared. 40%+ saying "very disappointed" indicates PMF.',
      relatedTerms: ['Customer Validation', 'Traction', 'Market Research', 'Customer Retention'],
      difficulty: 'intermediate',
      icon: Target,
      color: 'purple',
      examples: [
        'High retention rates (>90% monthly for SaaS)',
        'Strong word-of-mouth growth',
        'Customers pulling product from you, not you pushing'
      ],
      commonMistakes: [
        'Confusing early traction with true PMF',
        'Not measuring the right indicators',
        'Scaling before achieving PMF'
      ]
    },
    {
      id: 'burn-rate',
      term: 'Burn Rate',
      category: 'funding',
      definition: 'The rate at which a startup spends its cash reserves, typically measured monthly. It indicates how long your current funding will last.',
      sampleSentence: '"Our monthly burn rate is $50K, giving us 18 months of runway with our current funding."',
      tip: 'Track both gross burn (total expenses) and net burn (expenses minus revenue). Focus on extending runway while maintaining growth.',
      relatedTerms: ['Runway', 'Cash Flow', 'Funding Round', 'Unit Economics'],
      difficulty: 'intermediate',
      icon: DollarSign,
      color: 'red',
      examples: [
        'Gross burn: $100K/month in total expenses',
        'Net burn: $75K/month after $25K revenue',
        'Runway: 12 months at current burn rate'
      ],
      commonMistakes: [
        'Not tracking burn rate regularly',
        'Burning too fast without proportional growth',
        'Not planning for fundraising lead times'
      ]
    },
    {
      id: 'mvp',
      term: 'Minimum Viable Product (MVP)',
      category: 'product',
      definition: 'The simplest version of your product that allows you to start learning from customers with the least effort. It should solve the core problem with minimal features.',
      sampleSentence: '"Our MVP is a basic web app that connects dog owners with local walkers, focusing only on booking and payment."',
      tip: 'Your MVP should be embarrassingly simple. If you\'re not embarrassed by your first version, you launched too late.',
      relatedTerms: ['Product Development', 'Customer Validation', 'Iteration', 'Feature Creep'],
      difficulty: 'beginner',
      icon: Zap,
      color: 'orange',
      examples: [
        'Dropbox: Simple file syncing demo video',
        'Airbnb: Basic website with air mattresses',
        'Buffer: Landing page testing demand before building'
      ],
      commonMistakes: [
        'Building too many features in the first version',
        'Perfectionism preventing launch',
        'Not getting user feedback early enough'
      ]
    },
    {
      id: 'customer-acquisition-cost',
      term: 'Customer Acquisition Cost (CAC)',
      category: 'metrics',
      definition: 'The total cost of acquiring a new customer, including marketing, sales, and related expenses. Critical for understanding unit economics.',
      sampleSentence: '"Our CAC is $200, and with an LTV of $1,200, we have a healthy 6:1 LTV to CAC ratio."',
      tip: 'Calculate CAC by channel to identify your most efficient acquisition methods. Include all costs: ads, salaries, tools, and overhead.',
      relatedTerms: ['LTV', 'Unit Economics', 'Marketing Channels', 'Payback Period'],
      difficulty: 'intermediate',
      icon: Users,
      color: 'blue',
      examples: [
        'Paid ads: $150 CAC through Google Ads',
        'Content marketing: $50 CAC through blog content',
        'Referrals: $25 CAC through customer referrals'
      ],
      commonMistakes: [
        'Not including all acquisition costs',
        'Calculating CAC too early with small sample sizes',
        'Ignoring CAC payback period'
      ]
    },
    {
      id: 'lifetime-value',
      term: 'Lifetime Value (LTV)',
      category: 'metrics',
      definition: 'The total revenue you expect to generate from a customer throughout their relationship with your company.',
      sampleSentence: '"With an average customer lifespan of 24 months and $50 monthly revenue, our LTV is $1,200."',
      tip: 'For SaaS: LTV = (Monthly Revenue per Customer × Gross Margin %) ÷ Monthly Churn Rate. Aim for LTV:CAC ratio of 3:1 or higher.',
      relatedTerms: ['CAC', 'Churn Rate', 'Unit Economics', 'Customer Retention'],
      difficulty: 'intermediate',
      icon: BarChart3,
      color: 'green',
      examples: [
        'SaaS: $100/month × 20 months = $2,000 LTV',
        'E-commerce: $50 average order × 8 orders = $400 LTV',
        'Subscription: $25/month × 36 months = $900 LTV'
      ],
      commonMistakes: [
        'Using too short a time period for calculation',
        'Not accounting for churn rate changes',
        'Ignoring gross margin in calculations'
      ]
    },
    {
      id: 'pivot',
      term: 'Pivot',
      category: 'strategy',
      definition: 'A structured course correction to test a new fundamental hypothesis about the product, strategy, or engine of growth.',
      sampleSentence: '"After six months of low traction, we pivoted from a B2C app to a B2B SaaS platform serving the same market."',
      tip: 'Pivot based on data, not emotions. Set clear metrics and timelines for when to consider pivoting. Most successful startups pivot at least once.',
      relatedTerms: ['Product-Market Fit', 'Customer Validation', 'Business Model', 'Market Research'],
      difficulty: 'advanced',
      icon: Globe,
      color: 'purple',
      examples: [
        'Customer segment pivot: B2C to B2B',
        'Problem pivot: Different problem, same market',
        'Platform pivot: App to platform'
      ],
      commonMistakes: [
        'Pivoting too quickly without enough data',
        'Pivoting too late after burning too much cash',
        'Not communicating the pivot clearly to stakeholders'
      ]
    },
    {
      id: 'runway',
      term: 'Runway',
      category: 'funding',
      definition: 'The amount of time your startup can operate before running out of money, based on your current burn rate and available cash.',
      sampleSentence: '"With $500K in the bank and a $25K monthly burn rate, we have 20 months of runway."',
      tip: 'Always maintain at least 6 months of runway. Start fundraising when you have 6-9 months left to account for the time it takes to raise money.',
      relatedTerms: ['Burn Rate', 'Cash Flow', 'Funding Round', 'Bridge Financing'],
      difficulty: 'beginner',
      icon: Clock,
      color: 'orange',
      examples: [
        'Cash runway: $1M ÷ $50K burn = 20 months',
        'Revenue runway: Time until break-even',
        'Milestone runway: Time to next funding milestone'
      ],
      commonMistakes: [
        'Not accounting for seasonal variations in burn',
        'Being too optimistic about fundraising timelines',
        'Not planning for unexpected expenses'
      ]
    },
    {
      id: 'term-sheet',
      term: 'Term Sheet',
      category: 'legal',
      definition: 'A non-binding document that outlines the basic terms and conditions of an investment, including valuation, ownership, and investor rights.',
      sampleSentence: '"We received a term sheet offering $2M at a $8M pre-money valuation with standard investor protections."',
      tip: 'Focus on valuation, but don\'t ignore other terms like liquidation preferences, board composition, and anti-dilution provisions. These can significantly impact your outcome.',
      relatedTerms: ['Valuation', 'Equity', 'Due Diligence', 'Liquidation Preference'],
      difficulty: 'advanced',
      icon: FileText,
      color: 'blue',
      examples: [
        'Pre-money valuation: $10M',
        'Investment amount: $3M',
        'Post-money valuation: $13M'
      ],
      commonMistakes: [
        'Focusing only on valuation, ignoring other terms',
        'Not negotiating investor-friendly terms',
        'Accepting the first term sheet without shopping around'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: BookOpen, color: 'gray' },
    { id: 'fundamentals', name: 'Fundamentals', icon: Target, color: 'blue' },
    { id: 'metrics', name: 'Metrics & KPIs', icon: BarChart3, color: 'green' },
    { id: 'funding', name: 'Funding & Finance', icon: DollarSign, color: 'yellow' },
    { id: 'strategy', name: 'Strategy', icon: Brain, color: 'purple' },
    { id: 'product', name: 'Product', icon: Zap, color: 'orange' },
    { id: 'legal', name: 'Legal & Structure', icon: FileText, color: 'red' }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || term.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleBookmark = (termId: string) => {
    const newBookmarks = new Set(bookmarkedTerms);
    if (newBookmarks.has(termId)) {
      newBookmarks.delete(termId);
    } else {
      newBookmarks.add(termId);
    }
    setBookmarkedTerms(newBookmarks);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Startup Coach</h1>
                  <p className="text-xs text-gray-500">Master startup terminology & concepts</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {filteredTerms.length} terms
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Startup Coach Glossary
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Master essential startup terminology with clear definitions, real examples, and practical tips. 
            Build your founder vocabulary and speak the language of entrepreneurship.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.id} value={difficulty.id}>
                  {difficulty.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTerms.map(term => {
            const IconComponent = term.icon;
            const isExpanded = expandedTerm === term.id;
            const isBookmarked = bookmarkedTerms.has(term.id);

            return (
              <div
                key={term.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${term.color}-100 rounded-xl flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 text-${term.color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(term.difficulty)}`}>
                            {term.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {categories.find(c => c.id === term.category)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleBookmark(term.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isBookmarked 
                            ? 'bg-yellow-100 text-yellow-600' 
                            : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setExpandedTerm(isExpanded ? null : term.id)}
                        className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Definition */}
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {term.definition}
                  </p>

                  {/* Sample Sentence */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Example Usage</span>
                    </div>
                    <p className="text-blue-800 italic text-sm">
                      {term.sampleSentence}
                    </p>
                  </div>

                  {/* Tip */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Pro Tip</span>
                    </div>
                    <p className="text-green-800 text-sm">
                      {term.tip}
                    </p>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50">
                    {/* Examples */}
                    {term.examples && term.examples.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>Real Examples</span>
                        </h4>
                        <div className="space-y-2">
                          {term.examples.map((example, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                              </div>
                              <p className="text-sm text-gray-700">{example}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {term.commonMistakes && term.commonMistakes.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span>Common Mistakes</span>
                        </h4>
                        <div className="space-y-2">
                          {term.commonMistakes.map((mistake, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              </div>
                              <p className="text-sm text-gray-700">{mistake}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Terms */}
                    {term.relatedTerms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-purple-500" />
                          <span>Related Terms</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {term.relatedTerms.map((relatedTerm, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 transition-colors"
                              onClick={() => setSearchTerm(relatedTerm)}
                            >
                              {relatedTerm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No terms found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Learning Tips */}
        <div className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Master Startup Language</h2>
            <p className="text-gray-600">Tips for building your entrepreneurial vocabulary</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bookmark Key Terms</h3>
              <p className="text-sm text-gray-600">Save important terms for quick reference during pitches and meetings.</p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Practice in Context</h3>
              <p className="text-sm text-gray-600">Use these terms in your pitches and conversations to build natural fluency.</p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start with Basics</h3>
              <p className="text-sm text-gray-600">Master beginner terms first, then progress to intermediate and advanced concepts.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StartupCoach;