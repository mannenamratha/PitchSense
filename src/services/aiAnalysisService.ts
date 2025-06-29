interface PitchAnalysis {
  overallScore: number;
  clarity: {
    score: number;
    feedback: string;
  };
  tone: {
    score: number;
    feedback: string;
  };
  pacing: {
    score: number;
    feedback: string;
    wordsPerMinute: number;
  };
  fillerWords: {
    count: number;
    percentage: number;
    examples: string[];
    detectedWords: Array<{
      word: string;
      count: number;
      timestamps?: number[];
    }>;
  };
  structure: {
    score: number;
    feedback: string;
    hasIntroduction: boolean;
    hasProblemStatement: boolean;
    hasSolution: boolean;
    hasMarketSize: boolean;
    hasBusinessModel: boolean;
    hasTeam: boolean;
    hasTraction: boolean;
    hasFinancials: boolean;
    hasAsk: boolean;
  };
  improvements: string[];
  missingElements: string[];
  strengths: string[];
  smartTips: Array<{
    category: 'delivery' | 'content' | 'structure' | 'engagement';
    tip: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
  wordCount: number;
  estimatedDuration: number;
  confidenceLevel: number;
  engagementScore: number;
  professionalismScore: number;
}

interface AnalysisError {
  error: string;
  message: string;
}

class AIAnalysisService {
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly DEMO_MODE = true; // Set to false when you have OpenAI API key

  // Common filler words in multiple languages
  private readonly FILLER_WORDS = {
    'en': ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally', 'right', 'okay', 'well', 'I mean', 'sort of', 'kind of'],
    'hi': ['अरे', 'वो', 'मतलब', 'यानी', 'बस', 'तो', 'अच्छा'],
    'fr': ['euh', 'ben', 'alors', 'donc', 'en fait', 'tu vois', 'quoi'],
    'es': ['eh', 'este', 'bueno', 'entonces', 'o sea', 'pues', 'vale'],
    'de': ['äh', 'ähm', 'also', 'ja', 'nun', 'eigentlich'],
    'it': ['ehm', 'allora', 'dunque', 'insomma', 'diciamo', 'ecco'],
    'pt': ['né', 'então', 'tipo', 'assim', 'quer dizer', 'enfim']
  };

  /**
   * Analyze pitch using advanced AI analysis
   */
  async analyzePitch(transcript: string, language: string = 'en', duration?: number): Promise<PitchAnalysis | AnalysisError> {
    try {
      if (!transcript.trim()) {
        throw new Error('No transcript provided for analysis');
      }

      // In demo mode, return comprehensive simulated analysis
      if (this.DEMO_MODE) {
        return this.generateComprehensiveAnalysis(transcript, language, duration);
      }

      // Real OpenAI API call (requires API key)
      return await this.callOpenAIAPI(transcript, language, duration);

    } catch (error) {
      console.error('AI Analysis error:', error);
      return {
        error: 'analysis_failed',
        message: error instanceof Error ? error.message : 'AI analysis service unavailable'
      };
    }
  }

  /**
   * Generate comprehensive demo analysis
   */
  private generateComprehensiveAnalysis(transcript: string, language: string = 'en', duration?: number): PitchAnalysis {
    const words = transcript.trim().split(/\s+/);
    const wordCount = words.length;
    const estimatedDuration = duration || Math.round(wordCount / 150 * 60); // Assuming 150 WPM
    const actualWPM = duration ? Math.round((wordCount / duration) * 60) : 150;

    // Advanced filler word detection
    const fillerWordAnalysis = this.analyzeFillerWords(transcript, language);
    
    // Structure analysis
    const structureAnalysis = this.analyzeStructure(transcript);
    
    // Tone and engagement analysis
    const toneAnalysis = this.analyzeTone(transcript);
    
    // Calculate comprehensive scores
    const clarityScore = this.calculateClarityScore(transcript, fillerWordAnalysis);
    const toneScore = toneAnalysis.score;
    const pacingScore = this.calculatePacingScore(actualWPM, wordCount);
    const structureScore = structureAnalysis.score;
    
    const overallScore = Math.round((clarityScore + toneScore + pacingScore + structureScore) / 4 * 10) / 10;

    // Generate smart tips
    const smartTips = this.generateSmartTips(transcript, {
      clarity: clarityScore,
      tone: toneScore,
      pacing: pacingScore,
      structure: structureScore,
      fillerWords: fillerWordAnalysis,
      wpm: actualWPM
    });

    // Generate improvements and strengths
    const improvements = this.generateImprovements(transcript, clarityScore, toneScore, pacingScore, structureScore, fillerWordAnalysis);
    const strengths = this.generateStrengths(transcript, clarityScore, toneScore, pacingScore, structureScore);
    const missingElements = this.generateMissingElements(structureAnalysis);

    return {
      overallScore,
      clarity: {
        score: Math.round(clarityScore * 10) / 10,
        feedback: this.getClarityFeedback(clarityScore, fillerWordAnalysis)
      },
      tone: {
        score: Math.round(toneScore * 10) / 10,
        feedback: this.getToneFeedback(toneScore, toneAnalysis)
      },
      pacing: {
        score: Math.round(pacingScore * 10) / 10,
        feedback: this.getPacingFeedback(pacingScore, actualWPM),
        wordsPerMinute: actualWPM
      },
      fillerWords: fillerWordAnalysis,
      structure: {
        score: Math.round(structureScore * 10) / 10,
        feedback: this.getStructureFeedback(structureScore, structureAnalysis),
        ...structureAnalysis.elements
      },
      improvements,
      missingElements,
      strengths,
      smartTips,
      wordCount,
      estimatedDuration,
      confidenceLevel: this.calculateConfidenceLevel(transcript, toneAnalysis),
      engagementScore: this.calculateEngagementScore(transcript),
      professionalismScore: this.calculateProfessionalismScore(transcript, fillerWordAnalysis)
    };
  }

  /**
   * Advanced filler word analysis
   */
  private analyzeFillerWords(transcript: string, language: string) {
    const langCode = language.split('-')[0];
    const fillerWords = this.FILLER_WORDS[langCode as keyof typeof this.FILLER_WORDS] || this.FILLER_WORDS.en;
    
    const words = transcript.toLowerCase().split(/\s+/);
    const detectedWords: Array<{ word: string; count: number }> = [];
    let totalFillerCount = 0;

    fillerWords.forEach(filler => {
      const count = words.filter(word => 
        word.includes(filler.toLowerCase()) || 
        this.isFillerVariant(word, filler)
      ).length;
      
      if (count > 0) {
        detectedWords.push({ word: filler, count });
        totalFillerCount += count;
      }
    });

    // Sort by frequency
    detectedWords.sort((a, b) => b.count - a.count);

    return {
      count: totalFillerCount,
      percentage: Math.round((totalFillerCount / words.length) * 100 * 10) / 10,
      examples: detectedWords.slice(0, 5).map(item => item.word),
      detectedWords: detectedWords.slice(0, 10)
    };
  }

  /**
   * Check if word is a variant of filler word
   */
  private isFillerVariant(word: string, filler: string): boolean {
    // Handle variations like "umm", "uhhh", "sooo"
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    const cleanFiller = filler.toLowerCase();
    
    if (cleanWord === cleanFiller) return true;
    if (cleanWord.startsWith(cleanFiller) && cleanWord.length <= cleanFiller.length + 2) return true;
    
    return false;
  }

  /**
   * Analyze pitch structure
   */
  private analyzeStructure(transcript: string) {
    const lowerText = transcript.toLowerCase();
    
    const elements = {
      hasIntroduction: this.hasIntroduction(lowerText),
      hasProblemStatement: this.hasProblemStatement(lowerText),
      hasSolution: this.hasSolution(lowerText),
      hasMarketSize: this.hasMarketSize(lowerText),
      hasBusinessModel: this.hasBusinessModel(lowerText),
      hasTeam: this.hasTeam(lowerText),
      hasTraction: this.hasTraction(lowerText),
      hasFinancials: this.hasFinancials(lowerText),
      hasAsk: this.hasAsk(lowerText)
    };

    const presentElements = Object.values(elements).filter(Boolean).length;
    const score = (presentElements / Object.keys(elements).length) * 10;

    return { elements, score };
  }

  /**
   * Structure detection methods
   */
  private hasIntroduction(text: string): boolean {
    const introPatterns = [
      /\b(hello|hi|good morning|good afternoon|good evening|welcome|thank you|thanks)\b/,
      /\b(my name is|i'm|i am|we are|our company)\b/,
      /\b(today|this morning|this afternoon)\b/
    ];
    return introPatterns.some(pattern => pattern.test(text));
  }

  private hasProblemStatement(text: string): boolean {
    const problemPatterns = [
      /\b(problem|issue|challenge|pain point|struggle|difficulty)\b/,
      /\b(customers face|users experience|people have trouble)\b/,
      /\b(current solutions|existing tools|status quo)\b/
    ];
    return problemPatterns.some(pattern => pattern.test(text));
  }

  private hasSolution(text: string): boolean {
    const solutionPatterns = [
      /\b(solution|solve|address|fix|resolve)\b/,
      /\b(our product|our platform|our service|our app)\b/,
      /\b(we built|we created|we developed|we offer)\b/
    ];
    return solutionPatterns.some(pattern => pattern.test(text));
  }

  private hasMarketSize(text: string): boolean {
    const marketPatterns = [
      /\b(market|tam|sam|som|addressable market)\b/,
      /\b(\$\d+|\d+\s*(billion|million|trillion))\b/,
      /\b(market size|market opportunity|industry)\b/
    ];
    return marketPatterns.some(pattern => pattern.test(text));
  }

  private hasBusinessModel(text: string): boolean {
    const businessPatterns = [
      /\b(revenue|business model|monetize|pricing|subscription)\b/,
      /\b(customers pay|charge|fee|cost)\b/,
      /\b(saas|freemium|marketplace|commission)\b/
    ];
    return businessPatterns.some(pattern => pattern.test(text));
  }

  private hasTeam(text: string): boolean {
    const teamPatterns = [
      /\b(team|founder|co-founder|ceo|cto|experience)\b/,
      /\b(background|worked at|previously|expertise)\b/,
      /\b(years of experience|built|led|managed)\b/
    ];
    return teamPatterns.some(pattern => pattern.test(text));
  }

  private hasTraction(text: string): boolean {
    const tractionPatterns = [
      /\b(customers|users|growth|traction|revenue)\b/,
      /\b(\d+\s*(customers|users|downloads|signups))\b/,
      /\b(month over month|year over year|growing)\b/
    ];
    return tractionPatterns.some(pattern => pattern.test(text));
  }

  private hasFinancials(text: string): boolean {
    const financialPatterns = [
      /\b(revenue|profit|loss|financial|projections)\b/,
      /\b(arr|mrr|ltv|cac|unit economics)\b/,
      /\b(\$\d+.*revenue|\d+.*profit)\b/
    ];
    return financialPatterns.some(pattern => pattern.test(text));
  }

  private hasAsk(text: string): boolean {
    const askPatterns = [
      /\b(raising|seeking|funding|investment|round)\b/,
      /\b(series a|series b|seed|pre-seed)\b/,
      /\b(\$\d+.*raise|\d+.*million.*funding)\b/
    ];
    return askPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Analyze tone and emotional content
   */
  private analyzeTone(transcript: string) {
    const text = transcript.toLowerCase();
    
    // Confidence indicators
    const confidenceWords = ['confident', 'certain', 'sure', 'proven', 'successful', 'strong', 'excellent', 'outstanding'];
    const uncertaintyWords = ['maybe', 'perhaps', 'might', 'could', 'possibly', 'hopefully', 'probably'];
    
    // Enthusiasm indicators
    const enthusiasmWords = ['excited', 'thrilled', 'amazing', 'incredible', 'fantastic', 'revolutionary', 'breakthrough'];
    const passiveWords = ['okay', 'fine', 'decent', 'alright', 'not bad'];
    
    // Professional language
    const professionalWords = ['strategy', 'methodology', 'framework', 'optimize', 'leverage', 'implement', 'execute'];
    const casualWords = ['stuff', 'things', 'kinda', 'sorta', 'whatever', 'anyway'];

    const confidenceScore = this.calculateWordScore(text, confidenceWords, uncertaintyWords);
    const enthusiasmScore = this.calculateWordScore(text, enthusiasmWords, passiveWords);
    const professionalScore = this.calculateWordScore(text, professionalWords, casualWords);

    const overallToneScore = (confidenceScore + enthusiasmScore + professionalScore) / 3;

    return {
      score: Math.max(1, Math.min(10, overallToneScore)),
      confidence: confidenceScore,
      enthusiasm: enthusiasmScore,
      professionalism: professionalScore
    };
  }

  /**
   * Calculate word-based scores
   */
  private calculateWordScore(text: string, positiveWords: string[], negativeWords: string[]): number {
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    const baseScore = 6; // Neutral baseline
    const positiveBoost = positiveCount * 0.5;
    const negativePenalty = negativeCount * 0.3;
    
    return Math.max(1, Math.min(10, baseScore + positiveBoost - negativePenalty));
  }

  /**
   * Calculate clarity score based on various factors
   */
  private calculateClarityScore(transcript: string, fillerWords: any): number {
    const words = transcript.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Factors affecting clarity
    const fillerPenalty = Math.min(3, fillerWords.percentage * 0.3);
    const complexityBonus = avgWordLength > 6 ? -0.5 : avgWordLength < 4 ? -0.5 : 0.5;
    const lengthBonus = words.length > 50 ? 0.5 : words.length < 20 ? -1 : 0;
    
    const baseScore = 7;
    return Math.max(1, Math.min(10, baseScore - fillerPenalty + complexityBonus + lengthBonus));
  }

  /**
   * Calculate pacing score based on WPM
   */
  private calculatePacingScore(wpm: number, wordCount: number): number {
    // Optimal range: 140-180 WPM for presentations
    let score = 7;
    
    if (wpm >= 140 && wpm <= 180) {
      score = 9; // Excellent pacing
    } else if (wpm >= 120 && wpm <= 200) {
      score = 8; // Good pacing
    } else if (wpm >= 100 && wpm <= 220) {
      score = 6; // Acceptable pacing
    } else if (wpm < 100) {
      score = 4; // Too slow
    } else {
      score = 3; // Too fast
    }

    // Adjust for very short pitches
    if (wordCount < 30) {
      score = Math.max(score - 2, 1);
    }

    return score;
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidenceLevel(transcript: string, toneAnalysis: any): number {
    const questionMarks = (transcript.match(/\?/g) || []).length;
    const exclamations = (transcript.match(/!/g) || []).length;
    const hedgingWords = ['maybe', 'perhaps', 'might', 'could', 'possibly'].filter(word => 
      transcript.toLowerCase().includes(word)
    ).length;

    let confidence = toneAnalysis.confidence;
    confidence -= questionMarks * 0.2;
    confidence += exclamations * 0.1;
    confidence -= hedgingWords * 0.3;

    return Math.max(1, Math.min(10, confidence));
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(transcript: string): number {
    const engagementWords = ['you', 'your', 'imagine', 'picture', 'think about', 'consider', 'what if'];
    const questions = (transcript.match(/\?/g) || []).length;
    const directAddress = engagementWords.filter(word => 
      transcript.toLowerCase().includes(word)
    ).length;

    const baseScore = 6;
    const questionBonus = Math.min(2, questions * 0.5);
    const addressBonus = Math.min(2, directAddress * 0.3);

    return Math.max(1, Math.min(10, baseScore + questionBonus + addressBonus));
  }

  /**
   * Calculate professionalism score
   */
  private calculateProfessionalismScore(transcript: string, fillerWords: any): number {
    const professionalTerms = ['strategy', 'methodology', 'framework', 'optimize', 'leverage', 'roi', 'kpi'];
    const casualTerms = ['stuff', 'things', 'kinda', 'sorta', 'whatever', 'like totally'];
    
    const professionalCount = professionalTerms.filter(term => 
      transcript.toLowerCase().includes(term)
    ).length;
    const casualCount = casualTerms.filter(term => 
      transcript.toLowerCase().includes(term)
    ).length;

    let score = 7;
    score += professionalCount * 0.3;
    score -= casualCount * 0.5;
    score -= fillerWords.percentage * 0.1;

    return Math.max(1, Math.min(10, score));
  }

  /**
   * Generate smart tips based on analysis
   */
  private generateSmartTips(transcript: string, scores: any): Array<{
    category: 'delivery' | 'content' | 'structure' | 'engagement';
    tip: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }> {
    const tips = [];

    // Delivery tips
    if (scores.clarity < 7) {
      tips.push({
        category: 'delivery' as const,
        tip: `Reduce filler words (currently ${scores.fillerWords.percentage}%). Practice pausing instead of saying "um" or "uh".`,
        priority: 'high' as const,
        actionable: true
      });
    }

    if (scores.pacing < 6) {
      if (scores.wpm > 200) {
        tips.push({
          category: 'delivery' as const,
          tip: `Slow down your speaking pace. You're speaking at ${scores.wpm} WPM - aim for 140-180 WPM.`,
          priority: 'high' as const,
          actionable: true
        });
      } else if (scores.wpm < 120) {
        tips.push({
          category: 'delivery' as const,
          tip: `Increase your speaking pace slightly. You're at ${scores.wpm} WPM - aim for 140-180 WPM.`,
          priority: 'medium' as const,
          actionable: true
        });
      }
    }

    // Content tips
    if (scores.tone < 7) {
      tips.push({
        category: 'content' as const,
        tip: 'Add more confident language and enthusiasm. Use words like "proven", "successful", and "excited".',
        priority: 'medium' as const,
        actionable: true
      });
    }

    // Structure tips
    if (scores.structure < 8) {
      tips.push({
        category: 'structure' as const,
        tip: 'Follow the classic pitch structure: Problem → Solution → Market → Traction → Team → Ask.',
        priority: 'high' as const,
        actionable: true
      });
    }

    // Engagement tips
    const questionCount = (transcript.match(/\?/g) || []).length;
    if (questionCount === 0) {
      tips.push({
        category: 'engagement' as const,
        tip: 'Include rhetorical questions to engage your audience. Try "What if I told you..." or "Imagine if..."',
        priority: 'low' as const,
        actionable: true
      });
    }

    return tips.slice(0, 6); // Return top 6 tips
  }

  /**
   * Generate feedback text for each category
   */
  private getClarityFeedback(score: number, fillerWords: any): string {
    if (score >= 8) {
      return 'Excellent clarity and articulation. Your speech is crisp and easy to follow.';
    } else if (score >= 6) {
      return `Good clarity with room for improvement. ${fillerWords.percentage > 5 ? 'Consider reducing filler words.' : 'Focus on speaking more slowly and clearly.'}`;
    } else {
      return `Clarity needs improvement. You have ${fillerWords.percentage}% filler words. Practice speaking more slowly and pause instead of using fillers.`;
    }
  }

  private getToneFeedback(score: number, toneAnalysis: any): string {
    if (score >= 8) {
      return 'Confident and engaging tone that builds trust with your audience.';
    } else if (score >= 6) {
      return 'Professional tone with room for more enthusiasm and confidence.';
    } else {
      return 'Work on sounding more confident and enthusiastic. Use stronger, more positive language.';
    }
  }

  private getPacingFeedback(score: number, wpm: number): string {
    if (score >= 8) {
      return `Excellent pacing at ${wpm} WPM. Perfect rhythm for audience comprehension.`;
    } else if (wpm > 200) {
      return `Speaking too fast at ${wpm} WPM. Slow down to 140-180 WPM for better comprehension.`;
    } else if (wpm < 120) {
      return `Speaking too slowly at ${wpm} WPM. Increase pace to 140-180 WPM to maintain engagement.`;
    } else {
      return `Good pacing at ${wpm} WPM. Consider varying your speed for emphasis.`;
    }
  }

  private getStructureFeedback(score: number, structureAnalysis: any): string {
    const presentElements = Object.values(structureAnalysis.elements).filter(Boolean).length;
    const totalElements = Object.keys(structureAnalysis.elements).length;
    
    if (score >= 8) {
      return `Excellent structure with ${presentElements}/${totalElements} key elements present.`;
    } else if (score >= 6) {
      return `Good structure with ${presentElements}/${totalElements} elements. Consider adding missing components.`;
    } else {
      return `Structure needs improvement. Only ${presentElements}/${totalElements} key elements present. Follow a proven pitch framework.`;
    }
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovements(transcript: string, clarity: number, tone: number, pacing: number, structure: number, fillerWords: any): string[] {
    const improvements = [];

    if (fillerWords.percentage > 8) {
      improvements.push('Practice the "pause and breathe" technique instead of using filler words');
    }

    if (clarity < 7) {
      improvements.push('Speak more slowly and articulate each word clearly');
    }

    if (tone < 7) {
      improvements.push('Use more confident and enthusiastic language to engage your audience');
    }

    if (structure < 7) {
      improvements.push('Follow a clear structure: Problem → Solution → Market → Team → Ask');
    }

    if (transcript.length < 200) {
      improvements.push('Expand your pitch with more specific details and examples');
    }

    if (!transcript.includes('?')) {
      improvements.push('Include rhetorical questions to better engage your audience');
    }

    return improvements.slice(0, 5);
  }

  /**
   * Generate strengths
   */
  private generateStrengths(transcript: string, clarity: number, tone: number, pacing: number, structure: number): string[] {
    const strengths = [];

    if (clarity >= 8) {
      strengths.push('Excellent speech clarity and articulation');
    }

    if (tone >= 8) {
      strengths.push('Confident and engaging tone throughout');
    }

    if (pacing >= 8) {
      strengths.push('Perfect speaking pace for audience comprehension');
    }

    if (structure >= 8) {
      strengths.push('Well-organized pitch structure with key elements');
    }

    if (transcript.includes('customers') || transcript.includes('users')) {
      strengths.push('Good focus on customer value and benefits');
    }

    if (transcript.match(/\$\d+|\d+\s*(million|billion)/)) {
      strengths.push('Includes specific numbers and metrics');
    }

    return strengths.slice(0, 5);
  }

  /**
   * Generate missing elements
   */
  private generateMissingElements(structureAnalysis: any): string[] {
    const missing = [];
    const elements = structureAnalysis.elements;

    if (!elements.hasProblemStatement) missing.push('Clear problem statement');
    if (!elements.hasSolution) missing.push('Detailed solution description');
    if (!elements.hasMarketSize) missing.push('Market size and opportunity');
    if (!elements.hasTeam) missing.push('Team credentials and experience');
    if (!elements.hasTraction) missing.push('Customer traction and validation');
    if (!elements.hasBusinessModel) missing.push('Clear business model');
    if (!elements.hasFinancials) missing.push('Financial projections or metrics');
    if (!elements.hasAsk) missing.push('Specific funding ask or next steps');

    return missing.slice(0, 5);
  }

  /**
   * Call OpenAI API for real analysis (when API key is available)
   */
  private async callOpenAIAPI(transcript: string, language: string, duration?: number): Promise<PitchAnalysis> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this startup pitch comprehensively. Provide detailed scores and feedback for clarity, tone, pacing, structure, and generate smart actionable tips.

Transcript: "${transcript}"
Language: ${language}
Duration: ${duration ? `${duration} seconds` : 'Unknown'}

Provide a detailed JSON response with comprehensive analysis including:
- Overall score and detailed category scores
- Words per minute calculation
- Filler word analysis with specific examples
- Structure analysis with missing elements
- Smart tips categorized by delivery, content, structure, engagement
- Confidence, engagement, and professionalism scores
- Specific actionable improvements

Focus on practical, actionable feedback that will help improve the pitch.`;

    const response = await fetch(this.OPENAI_API_URL, {
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
            content: 'You are an expert pitch coach and investor advisor. Provide comprehensive, actionable feedback on startup pitches with specific scores and detailed analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      throw new Error('Failed to parse AI response');
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();
export type { PitchAnalysis, AnalysisError };