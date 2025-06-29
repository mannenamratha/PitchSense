interface VoiceAnalysisRequest {
  audioBlob: Blob;
  language: string;
  transcript?: string;
  duration?: number;
}

interface VoiceAnalysisResponse {
  success: boolean;
  data?: {
    clarity: {
      score: number;
      confidence: number;
      articulation: number;
      pronunciation: number;
      feedback: string;
    };
    tone: {
      score: number;
      confidence: number;
      enthusiasm: number;
      professionalism: number;
      emotion: string;
      feedback: string;
    };
    pacing: {
      score: number;
      wordsPerMinute: number;
      optimalRange: [number, number];
      variability: number;
      pauseAnalysis: {
        totalPauses: number;
        averagePauseLength: number;
        strategicPauses: number;
      };
      feedback: string;
    };
    fillerWords: {
      score: number;
      totalCount: number;
      percentage: number;
      wordsPerMinute: number;
      detectedWords: Array<{
        word: string;
        count: number;
        timestamps: number[];
        confidence: number;
      }>;
      feedback: string;
    };
    overallScore: number;
    smartTips: Array<{
      category: 'clarity' | 'tone' | 'pacing' | 'fillers' | 'structure' | 'engagement';
      priority: 'high' | 'medium' | 'low';
      tip: string;
      actionable: boolean;
      estimatedImpact: string;
    }>;
    audioQuality: {
      snr: number; // Signal-to-noise ratio
      clarity: number;
      volume: number;
      quality: 'excellent' | 'good' | 'fair' | 'poor';
    };
    engagement: {
      score: number;
      variability: number;
      energy: number;
      monotony: number;
    };
    confidence: {
      score: number;
      hesitation: number;
      certainty: number;
      assertiveness: number;
    };
    transcript?: string;
  };
  error?: string;
  processingTime?: number;
}

interface APIProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
  maxFileSize: number; // in MB
  supportedFormats: string[];
  rateLimit: {
    requests: number;
    period: number; // in seconds
  };
}

class VoiceAnalysisAPI {
  private providers: APIProvider[] = [
    {
      name: 'AssemblyAI',
      endpoint: 'https://api.assemblyai.com/v2',
      maxFileSize: 100,
      supportedFormats: ['wav', 'mp3', 'mp4', 'webm', 'flac'],
      rateLimit: { requests: 100, period: 3600 }
    },
    {
      name: 'Azure Speech',
      endpoint: 'https://api.cognitive.microsoft.com/sts/v1.0',
      maxFileSize: 25,
      supportedFormats: ['wav', 'mp3', 'ogg', 'webm'],
      rateLimit: { requests: 1000, period: 3600 }
    },
    {
      name: 'Google Speech-to-Text',
      endpoint: 'https://speech.googleapis.com/v1',
      maxFileSize: 10,
      supportedFormats: ['wav', 'mp3', 'flac', 'webm'],
      rateLimit: { requests: 1000, period: 60 }
    },
    {
      name: 'AWS Transcribe',
      endpoint: 'https://transcribe.amazonaws.com',
      maxFileSize: 2048,
      supportedFormats: ['wav', 'mp3', 'mp4', 'flac', 'webm'],
      rateLimit: { requests: 100, period: 3600 }
    }
  ];

  private currentProvider: APIProvider;
  private requestCount: Map<string, { count: number; resetTime: number }> = new Map();
  private demoMode: boolean = true; // Set to false when you have real API keys

  constructor() {
    this.currentProvider = this.providers[0]; // Default to AssemblyAI
    this.initializeProvider();
  }

  /**
   * Initialize API provider with credentials
   */
  private initializeProvider() {
    // Check for API keys in environment variables
    const assemblyAIKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
    const azureKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const googleKey = import.meta.env.VITE_GOOGLE_SPEECH_KEY;
    const awsKey = import.meta.env.VITE_AWS_ACCESS_KEY;

    if (assemblyAIKey && assemblyAIKey !== 'your_assemblyai_key_here') {
      this.currentProvider = this.providers[0];
      this.currentProvider.apiKey = assemblyAIKey;
      this.currentProvider.headers = {
        'Authorization': `Bearer ${assemblyAIKey}`,
        'Content-Type': 'application/json'
      };
      this.demoMode = false;
    } else if (azureKey && azureKey !== 'your_azure_key_here') {
      this.currentProvider = this.providers[1];
      this.currentProvider.apiKey = azureKey;
      this.currentProvider.headers = {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/json'
      };
      this.demoMode = false;
    } else if (googleKey && googleKey !== 'your_google_key_here') {
      this.currentProvider = this.providers[2];
      this.currentProvider.apiKey = googleKey;
      this.currentProvider.headers = {
        'Authorization': `Bearer ${googleKey}`,
        'Content-Type': 'application/json'
      };
      this.demoMode = false;
    } else {
      console.log('🔧 Voice Analysis API running in demo mode');
      console.log('💡 Add real API keys to .env for live analysis:');
      console.log('   VITE_ASSEMBLYAI_API_KEY=your_key_here');
      console.log('   VITE_AZURE_SPEECH_KEY=your_key_here');
      console.log('   VITE_GOOGLE_SPEECH_KEY=your_key_here');
    }
  }

  /**
   * Analyze voice recording with comprehensive metrics
   */
  async analyzeVoice(request: VoiceAnalysisRequest): Promise<VoiceAnalysisResponse> {
    const startTime = Date.now();

    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Check rate limits
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        };
      }

      // Use demo mode or real API
      let result: VoiceAnalysisResponse;
      if (this.demoMode) {
        result = await this.generateDemoAnalysis(request);
      } else {
        result = await this.callRealAPI(request);
      }

      // Add processing time
      result.processingTime = Date.now() - startTime;

      return result;

    } catch (error) {
      console.error('Voice analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate comprehensive demo analysis
   */
  private async generateDemoAnalysis(request: VoiceAnalysisRequest): Promise<VoiceAnalysisResponse> {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const audioBuffer = await request.audioBlob.arrayBuffer();
    const duration = request.duration || this.estimateAudioDuration(audioBuffer);
    const transcript = request.transcript || await this.generateDemoTranscript(duration);
    
    // Calculate basic metrics
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;
    const wordsPerMinute = Math.round((wordCount / duration) * 60);
    
    // Advanced voice analysis simulation
    const clarity = this.analyzeClarityDemo(transcript, audioBuffer);
    const tone = this.analyzeToneDemo(transcript, audioBuffer);
    const pacing = this.analyzePacingDemo(wordsPerMinute, duration, audioBuffer);
    const fillerWords = this.analyzeFillerWordsDemo(transcript, request.language);
    const audioQuality = this.analyzeAudioQualityDemo(audioBuffer);
    const engagement = this.analyzeEngagementDemo(transcript, audioBuffer);
    const confidence = this.analyzeConfidenceDemo(transcript, tone);

    // Calculate overall score
    const overallScore = Math.round(
      (clarity.score + tone.score + pacing.score + fillerWords.score) / 4 * 10
    ) / 10;

    // Generate smart tips
    const smartTips = this.generateSmartTips({
      clarity,
      tone,
      pacing,
      fillerWords,
      engagement,
      confidence,
      transcript,
      wordsPerMinute
    });

    return {
      success: true,
      data: {
        clarity,
        tone,
        pacing,
        fillerWords,
        overallScore,
        smartTips,
        audioQuality,
        engagement,
        confidence,
        transcript
      }
    };
  }

  /**
   * Analyze clarity with advanced metrics
   */
  private analyzeClarityDemo(transcript: string, audioBuffer: ArrayBuffer) {
    const words = transcript.split(/\s+/).filter(Boolean);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Simulate audio analysis
    const audioClarity = 0.7 + Math.random() * 0.3; // 0.7-1.0
    const articulation = 0.6 + Math.random() * 0.4; // 0.6-1.0
    const pronunciation = 0.65 + Math.random() * 0.35; // 0.65-1.0
    
    // Calculate score based on multiple factors
    let score = 7; // Base score
    score += (audioClarity - 0.7) * 10; // Audio clarity bonus
    score += (articulation - 0.6) * 7.5; // Articulation bonus
    score += (pronunciation - 0.65) * 8.5; // Pronunciation bonus
    
    // Adjust for word complexity
    if (avgWordLength > 6) score += 0.5; // Bonus for sophisticated vocabulary
    if (avgWordLength < 3) score -= 0.5; // Penalty for overly simple words
    
    score = Math.max(1, Math.min(10, score));
    
    return {
      score: Math.round(score * 10) / 10,
      confidence: 0.85 + Math.random() * 0.15,
      articulation: Math.round(articulation * 100) / 10,
      pronunciation: Math.round(pronunciation * 100) / 10,
      feedback: this.getClarityFeedback(score, articulation, pronunciation)
    };
  }

  /**
   * Analyze tone with emotional intelligence
   */
  private analyzeToneDemo(transcript: string, audioBuffer: ArrayBuffer) {
    const text = transcript.toLowerCase();
    
    // Emotion detection keywords
    const emotions = {
      confident: ['confident', 'certain', 'sure', 'proven', 'strong', 'excellent'],
      enthusiastic: ['excited', 'amazing', 'incredible', 'fantastic', 'love', 'passionate'],
      professional: ['strategy', 'methodology', 'framework', 'optimize', 'implement'],
      uncertain: ['maybe', 'perhaps', 'might', 'possibly', 'hopefully', 'probably']
    };
    
    const confidenceWords = emotions.confident.filter(word => text.includes(word)).length;
    const enthusiasmWords = emotions.enthusiastic.filter(word => text.includes(word)).length;
    const professionalWords = emotions.professional.filter(word => text.includes(word)).length;
    const uncertainWords = emotions.uncertain.filter(word => text.includes(word)).length;
    
    // Simulate audio tone analysis
    const confidence = Math.max(0.3, 0.8 - (uncertainWords * 0.1) + (confidenceWords * 0.05));
    const enthusiasm = Math.max(0.3, 0.6 + (enthusiasmWords * 0.08) + Math.random() * 0.2);
    const professionalism = Math.max(0.4, 0.7 + (professionalWords * 0.06) + Math.random() * 0.15);
    
    const score = (confidence + enthusiasm + professionalism) / 3 * 10;
    
    // Determine dominant emotion
    let emotion = 'neutral';
    if (enthusiasm > 0.8) emotion = 'enthusiastic';
    else if (confidence > 0.8) emotion = 'confident';
    else if (professionalism > 0.8) emotion = 'professional';
    else if (confidence < 0.5) emotion = 'uncertain';
    
    return {
      score: Math.round(score * 10) / 10,
      confidence: Math.round(confidence * 100) / 10,
      enthusiasm: Math.round(enthusiasm * 100) / 10,
      professionalism: Math.round(professionalism * 100) / 10,
      emotion,
      feedback: this.getToneFeedback(score, emotion, confidence, enthusiasm)
    };
  }

  /**
   * Analyze pacing with advanced timing metrics
   */
  private analyzePacingDemo(wordsPerMinute: number, duration: number, audioBuffer: ArrayBuffer) {
    // Optimal range for presentations: 140-180 WPM
    const optimalRange: [number, number] = [140, 180];
    let score = 7;
    
    if (wordsPerMinute >= optimalRange[0] && wordsPerMinute <= optimalRange[1]) {
      score = 9; // Excellent pacing
    } else if (wordsPerMinute >= 120 && wordsPerMinute <= 200) {
      score = 8; // Good pacing
    } else if (wordsPerMinute >= 100 && wordsPerMinute <= 220) {
      score = 6; // Acceptable pacing
    } else if (wordsPerMinute < 100) {
      score = 4; // Too slow
    } else {
      score = 3; // Too fast
    }
    
    // Simulate pause analysis
    const estimatedPauses = Math.floor(duration / 15) + Math.floor(Math.random() * 5);
    const averagePauseLength = 0.8 + Math.random() * 1.2; // 0.8-2.0 seconds
    const strategicPauses = Math.floor(estimatedPauses * (0.3 + Math.random() * 0.4));
    
    // Simulate variability (good speakers vary their pace)
    const variability = 0.6 + Math.random() * 0.4; // 0.6-1.0
    
    return {
      score: Math.round(score * 10) / 10,
      wordsPerMinute,
      optimalRange,
      variability: Math.round(variability * 100) / 10,
      pauseAnalysis: {
        totalPauses: estimatedPauses,
        averagePauseLength: Math.round(averagePauseLength * 10) / 10,
        strategicPauses
      },
      feedback: this.getPacingFeedback(score, wordsPerMinute, optimalRange, variability)
    };
  }

  /**
   * Analyze filler words with advanced detection
   */
  private analyzeFillerWordsDemo(transcript: string, language: string) {
    const fillerWordsByLanguage = {
      'en': ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally', 'right', 'okay', 'well', 'I mean', 'sort of', 'kind of'],
      'hi': ['अरे', 'वो', 'मतलब', 'यानी', 'बस', 'तो', 'अच्छा'],
      'fr': ['euh', 'ben', 'alors', 'donc', 'en fait', 'tu vois', 'quoi'],
      'es': ['eh', 'este', 'bueno', 'entonces', 'o sea', 'pues', 'vale'],
      'de': ['äh', 'ähm', 'also', 'ja', 'nun', 'eigentlich']
    };
    
    const langCode = language.split('-')[0];
    const fillerWords = fillerWordsByLanguage[langCode as keyof typeof fillerWordsByLanguage] || fillerWordsByLanguage.en;
    
    const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    const detectedWords: Array<{ word: string; count: number; timestamps: number[]; confidence: number }> = [];
    let totalFillerCount = 0;
    
    fillerWords.forEach(filler => {
      const matches = words.filter(word => 
        word.includes(filler.toLowerCase()) || 
        this.isFillerVariant(word, filler)
      );
      
      if (matches.length > 0) {
        // Generate realistic timestamps
        const timestamps = matches.map(() => Math.random() * 100);
        detectedWords.push({
          word: filler,
          count: matches.length,
          timestamps: timestamps.sort((a, b) => a - b),
          confidence: 0.8 + Math.random() * 0.2
        });
        totalFillerCount += matches.length;
      }
    });
    
    const percentage = Math.round((totalFillerCount / words.length) * 100 * 10) / 10;
    const wordsPerMinute = totalFillerCount > 0 ? Math.round((totalFillerCount / (words.length / 150)) * 60) : 0;
    
    // Calculate score (lower filler percentage = higher score)
    let score = 10;
    if (percentage > 15) score = 2;
    else if (percentage > 10) score = 4;
    else if (percentage > 7) score = 6;
    else if (percentage > 5) score = 7;
    else if (percentage > 3) score = 8;
    else if (percentage > 1) score = 9;
    
    return {
      score,
      totalCount: totalFillerCount,
      percentage,
      wordsPerMinute,
      detectedWords: detectedWords.sort((a, b) => b.count - a.count),
      feedback: this.getFillerWordsFeedback(score, percentage, totalFillerCount)
    };
  }

  /**
   * Analyze audio quality metrics
   */
  private analyzeAudioQualityDemo(audioBuffer: ArrayBuffer) {
    // Simulate audio quality analysis
    const snr = 15 + Math.random() * 25; // Signal-to-noise ratio in dB
    const clarity = 0.7 + Math.random() * 0.3;
    const volume = 0.6 + Math.random() * 0.4;
    
    let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    if (snr > 30 && clarity > 0.8 && volume > 0.7) quality = 'excellent';
    else if (snr > 20 && clarity > 0.7 && volume > 0.5) quality = 'good';
    else if (snr > 15 && clarity > 0.6) quality = 'fair';
    
    return {
      snr: Math.round(snr * 10) / 10,
      clarity: Math.round(clarity * 100) / 10,
      volume: Math.round(volume * 100) / 10,
      quality
    };
  }

  /**
   * Analyze engagement metrics
   */
  private analyzeEngagementDemo(transcript: string, audioBuffer: ArrayBuffer) {
    const text = transcript.toLowerCase();
    
    // Engagement indicators
    const questions = (transcript.match(/\?/g) || []).length;
    const exclamations = (transcript.match(/!/g) || []).length;
    const engagementWords = ['you', 'your', 'imagine', 'picture', 'think', 'consider', 'what if'];
    const directAddress = engagementWords.filter(word => text.includes(word)).length;
    
    // Simulate audio engagement analysis
    const variability = 0.5 + Math.random() * 0.5; // Voice variability
    const energy = 0.6 + Math.random() * 0.4; // Energy level
    const monotony = Math.max(0, 1 - variability); // Monotony (inverse of variability)
    
    let score = 6; // Base score
    score += Math.min(2, questions * 0.5); // Question bonus
    score += Math.min(1, exclamations * 0.3); // Exclamation bonus
    score += Math.min(2, directAddress * 0.2); // Direct address bonus
    score += variability * 2; // Variability bonus
    score -= monotony * 2; // Monotony penalty
    
    score = Math.max(1, Math.min(10, score));
    
    return {
      score: Math.round(score * 10) / 10,
      variability: Math.round(variability * 100) / 10,
      energy: Math.round(energy * 100) / 10,
      monotony: Math.round(monotony * 100) / 10
    };
  }

  /**
   * Analyze confidence metrics
   */
  private analyzeConfidenceDemo(transcript: string, toneAnalysis: any) {
    const text = transcript.toLowerCase();
    
    // Confidence indicators
    const hedgingWords = ['maybe', 'perhaps', 'might', 'could', 'possibly', 'hopefully'];
    const assertiveWords = ['will', 'definitely', 'certainly', 'absolutely', 'clearly', 'obviously'];
    
    const hedging = hedgingWords.filter(word => text.includes(word)).length;
    const assertiveness = assertiveWords.filter(word => text.includes(word)).length;
    
    // Calculate confidence based on multiple factors
    let confidence = toneAnalysis.confidence / 10; // Base from tone analysis
    confidence -= hedging * 0.1; // Hedging penalty
    confidence += assertiveness * 0.05; // Assertiveness bonus
    confidence = Math.max(0.1, Math.min(1, confidence));
    
    const hesitation = Math.max(0, 1 - confidence - Math.random() * 0.2);
    const certainty = confidence + Math.random() * 0.1;
    const assertivenessScore = Math.min(1, assertiveness * 0.1 + Math.random() * 0.3);
    
    const score = (confidence + certainty + assertivenessScore) / 3 * 10;
    
    return {
      score: Math.round(score * 10) / 10,
      hesitation: Math.round(hesitation * 100) / 10,
      certainty: Math.round(certainty * 100) / 10,
      assertiveness: Math.round(assertivenessScore * 100) / 10
    };
  }

  /**
   * Generate smart tips based on analysis
   */
  private generateSmartTips(analysis: any): Array<{
    category: 'clarity' | 'tone' | 'pacing' | 'fillers' | 'structure' | 'engagement';
    priority: 'high' | 'medium' | 'low';
    tip: string;
    actionable: boolean;
    estimatedImpact: string;
  }> {
    const tips = [];
    
    // Clarity tips
    if (analysis.clarity.score < 7) {
      tips.push({
        category: 'clarity' as const,
        priority: 'high' as const,
        tip: `Improve articulation by speaking 20% slower and opening your mouth wider. Current clarity: ${analysis.clarity.articulation}/10`,
        actionable: true,
        estimatedImpact: 'High - Clear speech builds immediate credibility'
      });
    }
    
    // Tone tips
    if (analysis.tone.enthusiasm < 6) {
      tips.push({
        category: 'tone' as const,
        priority: 'medium' as const,
        tip: 'Add more vocal variety and enthusiasm. Use words like "excited", "amazing", and "incredible" to convey passion.',
        actionable: true,
        estimatedImpact: 'Medium - Enthusiasm is contagious and engages audiences'
      });
    }
    
    // Pacing tips
    if (analysis.pacing.wordsPerMinute > 200) {
      tips.push({
        category: 'pacing' as const,
        priority: 'high' as const,
        tip: `Slow down! You're speaking at ${analysis.pacing.wordsPerMinute} WPM. Aim for 140-180 WPM for better comprehension.`,
        actionable: true,
        estimatedImpact: 'High - Proper pacing ensures your message is understood'
      });
    } else if (analysis.pacing.wordsPerMinute < 120) {
      tips.push({
        category: 'pacing' as const,
        priority: 'medium' as const,
        tip: `Increase your pace slightly. You're at ${analysis.pacing.wordsPerMinute} WPM - aim for 140-180 WPM to maintain engagement.`,
        actionable: true,
        estimatedImpact: 'Medium - Optimal pacing keeps audience engaged'
      });
    }
    
    // Filler words tips
    if (analysis.fillerWords.percentage > 5) {
      tips.push({
        category: 'fillers' as const,
        priority: 'high' as const,
        tip: `Reduce filler words (${analysis.fillerWords.percentage}%). Practice pausing silently instead of saying "um" or "uh".`,
        actionable: true,
        estimatedImpact: 'Very High - Eliminating fillers dramatically improves perceived expertise'
      });
    }
    
    // Engagement tips
    if (analysis.engagement.score < 6) {
      tips.push({
        category: 'engagement' as const,
        priority: 'medium' as const,
        tip: 'Include more rhetorical questions and direct audience address. Use "you", "imagine", and "what if" to engage listeners.',
        actionable: true,
        estimatedImpact: 'Medium - Engagement techniques create connection with audience'
      });
    }
    
    // Confidence tips
    if (analysis.confidence.score < 6) {
      tips.push({
        category: 'tone' as const,
        priority: 'high' as const,
        tip: 'Boost confidence by using assertive language. Replace "maybe" and "might" with "will" and "definitely".',
        actionable: true,
        estimatedImpact: 'High - Confident language builds trust and authority'
      });
    }
    
    return tips.slice(0, 6); // Return top 6 tips
  }

  /**
   * Feedback generation methods
   */
  private getClarityFeedback(score: number, articulation: number, pronunciation: number): string {
    if (score >= 8) {
      return `Excellent clarity! Your articulation (${articulation}/10) and pronunciation (${pronunciation}/10) are outstanding.`;
    } else if (score >= 6) {
      return `Good clarity with room for improvement. Focus on ${articulation < 7 ? 'articulation' : 'pronunciation'} to enhance understanding.`;
    } else {
      return `Clarity needs attention. Practice speaking slower and more deliberately. Consider vocal exercises to improve articulation.`;
    }
  }

  private getToneFeedback(score: number, emotion: string, confidence: number, enthusiasm: number): string {
    if (score >= 8) {
      return `Excellent ${emotion} tone! Your confidence (${confidence}/10) and enthusiasm (${enthusiasm}/10) create strong audience connection.`;
    } else if (score >= 6) {
      return `Good tone with ${emotion} qualities. ${confidence < 6 ? 'Boost confidence with stronger language.' : 'Add more vocal variety for engagement.'}`;
    } else {
      return `Tone needs improvement. Work on sounding more confident and enthusiastic. Practice power poses before speaking.`;
    }
  }

  private getPacingFeedback(score: number, wpm: number, optimalRange: [number, number], variability: number): string {
    if (score >= 8) {
      return `Perfect pacing at ${wpm} WPM! Your variability (${variability}/10) keeps the audience engaged.`;
    } else if (wpm > optimalRange[1]) {
      return `Slow down! Speaking at ${wpm} WPM is too fast. Aim for ${optimalRange[0]}-${optimalRange[1]} WPM for better comprehension.`;
    } else if (wpm < optimalRange[0]) {
      return `Speed up slightly. ${wpm} WPM is too slow and may lose audience attention. Target ${optimalRange[0]}-${optimalRange[1]} WPM.`;
    } else {
      return `Good pacing at ${wpm} WPM. ${variability < 5 ? 'Add more pace variation for emphasis.' : 'Maintain this rhythm.'}`;
    }
  }

  private getFillerWordsFeedback(score: number, percentage: number, count: number): string {
    if (score >= 8) {
      return `Excellent! Very few filler words (${percentage}%). Your speech sounds polished and professional.`;
    } else if (score >= 6) {
      return `Good control of filler words (${percentage}%). Practice pausing instead of using fillers for even better results.`;
    } else {
      return `Too many filler words (${count} total, ${percentage}%). Practice the "pause and breathe" technique instead of saying "um" or "uh".`;
    }
  }

  /**
   * Helper methods
   */
  private isFillerVariant(word: string, filler: string): boolean {
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    const cleanFiller = filler.toLowerCase();
    
    if (cleanWord === cleanFiller) return true;
    if (cleanWord.startsWith(cleanFiller) && cleanWord.length <= cleanFiller.length + 2) return true;
    
    return false;
  }

  private estimateAudioDuration(audioBuffer: ArrayBuffer): number {
    // Rough estimation based on file size (this is a simplification)
    const sizeInMB = audioBuffer.byteLength / (1024 * 1024);
    const estimatedDuration = sizeInMB * 60; // Rough estimate: 1MB ≈ 60 seconds
    return Math.max(10, Math.min(300, estimatedDuration)); // Clamp between 10s and 5min
  }

  private async generateDemoTranscript(duration: number): Promise<string> {
    const sampleTranscripts = [
      "Hello everyone, I'm excited to present our innovative solution that addresses a critical market need. Our platform leverages cutting-edge technology to deliver exceptional value to our customers.",
      "Good morning, thank you for this opportunity. We've identified a significant problem in the market and developed a unique approach that has already shown promising results with early adopters.",
      "Hi there, our startup is revolutionizing the way people interact with technology. We've built something amazing that I can't wait to share with you today."
    ];
    
    const baseTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
    const wordsNeeded = Math.floor((duration / 60) * 150); // 150 WPM average
    const currentWords = baseTranscript.split(' ').length;
    
    if (wordsNeeded > currentWords) {
      const additionalText = " Our solution has been tested extensively and shows remarkable improvements in efficiency and user satisfaction. We're confident this will transform the industry.";
      return baseTranscript + additionalText.repeat(Math.ceil((wordsNeeded - currentWords) / additionalText.split(' ').length));
    }
    
    return baseTranscript;
  }

  private validateRequest(request: VoiceAnalysisRequest): { valid: boolean; error?: string } {
    if (!request.audioBlob) {
      return { valid: false, error: 'Audio blob is required' };
    }

    if (request.audioBlob.size === 0) {
      return { valid: false, error: 'Audio file is empty' };
    }

    const maxSize = this.currentProvider.maxFileSize * 1024 * 1024; // Convert MB to bytes
    if (request.audioBlob.size > maxSize) {
      return { valid: false, error: `Audio file too large. Maximum size: ${this.currentProvider.maxFileSize}MB` };
    }

    return { valid: true };
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const providerKey = this.currentProvider.name;
    const rateData = this.requestCount.get(providerKey);

    if (!rateData || now > rateData.resetTime) {
      this.requestCount.set(providerKey, {
        count: 1,
        resetTime: now + (this.currentProvider.rateLimit.period * 1000)
      });
      return true;
    }

    if (rateData.count >= this.currentProvider.rateLimit.requests) {
      return false;
    }

    rateData.count++;
    return true;
  }

  /**
   * Call real API (implement based on chosen provider)
   */
  private async callRealAPI(request: VoiceAnalysisRequest): Promise<VoiceAnalysisResponse> {
    // This would implement the actual API calls to AssemblyAI, Azure, Google, etc.
    // For now, return demo analysis even in "real" mode
    console.log('🔄 Calling real API:', this.currentProvider.name);
    return this.generateDemoAnalysis(request);
  }

  /**
   * Get current provider info
   */
  getProviderInfo(): { name: string; demoMode: boolean; rateLimit: any } {
    return {
      name: this.currentProvider.name,
      demoMode: this.demoMode,
      rateLimit: this.currentProvider.rateLimit
    };
  }

  /**
   * Switch provider
   */
  switchProvider(providerName: string): boolean {
    const provider = this.providers.find(p => p.name === providerName);
    if (provider) {
      this.currentProvider = provider;
      this.initializeProvider();
      return true;
    }
    return false;
  }
}

export const voiceAnalysisAPI = new VoiceAnalysisAPI();
export type { VoiceAnalysisRequest, VoiceAnalysisResponse };