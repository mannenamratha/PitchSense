interface UserPattern {
  type: 'weakness' | 'strength' | 'trend' | 'missing_element';
  metric: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface PersonalizedSuggestion {
  id: string;
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
  category: 'delivery' | 'structure' | 'content' | 'confidence';
  icon: string;
  progress?: number;
  estimatedImpact: string;
}

interface AnalysisInsight {
  pattern: string;
  frequency: number;
  impact: string;
  recommendation: string;
}

class SuggestionService {
  /**
   * Generate personalized suggestions based on user's pitch history
   */
  generatePersonalizedSuggestions(pitches: any[]): PersonalizedSuggestion[] {
    if (pitches.length < 2) {
      return this.getBeginnerSuggestions();
    }

    const patterns = this.analyzeUserPatterns(pitches);
    const suggestions: PersonalizedSuggestion[] = [];

    // Analyze delivery patterns
    suggestions.push(...this.analyzeDeliveryPatterns(pitches, patterns));
    
    // Analyze structure patterns
    suggestions.push(...this.analyzeStructurePatterns(pitches, patterns));
    
    // Analyze content patterns
    suggestions.push(...this.analyzeContentPatterns(pitches, patterns));
    
    // Analyze confidence patterns
    suggestions.push(...this.analyzeConfidencePatterns(pitches, patterns));

    // Sort by priority and return top suggestions
    return suggestions
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority))
      .slice(0, 6);
  }

  /**
   * Analyze user patterns across all pitches
   */
  private analyzeUserPatterns(pitches: any[]): UserPattern[] {
    const patterns: UserPattern[] = [];
    
    // Analyze score trends
    const clarityScores = pitches.map(p => p.analysis.clarity.score);
    const toneScores = pitches.map(p => p.analysis.tone.score);
    const pacingScores = pitches.map(p => p.analysis.pacing.score);
    const structureScores = pitches.map(p => p.analysis.structure.score);

    // Check for consistent weaknesses
    if (this.getAverage(clarityScores) < 7) {
      patterns.push({
        type: 'weakness',
        metric: 'clarity',
        frequency: this.getConsistencyScore(clarityScores),
        severity: this.getSeverity(this.getAverage(clarityScores)),
        description: 'Consistently low clarity scores'
      });
    }

    if (this.getAverage(toneScores) < 7) {
      patterns.push({
        type: 'weakness',
        metric: 'tone',
        frequency: this.getConsistencyScore(toneScores),
        severity: this.getSeverity(this.getAverage(toneScores)),
        description: 'Tone needs improvement'
      });
    }

    if (this.getAverage(pacingScores) < 7) {
      patterns.push({
        type: 'weakness',
        metric: 'pacing',
        frequency: this.getConsistencyScore(pacingScores),
        severity: this.getSeverity(this.getAverage(pacingScores)),
        description: 'Pacing issues detected'
      });
    }

    // Analyze filler words trend
    const fillerWordPercentages = pitches.map(p => p.analysis.fillerWords.percentage);
    if (this.getAverage(fillerWordPercentages) > 8) {
      patterns.push({
        type: 'weakness',
        metric: 'fillerWords',
        frequency: this.getConsistencyScore(fillerWordPercentages),
        severity: 'high',
        description: 'High filler word usage'
      });
    }

    // Analyze missing structure elements
    const structureElements = [
      'hasIntroduction', 'hasProblemStatement', 'hasSolution', 
      'hasMarketSize', 'hasBusinessModel', 'hasTeam', 
      'hasTraction', 'hasFinancials', 'hasAsk'
    ];

    structureElements.forEach(element => {
      const missingCount = pitches.filter(p => !p.analysis.structure[element]).length;
      const missingPercentage = (missingCount / pitches.length) * 100;
      
      if (missingPercentage > 60) {
        patterns.push({
          type: 'missing_element',
          metric: element,
          frequency: missingPercentage,
          severity: missingPercentage > 80 ? 'high' : 'medium',
          description: `Often missing ${element.replace('has', '').toLowerCase()}`
        });
      }
    });

    return patterns;
  }

  /**
   * Analyze delivery-related patterns
   */
  private analyzeDeliveryPatterns(pitches: any[], patterns: UserPattern[]): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    // Clarity issues
    const clarityPattern = patterns.find(p => p.metric === 'clarity');
    if (clarityPattern) {
      suggestions.push({
        id: 'clarity-improvement',
        title: 'Improve Speech Clarity',
        description: 'Your speech clarity has been consistently below optimal levels. Focus on articulation and pronunciation.',
        actionItems: [
          'Practice tongue twisters for 5 minutes before pitching',
          'Speak 20% slower than your natural pace',
          'Record yourself reading aloud and listen for unclear words',
          'Focus on opening your mouth wider when speaking'
        ],
        priority: clarityPattern.severity === 'high' ? 'high' : 'medium',
        category: 'delivery',
        icon: 'volume-2',
        estimatedImpact: 'High - Clear speech builds credibility and trust'
      });
    }

    // Pacing issues
    const pacingPattern = patterns.find(p => p.metric === 'pacing');
    if (pacingPattern) {
      const avgPacing = this.getAverage(pitches.map(p => p.analysis.pacing.score));
      const isRushing = avgPacing < 6;
      
      suggestions.push({
        id: 'pacing-improvement',
        title: isRushing ? 'Slow Down Your Delivery' : 'Improve Your Pacing',
        description: isRushing 
          ? 'You tend to rush through your pitches. Slowing down will help your audience absorb key information.'
          : 'Work on varying your speaking pace to maintain audience engagement.',
        actionItems: isRushing ? [
          'Add 2-3 second pauses after key points',
          'Practice with a metronome at 120 BPM',
          'Take a breath before starting each new section',
          'Use the "pause and emphasize" technique for important numbers'
        ] : [
          'Vary your pace - slow for important points, faster for transitions',
          'Use strategic pauses to build suspense',
          'Practice with different tempo sections',
          'Record yourself and mark where pace changes would help'
        ],
        priority: 'medium',
        category: 'delivery',
        icon: 'clock',
        estimatedImpact: 'Medium - Better pacing improves comprehension'
      });
    }

    // Filler words
    const fillerPattern = patterns.find(p => p.metric === 'fillerWords');
    if (fillerPattern) {
      suggestions.push({
        id: 'filler-words-reduction',
        title: 'Reduce Filler Words',
        description: 'You use filler words frequently, which can undermine your confidence and message clarity.',
        actionItems: [
          'Practice the "pause instead of um" technique',
          'Record yourself and count filler words',
          'Use the "silent pause" method when thinking',
          'Practice your pitch until you can deliver it without notes'
        ],
        priority: 'high',
        category: 'confidence',
        icon: 'message-square',
        estimatedImpact: 'High - Eliminating fillers dramatically improves perceived expertise'
      });
    }

    return suggestions;
  }

  /**
   * Analyze structure-related patterns
   */
  private analyzeStructurePatterns(pitches: any[], patterns: UserPattern[]): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    // Missing market size
    const missingMarketSize = patterns.find(p => p.metric === 'hasMarketSize');
    if (missingMarketSize) {
      suggestions.push({
        id: 'add-market-size',
        title: 'Include Market Size Data',
        description: 'You often skip market size information. Investors need to understand the opportunity scale.',
        actionItems: [
          'Research your Total Addressable Market (TAM)',
          'Include Serviceable Addressable Market (SAM)',
          'Use credible sources like Gartner, IDC, or industry reports',
          'Present market size early in your pitch (slide 3-4)'
        ],
        priority: 'high',
        category: 'structure',
        icon: 'trending-up',
        estimatedImpact: 'Very High - Market size is crucial for investment decisions'
      });
    }

    // Missing team information
    const missingTeam = patterns.find(p => p.metric === 'hasTeam');
    if (missingTeam) {
      suggestions.push({
        id: 'add-team-info',
        title: 'Highlight Your Team',
        description: 'You rarely mention your team credentials. Investors invest in people as much as ideas.',
        actionItems: [
          'Introduce key team members and their relevant experience',
          'Highlight previous successes and domain expertise',
          'Mention advisors or notable supporters',
          'Show why your team is uniquely qualified to solve this problem'
        ],
        priority: 'high',
        category: 'structure',
        icon: 'users',
        estimatedImpact: 'Very High - Team credibility is essential for investor confidence'
      });
    }

    // Missing traction
    const missingTraction = patterns.find(p => p.metric === 'hasTraction');
    if (missingTraction) {
      suggestions.push({
        id: 'add-traction',
        title: 'Showcase Your Traction',
        description: 'Include concrete evidence of customer validation and business momentum.',
        actionItems: [
          'Share customer numbers, revenue, or user growth',
          'Include customer testimonials or case studies',
          'Mention partnerships or pilot programs',
          'Show month-over-month growth metrics'
        ],
        priority: 'high',
        category: 'content',
        icon: 'bar-chart-3',
        estimatedImpact: 'Very High - Traction proves market demand'
      });
    }

    // Missing business model
    const missingBusinessModel = patterns.find(p => p.metric === 'hasBusinessModel');
    if (missingBusinessModel) {
      suggestions.push({
        id: 'add-business-model',
        title: 'Explain Your Business Model',
        description: 'Clearly articulate how you make money and your path to profitability.',
        actionItems: [
          'Define your revenue streams clearly',
          'Explain your pricing strategy',
          'Show unit economics and customer lifetime value',
          'Outline your path to profitability'
        ],
        priority: 'medium',
        category: 'structure',
        icon: 'dollar-sign',
        estimatedImpact: 'High - Investors need to understand monetization'
      });
    }

    return suggestions;
  }

  /**
   * Analyze content-related patterns
   */
  private analyzeContentPatterns(pitches: any[], patterns: UserPattern[]): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    // Analyze pitch length patterns
    const avgWordCount = this.getAverage(pitches.map(p => p.analysis.wordCount));
    const avgDuration = this.getAverage(pitches.map(p => p.analysis.estimatedDuration));

    if (avgWordCount < 150) {
      suggestions.push({
        id: 'expand-content',
        title: 'Expand Your Pitch Content',
        description: 'Your pitches tend to be quite brief. Adding more detail could strengthen your message.',
        actionItems: [
          'Aim for 200-300 words for a 2-3 minute pitch',
          'Add specific examples and use cases',
          'Include more concrete data and metrics',
          'Elaborate on your competitive advantages'
        ],
        priority: 'medium',
        category: 'content',
        icon: 'file-text',
        estimatedImpact: 'Medium - More detail builds stronger cases'
      });
    } else if (avgWordCount > 400) {
      suggestions.push({
        id: 'condense-content',
        title: 'Make Your Pitch More Concise',
        description: 'Your pitches tend to be lengthy. Focus on the most impactful points.',
        actionItems: [
          'Identify your 3 most important points',
          'Remove redundant information',
          'Use the "So what?" test for each statement',
          'Practice the elevator pitch version (30 seconds)'
        ],
        priority: 'medium',
        category: 'content',
        icon: 'scissors',
        estimatedImpact: 'Medium - Concise pitches maintain attention'
      });
    }

    // Analyze improvement trends
    const recentPitches = pitches.slice(0, Math.min(5, pitches.length));
    const olderPitches = pitches.slice(5);
    
    if (olderPitches.length > 0) {
      const recentAvg = this.getAverage(recentPitches.map(p => p.analysis.overallScore));
      const olderAvg = this.getAverage(olderPitches.map(p => p.analysis.overallScore));
      
      if (recentAvg < olderAvg - 0.5) {
        suggestions.push({
          id: 'performance-decline',
          title: 'Reverse Performance Decline',
          description: 'Your recent pitches have scored lower than earlier ones. Let\'s get back on track.',
          actionItems: [
            'Review your best-performing pitch and identify what worked',
            'Practice more regularly to maintain momentum',
            'Focus on fundamentals: clarity, structure, and confidence',
            'Consider if you\'re trying too many new things at once'
          ],
          priority: 'high',
          category: 'confidence',
          icon: 'alert-triangle',
          estimatedImpact: 'High - Consistent performance builds investor confidence'
        });
      }
    }

    return suggestions;
  }

  /**
   * Analyze confidence-related patterns
   */
  private analyzeConfidencePatterns(pitches: any[], patterns: UserPattern[]): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    // Tone analysis
    const tonePattern = patterns.find(p => p.metric === 'tone');
    if (tonePattern) {
      suggestions.push({
        id: 'improve-tone',
        title: 'Enhance Your Speaking Tone',
        description: 'Your tone could be more engaging and confident to better connect with investors.',
        actionItems: [
          'Practice with more vocal variety and enthusiasm',
          'Record yourself and listen for monotone sections',
          'Use the "smile while speaking" technique',
          'Practice power poses before pitching to boost confidence'
        ],
        priority: 'medium',
        category: 'confidence',
        icon: 'mic',
        estimatedImpact: 'Medium - Confident tone builds trust and engagement'
      });
    }

    // Language consistency
    const languages = [...new Set(pitches.map(p => p.language))];
    if (languages.length > 1) {
      const englishPitches = pitches.filter(p => p.language === 'English');
      const nonEnglishPitches = pitches.filter(p => p.language !== 'English');
      
      if (englishPitches.length > 0 && nonEnglishPitches.length > 0) {
        const englishAvg = this.getAverage(englishPitches.map(p => p.analysis.overallScore));
        const nonEnglishAvg = this.getAverage(nonEnglishPitches.map(p => p.analysis.overallScore));
        
        if (englishAvg > nonEnglishAvg + 1) {
          suggestions.push({
            id: 'multilingual-practice',
            title: 'Improve Non-English Pitches',
            description: 'Your English pitches score higher. Practice more in your other languages.',
            actionItems: [
              'Practice key phrases in your native language',
              'Focus on technical terms translation',
              'Record yourself in different languages',
              'Consider which language feels most natural for business terms'
            ],
            priority: 'low',
            category: 'delivery',
            icon: 'globe',
            estimatedImpact: 'Medium - Consistent performance across languages'
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Get beginner suggestions for new users
   */
  private getBeginnerSuggestions(): PersonalizedSuggestion[] {
    return [
      {
        id: 'beginner-structure',
        title: 'Master the Basic Pitch Structure',
        description: 'Start with a proven framework to organize your thoughts effectively.',
        actionItems: [
          'Follow the Problem → Solution → Market → Team → Traction structure',
          'Spend 30 seconds on the problem to create urgency',
          'Clearly state your solution in one sentence',
          'Always end with a specific ask'
        ],
        priority: 'high',
        category: 'structure',
        icon: 'layout',
        estimatedImpact: 'Very High - Structure is the foundation of great pitches'
      },
      {
        id: 'beginner-practice',
        title: 'Build Your Practice Routine',
        description: 'Regular practice is key to improvement. Start with short, frequent sessions.',
        actionItems: [
          'Practice for 10 minutes daily',
          'Record yourself to identify areas for improvement',
          'Start with a 1-minute elevator pitch',
          'Gradually expand to 3-5 minute presentations'
        ],
        priority: 'high',
        category: 'confidence',
        icon: 'repeat',
        estimatedImpact: 'High - Consistent practice builds confidence and fluency'
      },
      {
        id: 'beginner-clarity',
        title: 'Focus on Clear Communication',
        description: 'Clarity is more important than complexity when starting out.',
        actionItems: [
          'Use simple, jargon-free language',
          'Speak 20% slower than feels natural',
          'Pause between key points',
          'Make eye contact with your imaginary audience'
        ],
        priority: 'medium',
        category: 'delivery',
        icon: 'target',
        estimatedImpact: 'High - Clear communication ensures your message is understood'
      }
    ];
  }

  /**
   * Helper methods
   */
  private getAverage(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private getConsistencyScore(numbers: number[]): number {
    const avg = this.getAverage(numbers);
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - avg, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  private getSeverity(score: number): 'low' | 'medium' | 'high' {
    if (score < 5) return 'high';
    if (score < 7) return 'medium';
    return 'low';
  }

  private getPriorityWeight(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  }

  /**
   * Get insights for specific patterns
   */
  getPatternInsights(pitches: any[]): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];

    if (pitches.length < 3) return insights;

    // Analyze timing patterns
    const introSpeeds = pitches.map(p => {
      const words = p.transcript.split(' ').slice(0, 20);
      return words.length / (p.analysis.estimatedDuration * 0.2); // First 20% of pitch
    });

    if (this.getAverage(introSpeeds) > 3) {
      insights.push({
        pattern: 'Fast Introduction',
        frequency: 80,
        impact: 'Medium',
        recommendation: 'You tend to rush your introductions. Try pausing more in the first 15 seconds to let your opening statement sink in.'
      });
    }

    // Analyze structure consistency
    const missingMarketSize = pitches.filter(p => !p.analysis.structure.hasMarketSize).length;
    if (missingMarketSize / pitches.length > 0.6) {
      insights.push({
        pattern: 'Missing Market Size',
        frequency: Math.round((missingMarketSize / pitches.length) * 100),
        impact: 'High',
        recommendation: 'You often skip the market size slide — include it for more impact. Investors need to understand the opportunity scale.'
      });
    }

    // Analyze confidence patterns
    const lowToneScores = pitches.filter(p => p.analysis.tone.score < 7).length;
    if (lowToneScores / pitches.length > 0.5) {
      insights.push({
        pattern: 'Confidence Issues',
        frequency: Math.round((lowToneScores / pitches.length) * 100),
        impact: 'High',
        recommendation: 'Your tone suggests lower confidence. Practice power poses before pitching and speak with more vocal variety.'
      });
    }

    return insights;
  }
}

export const suggestionService = new SuggestionService();
export type { PersonalizedSuggestion, AnalysisInsight, UserPattern };