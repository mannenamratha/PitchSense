import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Lightbulb,
  Target,
  Award,
  ChevronRight,
  FileText,
  Zap,
  Globe,
  Building,
  Rocket,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Download,
  Copy
} from 'lucide-react';
import TemplateForm from './TemplateForm';

interface Template {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  audience: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  features: string[];
  sections: TemplateSection[];
  tips: string[];
  examples: string[];
}

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  timeAllocation: string;
  questions: TemplateQuestion[];
}

interface TemplateQuestion {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
  required: boolean;
  helpText?: string;
}

interface TemplatesLibraryProps {
  onBack: () => void;
}

const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({ onBack }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const templates: Template[] = [
    {
      id: 'yc-pitch',
      title: 'Y Combinator 1-Minute Pitch',
      subtitle: 'The classic startup accelerator format',
      description: 'Perfect for demo days and accelerator applications. Focuses on problem, solution, and traction in 60 seconds.',
      duration: '1 minute',
      audience: 'Accelerators, Demo Days',
      difficulty: 'Intermediate',
      icon: Rocket,
      color: 'orange',
      bgGradient: 'from-orange-500 to-red-500',
      features: [
        'Problem-solution fit focus',
        'Traction emphasis',
        'Clear ask',
        'Memorable hook'
      ],
      sections: [
        {
          id: 'hook',
          title: 'Hook & Problem',
          description: 'Grab attention and define the problem',
          timeAllocation: '15 seconds',
          questions: [
            {
              id: 'company-name',
              question: 'What is your company name?',
              placeholder: 'e.g., Airbnb, Uber, Stripe',
              type: 'text',
              required: true
            },
            {
              id: 'problem-statement',
              question: 'What problem are you solving?',
              placeholder: 'e.g., People struggle to find affordable accommodation when traveling',
              type: 'textarea',
              required: true,
              helpText: 'Make it relatable and urgent. Use specific examples.'
            }
          ]
        },
        {
          id: 'solution',
          title: 'Solution',
          description: 'Your unique approach to solving the problem',
          timeAllocation: '20 seconds',
          questions: [
            {
              id: 'solution-description',
              question: 'How do you solve this problem?',
              placeholder: 'e.g., A platform that connects travelers with local hosts offering spare rooms',
              type: 'textarea',
              required: true
            },
            {
              id: 'unique-advantage',
              question: 'What makes your solution unique?',
              placeholder: 'e.g., First to focus on authentic local experiences, not just accommodation',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'traction',
          title: 'Traction',
          description: 'Proof that your solution works',
          timeAllocation: '15 seconds',
          questions: [
            {
              id: 'key-metric',
              question: 'What is your most impressive metric?',
              placeholder: 'e.g., 100,000 bookings, $2M ARR, 50% month-over-month growth',
              type: 'text',
              required: true
            },
            {
              id: 'growth-rate',
              question: 'What is your growth rate?',
              placeholder: 'e.g., 20% month-over-month',
              type: 'text',
              required: false
            }
          ]
        },
        {
          id: 'ask',
          title: 'The Ask',
          description: 'What you need to succeed',
          timeAllocation: '10 seconds',
          questions: [
            {
              id: 'funding-amount',
              question: 'How much funding are you seeking?',
              placeholder: 'e.g., $2M seed round',
              type: 'text',
              required: true
            },
            {
              id: 'use-of-funds',
              question: 'What will you use the funds for?',
              placeholder: 'e.g., Expand to 5 new cities and grow the team',
              type: 'textarea',
              required: true
            }
          ]
        }
      ],
      tips: [
        'Start with a relatable problem that makes people nod',
        'Use concrete numbers and metrics',
        'Practice until you can deliver without notes',
        'End with a clear, specific ask'
      ],
      examples: [
        '"Airbnb: Book rooms with locals, rather than hotels"',
        '"Uber: Push a button, get a ride"',
        '"Stripe: Seven lines of code, any web developer can accept payments"'
      ]
    },
    {
      id: 'elevator-pitch',
      title: 'Elevator Pitch',
      subtitle: 'Perfect for networking and chance encounters',
      description: 'A concise 30-60 second pitch for unexpected opportunities. Focus on clarity and memorability.',
      duration: '30-60 seconds',
      audience: 'Networking Events, Casual Meetings',
      difficulty: 'Beginner',
      icon: Building,
      color: 'blue',
      bgGradient: 'from-blue-500 to-indigo-500',
      features: [
        'Conversational tone',
        'Easy to remember',
        'Adaptable length',
        'Strong hook'
      ],
      sections: [
        {
          id: 'introduction',
          title: 'Introduction',
          description: 'Who you are and what you do',
          timeAllocation: '10 seconds',
          questions: [
            {
              id: 'name-title',
              question: 'Your name and title',
              placeholder: 'e.g., Hi, I\'m Sarah, founder of TechStart',
              type: 'text',
              required: true
            },
            {
              id: 'company-description',
              question: 'What does your company do in one sentence?',
              placeholder: 'e.g., We help small businesses automate their accounting',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'value-proposition',
          title: 'Value Proposition',
          description: 'The benefit you provide',
          timeAllocation: '20 seconds',
          questions: [
            {
              id: 'target-customer',
              question: 'Who is your target customer?',
              placeholder: 'e.g., Small business owners with 5-50 employees',
              type: 'text',
              required: true
            },
            {
              id: 'main-benefit',
              question: 'What is the main benefit you provide?',
              placeholder: 'e.g., Save 10 hours per week on bookkeeping',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'differentiator',
          title: 'What Makes You Different',
          description: 'Your unique advantage',
          timeAllocation: '15 seconds',
          questions: [
            {
              id: 'competitive-advantage',
              question: 'What makes you different from competitors?',
              placeholder: 'e.g., First AI-powered solution that learns your business patterns',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'call-to-action',
          title: 'Call to Action',
          description: 'What you want them to do next',
          timeAllocation: '15 seconds',
          questions: [
            {
              id: 'next-step',
              question: 'What would you like them to do next?',
              placeholder: 'e.g., I\'d love to show you a quick demo, or Can I send you our case study?',
              type: 'textarea',
              required: true
            }
          ]
        }
      ],
      tips: [
        'Keep it conversational, not salesy',
        'Practice different lengths (30s, 60s, 90s)',
        'Always end with a question or call to action',
        'Adapt based on who you\'re talking to'
      ],
      examples: [
        '"We\'re like Uber for dog walking - busy pet owners can book trusted walkers on-demand"',
        '"Think Shopify for restaurants - we help them create online ordering systems in minutes"'
      ]
    },
    {
      id: 'demo-day',
      title: 'Startup Demo Day Pitch',
      subtitle: 'Comprehensive presentation for investors',
      description: 'A detailed 5-7 minute pitch covering all aspects of your business. Perfect for demo days and investor presentations.',
      duration: '5-7 minutes',
      audience: 'Investors, Demo Days, Competitions',
      difficulty: 'Advanced',
      icon: Award,
      color: 'purple',
      bgGradient: 'from-purple-500 to-pink-500',
      features: [
        'Comprehensive coverage',
        'Investor-focused',
        'Data-driven',
        'Professional format'
      ],
      sections: [
        {
          id: 'problem-market',
          title: 'Problem & Market',
          description: 'Define the problem and market opportunity',
          timeAllocation: '60 seconds',
          questions: [
            {
              id: 'problem-description',
              question: 'Describe the problem you\'re solving',
              placeholder: 'e.g., 70% of small businesses struggle with cash flow management',
              type: 'textarea',
              required: true
            },
            {
              id: 'market-size',
              question: 'What is the market size?',
              placeholder: 'e.g., $50B global market, $5B addressable market',
              type: 'text',
              required: true
            },
            {
              id: 'target-customer-detailed',
              question: 'Who is your ideal customer?',
              placeholder: 'e.g., SaaS companies with $1M-$10M ARR',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'solution-product',
          title: 'Solution & Product',
          description: 'Your solution and product demonstration',
          timeAllocation: '90 seconds',
          questions: [
            {
              id: 'solution-overview',
              question: 'How does your solution work?',
              placeholder: 'e.g., AI-powered platform that predicts cash flow 90 days in advance',
              type: 'textarea',
              required: true
            },
            {
              id: 'key-features',
              question: 'What are your key features?',
              placeholder: 'e.g., Real-time analytics, automated reporting, predictive insights',
              type: 'textarea',
              required: true
            },
            {
              id: 'demo-highlight',
              question: 'What will you demonstrate?',
              placeholder: 'e.g., Show how a user can predict cash flow in 30 seconds',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'business-model',
          title: 'Business Model',
          description: 'How you make money',
          timeAllocation: '60 seconds',
          questions: [
            {
              id: 'revenue-model',
              question: 'How do you make money?',
              placeholder: 'e.g., SaaS subscription: $99/month per company',
              type: 'textarea',
              required: true
            },
            {
              id: 'unit-economics',
              question: 'What are your unit economics?',
              placeholder: 'e.g., $1,200 LTV, $200 CAC, 6:1 LTV/CAC ratio',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'traction-metrics',
          title: 'Traction & Metrics',
          description: 'Proof of product-market fit',
          timeAllocation: '90 seconds',
          questions: [
            {
              id: 'current-metrics',
              question: 'What are your current metrics?',
              placeholder: 'e.g., 500 customers, $50K MRR, 15% month-over-month growth',
              type: 'textarea',
              required: true
            },
            {
              id: 'key-partnerships',
              question: 'Do you have any key partnerships or customers?',
              placeholder: 'e.g., Partnership with Salesforce, customers include TechCorp',
              type: 'textarea',
              required: false
            }
          ]
        },
        {
          id: 'competition',
          title: 'Competition & Advantage',
          description: 'Competitive landscape and your edge',
          timeAllocation: '60 seconds',
          questions: [
            {
              id: 'main-competitors',
              question: 'Who are your main competitors?',
              placeholder: 'e.g., QuickBooks, FreshBooks, but they lack predictive analytics',
              type: 'textarea',
              required: true
            },
            {
              id: 'competitive-moat',
              question: 'What is your competitive moat?',
              placeholder: 'e.g., Proprietary AI algorithm, 2-year data advantage',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'team',
          title: 'Team',
          description: 'Why you\'re the right team to execute',
          timeAllocation: '45 seconds',
          questions: [
            {
              id: 'founder-background',
              question: 'What is your relevant background?',
              placeholder: 'e.g., 10 years at Goldman Sachs, built 3 fintech products',
              type: 'textarea',
              required: true
            },
            {
              id: 'team-strengths',
              question: 'What are your team\'s key strengths?',
              placeholder: 'e.g., Deep fintech expertise, strong technical background',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'financials-ask',
          title: 'Financials & Ask',
          description: 'Financial projections and funding request',
          timeAllocation: '75 seconds',
          questions: [
            {
              id: 'financial-projections',
              question: 'What are your 3-year projections?',
              placeholder: 'e.g., $10M ARR by year 3, 1000+ customers',
              type: 'textarea',
              required: true
            },
            {
              id: 'funding-request',
              question: 'How much are you raising?',
              placeholder: 'e.g., $5M Series A',
              type: 'text',
              required: true
            },
            {
              id: 'use-of-funds-detailed',
              question: 'How will you use the funds?',
              placeholder: 'e.g., 60% engineering, 30% sales & marketing, 10% operations',
              type: 'textarea',
              required: true
            }
          ]
        }
      ],
      tips: [
        'Tell a story that flows logically from problem to solution',
        'Use visuals and demos to make it engaging',
        'Practice transitions between sections',
        'Prepare for Q&A - know your numbers cold'
      ],
      examples: [
        'Follow the classic structure: Problem → Solution → Market → Product → Traction → Competition → Team → Financials → Ask',
        'Use the "10-20-30 rule": 10 slides, 20 minutes max, 30pt font minimum'
      ]
    },
    {
      id: 'seed-funding',
      title: 'Seed Round Funding Pitch',
      subtitle: 'Early-stage investor presentation',
      description: 'Focused on vision, early traction, and team. Perfect for seed investors who bet on potential.',
      duration: '3-5 minutes',
      audience: 'Seed Investors, Angel Groups',
      difficulty: 'Intermediate',
      icon: TrendingUp,
      color: 'green',
      bgGradient: 'from-green-500 to-emerald-500',
      features: [
        'Vision-focused',
        'Early traction emphasis',
        'Team credibility',
        'Clear milestones'
      ],
      sections: [
        {
          id: 'vision-mission',
          title: 'Vision & Mission',
          description: 'Your big picture vision',
          timeAllocation: '30 seconds',
          questions: [
            {
              id: 'company-vision',
              question: 'What is your company\'s vision?',
              placeholder: 'e.g., To democratize financial planning for everyone',
              type: 'textarea',
              required: true
            },
            {
              id: 'why-now',
              question: 'Why is now the right time for this solution?',
              placeholder: 'e.g., Remote work has created new financial planning needs',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'problem-solution-fit',
          title: 'Problem-Solution Fit',
          description: 'Evidence that you\'re solving a real problem',
          timeAllocation: '60 seconds',
          questions: [
            {
              id: 'customer-research',
              question: 'What customer research have you done?',
              placeholder: 'e.g., Interviewed 100 potential customers, 85% said they\'d pay for this',
              type: 'textarea',
              required: true
            },
            {
              id: 'early-validation',
              question: 'What early validation do you have?',
              placeholder: 'e.g., 500 people on waitlist, 50 beta users with 80% retention',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'product-roadmap',
          title: 'Product & Roadmap',
          description: 'Current product and future plans',
          timeAllocation: '60 seconds',
          questions: [
            {
              id: 'current-product',
              question: 'What have you built so far?',
              placeholder: 'e.g., MVP with core budgeting features, mobile app in beta',
              type: 'textarea',
              required: true
            },
            {
              id: 'product-roadmap',
              question: 'What\'s on your roadmap?',
              placeholder: 'e.g., AI recommendations, bank integrations, investment tracking',
              type: 'textarea',
              required: true
            }
          ]
        },
        {
          id: 'early-traction',
          title: 'Early Traction',
          description: 'Signs of product-market fit',
          timeAllocation: '45 seconds',
          questions: [
            {
              id: 'user-metrics',
              question: 'What are your user metrics?',
              placeholder: 'e.g., 1,000 users, 60% weekly retention, $5 ARPU',
              type: 'textarea',
              required: true
            },
            {
              id: 'growth-indicators',
              question: 'What growth indicators do you have?',
              placeholder: 'e.g., 40% organic growth, 4.5 app store rating',
              type: 'textarea',
              required: false
            }
          ]
        },
        {
          id: 'team-credentials',
          title: 'Team & Credentials',
          description: 'Why you\'re the right team',
          timeAllocation: '45 seconds',
          questions: [
            {
              id: 'founder-expertise',
              question: 'What relevant expertise do you have?',
              placeholder: 'e.g., Former fintech PM at Square, CPA with 8 years experience',
              type: 'textarea',
              required: true
            },
            {
              id: 'advisory-support',
              question: 'Do you have advisors or mentors?',
              placeholder: 'e.g., Advised by former Mint founder, backed by Techstars',
              type: 'textarea',
              required: false
            }
          ]
        },
        {
          id: 'funding-milestones',
          title: 'Funding & Milestones',
          description: 'What you need and what you\'ll achieve',
          timeAllocation: '60 seconds',
          questions: [
            {
              id: 'seed-amount',
              question: 'How much seed funding do you need?',
              placeholder: 'e.g., $1.5M seed round',
              type: 'text',
              required: true
            },
            {
              id: 'key-milestones',
              question: 'What milestones will this funding help you achieve?',
              placeholder: 'e.g., 10K users, $50K MRR, Series A readiness in 18 months',
              type: 'textarea',
              required: true
            },
            {
              id: 'runway-timeline',
              question: 'How long will this funding last?',
              placeholder: 'e.g., 18-24 months runway',
              type: 'text',
              required: true
            }
          ]
        }
      ],
      tips: [
        'Focus on potential and vision, not just current metrics',
        'Show you understand your market deeply',
        'Demonstrate coachability and learning ability',
        'Be realistic about timelines and milestones'
      ],
      examples: [
        'Emphasize the problem size and your unique insight',
        'Show early signs of product-market fit',
        'Highlight your unfair advantages or unique background'
      ]
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || template.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (selectedTemplate) {
    return (
      <TemplateForm
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    );
  }

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
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Pitch Templates</h1>
                  <p className="text-xs text-gray-500">Professional templates for every scenario</p>
                </div>
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
            Professional Pitch Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose from expertly crafted templates designed for different audiences and scenarios. 
            Each template guides you through proven frameworks used by successful startups.
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            
            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${template.bgGradient} p-6 text-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{template.title}</h3>
                        <p className="text-white/80 text-sm">{template.subtitle}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)} bg-white/20 text-white`}>
                      {template.difficulty}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{template.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{template.audience}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">{template.description}</p>
                  
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sections Preview */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Template Sections ({template.sections.length})
                    </h4>
                    <div className="space-y-2">
                      {template.sections.slice(0, 3).map((section, index) => (
                        <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{section.title}</span>
                          </div>
                          <span className="text-xs text-gray-500">{section.timeAllocation}</span>
                        </div>
                      ))}
                      {template.sections.length > 3 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-gray-500">
                            +{template.sections.length - 3} more sections
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r ${template.bgGradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Use This Template</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Tips for Using Templates</h2>
            <p className="text-gray-600">Get the most out of your pitch templates</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Customize for Your Audience</h3>
              <p className="text-sm text-gray-600">Adapt the template based on who you're pitching to. Investors care about different things than customers.</p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Practice Time Management</h3>
              <p className="text-sm text-gray-600">Use the time allocations as guidelines. Practice until you can hit each section within the suggested timeframe.</p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tell Your Story</h3>
              <p className="text-sm text-gray-600">Templates provide structure, but your unique story and passion make the pitch memorable.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplatesLibrary;