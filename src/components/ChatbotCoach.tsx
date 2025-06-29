import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Minimize2,
  Maximize2,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  BookOpen,
  Mic,
  FileText
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  suggestions?: string[];
}

interface ChatbotCoachProps {
  className?: string;
}

const ChatbotCoach: React.FC<ChatbotCoachProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Predefined quick suggestions
  const quickSuggestions = [
    "How do I explain my TAM?",
    "What's a good traction example?",
    "How to structure a 2-minute pitch?",
    "What investors look for in a team slide?",
    "How to handle pricing questions?",
    "What's a strong problem statement?",
    "How to show competitive advantage?",
    "Best practices for demo slides?"
  ];

  // Welcome message
  const welcomeMessage: ChatMessage = {
    id: 'welcome',
    type: 'bot',
    content: "👋 Hi! I'm your AI Pitch Coach. I can help you with startup terminology, pitch structure, investor questions, and more. What would you like to know?",
    timestamp: new Date(),
    suggestions: [
      "How do I explain my TAM?",
      "What's a good traction example?",
      "How to structure a pitch?",
      "Investor presentation tips"
    ]
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setHasInteracted(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await getChatbotResponse(content);
      
      // Remove typing indicator and add response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, response];
      });
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or check out our Startup Coach glossary for immediate help!",
        timestamp: new Date()
      };
      
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getChatbotResponse = async (userInput: string): Promise<ChatMessage> => {
    // Check if we're in demo mode or have OpenAI API key
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      return getDemoResponse(userInput);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert startup pitch coach and investor advisor. You help founders improve their pitches, understand startup terminology, and prepare for investor meetings. 

Key guidelines:
- Be concise but comprehensive (2-4 sentences max)
- Use specific examples when helpful
- Focus on actionable advice
- Reference real startup/investor practices
- Be encouraging but realistic
- If asked about specific terms, provide clear definitions with context

Topics you excel at:
- Pitch structure and storytelling
- Startup terminology (TAM, SAM, SOM, CAC, LTV, etc.)
- Investor psychology and what they look for
- Demo day presentations
- Fundraising strategies
- Market sizing and validation
- Competitive positioning
- Team building and hiring`
            },
            {
              role: 'user',
              content: userInput
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "I'm not sure how to help with that. Could you rephrase your question?";

      return {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        suggestions: generateSuggestions(userInput)
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return getDemoResponse(userInput);
    }
  };

  const getDemoResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    
    // TAM/Market Size questions
    if (input.includes('tam') || input.includes('market size') || input.includes('addressable market')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "TAM (Total Addressable Market) should be presented as: TAM → SAM → SOM. Start with the total market size ($50B), narrow to your serviceable market ($5B), then your obtainable share ($500M in 5 years). Use credible sources like Gartner or industry reports, and always explain your assumptions.",
        timestamp: new Date(),
        suggestions: ["How to calculate SAM?", "Best sources for market data?", "What's a realistic market share?"]
      };
    }

    // Traction questions
    if (input.includes('traction') || input.includes('growth') || input.includes('metrics')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "Strong traction examples: '10K users, 40% month-over-month growth' or '$50K MRR with 95% retention.' Focus on metrics that matter to your business model. For B2B: revenue, customer count, pipeline. For consumer: DAU/MAU, retention, engagement. Always show the trend, not just a snapshot.",
        timestamp: new Date(),
        suggestions: ["What metrics matter most?", "How to show growth trends?", "B2B vs B2C metrics?"]
      };
    }

    // Pitch structure questions
    if (input.includes('structure') || input.includes('organize') || input.includes('2-minute') || input.includes('pitch format')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "For a 2-minute pitch: Problem (20s) → Solution (30s) → Market & Traction (40s) → Team & Ask (30s). Start with a relatable problem, clearly state your solution, prove there's demand, then show why you'll win. End with a specific ask and timeline.",
        timestamp: new Date(),
        suggestions: ["How to hook investors quickly?", "What to include in team slide?", "How to end with strong ask?"]
      };
    }

    // Team/investor questions
    if (input.includes('team') || input.includes('investor') || input.includes('look for')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "Investors invest in people first, ideas second. Highlight relevant experience, previous successes, and domain expertise. Show why your team is uniquely qualified to solve this problem. Include advisors or notable supporters if you have them.",
        timestamp: new Date(),
        suggestions: ["How to show team credibility?", "What if I'm a first-time founder?", "Should I mention advisors?"]
      };
    }

    // Pricing questions
    if (input.includes('pricing') || input.includes('price') || input.includes('cost')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "When asked about pricing, be confident and specific. Explain your pricing strategy: 'We charge $99/month because our customers save $500/month.' Show you understand your value proposition and have tested pricing with real customers. Be ready to justify with unit economics.",
        timestamp: new Date(),
        suggestions: ["How to justify pricing?", "What about freemium models?", "Pricing for enterprise vs SMB?"]
      };
    }

    // Problem statement questions
    if (input.includes('problem') || input.includes('pain point')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "A strong problem statement is specific, urgent, and relatable. Use data: '73% of small businesses struggle with cash flow, leading to 82% of failures.' Make it personal - investors should think 'I've felt this pain' or 'I know someone who has.' Avoid generic problems.",
        timestamp: new Date(),
        suggestions: ["How to make problems relatable?", "Should I use personal stories?", "How much data to include?"]
      };
    }

    // Competition questions
    if (input.includes('competition') || input.includes('competitive') || input.includes('advantage')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "Never say 'we have no competition' - it shows you don't understand your market. Instead: 'Current solutions like X and Y exist, but they lack [specific capability]. Our advantage is [unique approach] which lets us [specific benefit].' Focus on why you'll win, not why others will lose.",
        timestamp: new Date(),
        suggestions: ["How to position against big players?", "What makes a strong moat?", "Direct vs indirect competitors?"]
      };
    }

    // Demo questions
    if (input.includes('demo') || input.includes('product') || input.includes('show')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "Keep demos short and focused on the 'wow' moment. Show, don't tell: 'Here's how a user solves their problem in 30 seconds.' Avoid feature tours - focus on the core value. Have a backup plan if tech fails. Practice the demo more than your slides.",
        timestamp: new Date(),
        suggestions: ["How long should demos be?", "What if the demo breaks?", "Live demo vs video?"]
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "That's a great question! I can help with pitch structure, startup terminology, investor relations, market sizing, traction metrics, and more. Could you be more specific about what aspect you'd like to explore?",
      timestamp: new Date(),
      suggestions: quickSuggestions.slice(0, 4)
    };
  };

  const generateSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase();
    
    if (input.includes('tam') || input.includes('market')) {
      return ["How to calculate SAM?", "Best market research sources?", "What's a realistic market share?"];
    }
    
    if (input.includes('traction')) {
      return ["What metrics matter most?", "How to show growth trends?", "Customer testimonials in pitches?"];
    }
    
    if (input.includes('pitch') || input.includes('structure')) {
      return ["How to hook investors?", "What makes a strong opening?", "How to handle Q&A?"];
    }
    
    return quickSuggestions.slice(0, 3);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
    setHasInteracted(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask your AI Pitch Coach
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Pitch Coach</h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasInteracted && (
              <button
                onClick={clearChat}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                          <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          
                          {message.type === 'bot' && !message.isTyping && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </span>
                              <button
                                onClick={() => copyMessage(message.content)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Copy message"
                              >
                                <Copy className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Suggestions */}
              {messages.length > 0 && messages[messages.length - 1]?.suggestions && !isLoading && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 px-2">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder="Ask about pitching, fundraising, metrics..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Quick Actions */}
              {!hasInteracted && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotCoach;