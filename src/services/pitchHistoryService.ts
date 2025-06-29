import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PitchAnalysis } from './aiAnalysisService';

export interface PitchRecord {
  id: string;
  userId: string;
  title: string;
  transcript: string;
  translatedText?: string;
  language: string;
  analysis: PitchAnalysis;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  wordCount: number;
  tags?: string[];
}

export interface PitchSummary {
  id: string;
  title: string;
  language: string;
  overallScore: number;
  createdAt: Date;
  duration: number;
  wordCount: number;
  tags?: string[];
}

export interface ProgressDataPoint {
  date: string;
  overallScore: number;
  clarity: number;
  tone: number;
  pacing: number;
  structure: number;
  pitchNumber: number;
  language: string;
}

export interface LanguageData {
  language: string;
  count: number;
  averageScore: number;
  color: string;
}

class PitchHistoryService {
  private readonly COLLECTION_NAME = 'pitches';

  /**
   * Save a new pitch record
   */
  async savePitch(
    userId: string,
    transcript: string,
    analysis: PitchAnalysis,
    language: string,
    translatedText?: string,
    title?: string
  ): Promise<string> {
    try {
      const pitchData = {
        userId,
        title: title || this.generatePitchTitle(transcript),
        transcript,
        translatedText,
        language,
        analysis,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        duration: analysis.estimatedDuration,
        wordCount: analysis.wordCount,
        tags: this.generateTags(analysis)
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), pitchData);
      console.log('Pitch saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving pitch:', error);
      throw new Error('Failed to save pitch. Please try again.');
    }
  }

  /**
   * Get all pitches for a user
   */
  async getUserPitches(userId: string, limitCount: number = 50): Promise<PitchRecord[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const pitches: PitchRecord[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pitches.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as PitchRecord);
      });

      return pitches;
    } catch (error) {
      console.error('Error fetching user pitches:', error);
      throw new Error('Failed to load pitch history. Please try again.');
    }
  }

  /**
   * Get pitch summaries for dashboard
   */
  async getUserPitchSummaries(userId: string, limitCount: number = 20): Promise<PitchSummary[]> {
    try {
      const pitches = await this.getUserPitches(userId, limitCount);
      return pitches.map(pitch => ({
        id: pitch.id,
        title: pitch.title,
        language: pitch.language,
        overallScore: pitch.analysis.overallScore,
        createdAt: pitch.createdAt,
        duration: pitch.duration,
        wordCount: pitch.wordCount,
        tags: pitch.tags
      }));
    } catch (error) {
      console.error('Error fetching pitch summaries:', error);
      throw new Error('Failed to load pitch summaries. Please try again.');
    }
  }

  /**
   * Get progress data for charts
   */
  async getProgressData(userId: string, limitCount: number = 50): Promise<ProgressDataPoint[]> {
    try {
      const pitches = await this.getUserPitches(userId, limitCount);
      
      return pitches
        .reverse() // Show chronological order for progress
        .map((pitch, index) => ({
          date: pitch.createdAt.toISOString(),
          overallScore: pitch.analysis.overallScore,
          clarity: pitch.analysis.clarity.score,
          tone: pitch.analysis.tone.score,
          pacing: pitch.analysis.pacing.score,
          structure: pitch.analysis.structure.score,
          pitchNumber: index + 1,
          language: pitch.language
        }));
    } catch (error) {
      console.error('Error fetching progress data:', error);
      throw new Error('Failed to load progress data. Please try again.');
    }
  }

  /**
   * Get language distribution data
   */
  async getLanguageData(userId: string): Promise<LanguageData[]> {
    try {
      const pitches = await this.getUserPitches(userId, 100);
      
      const languageMap = new Map<string, { count: number; totalScore: number }>();
      
      pitches.forEach(pitch => {
        const existing = languageMap.get(pitch.language) || { count: 0, totalScore: 0 };
        languageMap.set(pitch.language, {
          count: existing.count + 1,
          totalScore: existing.totalScore + pitch.analysis.overallScore
        });
      });

      const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
      
      return Array.from(languageMap.entries())
        .map(([language, data], index) => ({
          language,
          count: data.count,
          averageScore: Math.round((data.totalScore / data.count) * 10) / 10,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching language data:', error);
      throw new Error('Failed to load language data. Please try again.');
    }
  }

  /**
   * Update pitch title
   */
  async updatePitchTitle(pitchId: string, newTitle: string): Promise<void> {
    try {
      const pitchRef = doc(db, this.COLLECTION_NAME, pitchId);
      await updateDoc(pitchRef, {
        title: newTitle,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating pitch title:', error);
      throw new Error('Failed to update pitch title. Please try again.');
    }
  }

  /**
   * Delete a pitch
   */
  async deletePitch(pitchId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, pitchId));
    } catch (error) {
      console.error('Error deleting pitch:', error);
      throw new Error('Failed to delete pitch. Please try again.');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalPitches: number;
    averageScore: number;
    totalDuration: number;
    totalWords: number;
    improvementTrend: number;
    languagesUsed: string[];
    bestScore: number;
    recentAverage: number;
    consistencyScore: number;
  }> {
    try {
      const pitches = await this.getUserPitches(userId, 100);
      
      if (pitches.length === 0) {
        return {
          totalPitches: 0,
          averageScore: 0,
          totalDuration: 0,
          totalWords: 0,
          improvementTrend: 0,
          languagesUsed: [],
          bestScore: 0,
          recentAverage: 0,
          consistencyScore: 0
        };
      }

      const totalPitches = pitches.length;
      const scores = pitches.map(pitch => pitch.analysis.overallScore);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalPitches;
      const totalDuration = pitches.reduce((sum, pitch) => sum + pitch.duration, 0);
      const totalWords = pitches.reduce((sum, pitch) => sum + pitch.wordCount, 0);
      const bestScore = Math.max(...scores);
      
      // Calculate improvement trend (last 5 vs previous 5)
      let improvementTrend = 0;
      if (pitches.length >= 10) {
        const recent5 = pitches.slice(0, 5);
        const previous5 = pitches.slice(5, 10);
        const recentAvg = recent5.reduce((sum, pitch) => sum + pitch.analysis.overallScore, 0) / 5;
        const previousAvg = previous5.reduce((sum, pitch) => sum + pitch.analysis.overallScore, 0) / 5;
        improvementTrend = recentAvg - previousAvg;
      }

      // Calculate recent average (last 5 pitches)
      const recentPitches = pitches.slice(0, Math.min(5, pitches.length));
      const recentAverage = recentPitches.reduce((sum, pitch) => sum + pitch.analysis.overallScore, 0) / recentPitches.length;

      // Calculate consistency score (lower standard deviation = higher consistency)
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
      const standardDeviation = Math.sqrt(variance);
      const consistencyScore = Math.max(0, 10 - standardDeviation); // Scale to 0-10

      const languagesUsed = [...new Set(pitches.map(pitch => pitch.language))];

      return {
        totalPitches,
        averageScore: Math.round(averageScore * 10) / 10,
        totalDuration,
        totalWords,
        improvementTrend: Math.round(improvementTrend * 10) / 10,
        languagesUsed,
        bestScore: Math.round(bestScore * 10) / 10,
        recentAverage: Math.round(recentAverage * 10) / 10,
        consistencyScore: Math.round(consistencyScore * 10) / 10
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw new Error('Failed to calculate statistics. Please try again.');
    }
  }

  /**
   * Get detailed analytics for specific time periods
   */
  async getDetailedAnalytics(userId: string, days: number = 30): Promise<{
    periodStats: any;
    comparisonStats: any;
    topPerformingLanguages: LanguageData[];
    improvementAreas: string[];
    achievements: string[];
  }> {
    try {
      const pitches = await this.getUserPitches(userId, 100);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const periodPitches = pitches.filter(pitch => pitch.createdAt >= cutoffDate);
      const previousPeriodPitches = pitches.filter(pitch => {
        const previousCutoff = new Date(cutoffDate);
        previousCutoff.setDate(previousCutoff.getDate() - days);
        return pitch.createdAt >= previousCutoff && pitch.createdAt < cutoffDate;
      });

      // Calculate period stats
      const periodStats = this.calculatePeriodStats(periodPitches);
      const comparisonStats = this.calculatePeriodStats(previousPeriodPitches);

      // Get language performance
      const languageData = await this.getLanguageData(userId);
      const topPerformingLanguages = languageData
        .filter(lang => lang.averageScore >= 7)
        .slice(0, 3);

      // Identify improvement areas
      const improvementAreas = this.identifyImprovementAreas(periodPitches);

      // Calculate achievements
      const achievements = this.calculateAchievements(pitches, periodPitches);

      return {
        periodStats,
        comparisonStats,
        topPerformingLanguages,
        improvementAreas,
        achievements
      };
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      throw new Error('Failed to load detailed analytics. Please try again.');
    }
  }

  private calculatePeriodStats(pitches: PitchRecord[]) {
    if (pitches.length === 0) {
      return {
        count: 0,
        averageScore: 0,
        totalDuration: 0,
        averageClarity: 0,
        averageTone: 0,
        averagePacing: 0,
        averageStructure: 0
      };
    }

    return {
      count: pitches.length,
      averageScore: pitches.reduce((sum, p) => sum + p.analysis.overallScore, 0) / pitches.length,
      totalDuration: pitches.reduce((sum, p) => sum + p.duration, 0),
      averageClarity: pitches.reduce((sum, p) => sum + p.analysis.clarity.score, 0) / pitches.length,
      averageTone: pitches.reduce((sum, p) => sum + p.analysis.tone.score, 0) / pitches.length,
      averagePacing: pitches.reduce((sum, p) => sum + p.analysis.pacing.score, 0) / pitches.length,
      averageStructure: pitches.reduce((sum, p) => sum + p.analysis.structure.score, 0) / pitches.length
    };
  }

  private identifyImprovementAreas(pitches: PitchRecord[]): string[] {
    if (pitches.length === 0) return [];

    const areas = ['clarity', 'tone', 'pacing', 'structure'];
    const averages = areas.map(area => ({
      area,
      score: pitches.reduce((sum, p) => sum + (p.analysis as any)[area].score, 0) / pitches.length
    }));

    return averages
      .filter(item => item.score < 7)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map(item => item.area);
  }

  private calculateAchievements(allPitches: PitchRecord[], recentPitches: PitchRecord[]): string[] {
    const achievements: string[] = [];

    // Milestone achievements
    if (allPitches.length >= 10) achievements.push('Completed 10+ pitches');
    if (allPitches.length >= 50) achievements.push('Pitch Master - 50+ pitches');
    if (allPitches.length >= 100) achievements.push('Pitch Legend - 100+ pitches');

    // Score achievements
    const bestScore = Math.max(...allPitches.map(p => p.analysis.overallScore));
    if (bestScore >= 9) achievements.push('Excellence - Scored 9+ points');
    if (bestScore === 10) achievements.push('Perfect Score - 10/10 pitch');

    // Consistency achievements
    if (recentPitches.length >= 5) {
      const recentScores = recentPitches.slice(0, 5).map(p => p.analysis.overallScore);
      const allAbove7 = recentScores.every(score => score >= 7);
      if (allAbove7) achievements.push('Consistent Performer - 5 consecutive scores above 7');
    }

    // Language achievements
    const languages = [...new Set(allPitches.map(p => p.language))];
    if (languages.length >= 3) achievements.push('Multilingual Speaker - 3+ languages');
    if (languages.length >= 5) achievements.push('Polyglot Pitcher - 5+ languages');

    return achievements.slice(0, 5); // Return top 5 achievements
  }

  /**
   * Generate a title for the pitch based on content
   */
  private generatePitchTitle(transcript: string): string {
    const words = transcript.trim().split(/\s+/);
    const firstWords = words.slice(0, 6).join(' ');
    
    if (firstWords.length > 50) {
      return firstWords.substring(0, 47) + '...';
    }
    
    return firstWords || 'Untitled Pitch';
  }

  /**
   * Generate tags based on analysis
   */
  private generateTags(analysis: PitchAnalysis): string[] {
    const tags: string[] = [];
    
    // Score-based tags
    if (analysis.overallScore >= 8) tags.push('excellent');
    else if (analysis.overallScore >= 6) tags.push('good');
    else tags.push('needs-improvement');
    
    // Structure-based tags
    if (analysis.structure.hasProblemStatement) tags.push('problem-focused');
    if (analysis.structure.hasSolution) tags.push('solution-oriented');
    if (analysis.structure.hasTeam) tags.push('team-mentioned');
    if (analysis.structure.hasTraction) tags.push('traction-included');
    if (analysis.structure.hasFinancials) tags.push('financial-data');
    
    // Performance-based tags
    if (analysis.clarity.score >= 8) tags.push('clear-speech');
    if (analysis.fillerWords.percentage <= 5) tags.push('confident-delivery');
    if (analysis.wordCount >= 200) tags.push('detailed');
    else if (analysis.wordCount <= 100) tags.push('concise');
    
    return tags;
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get score color class
   */
  getScoreColorClass(score: number): string {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get score background color class
   */
  getScoreBgClass(score: number): string {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  }
}

export const pitchHistoryService = new PitchHistoryService();
export type { ProgressDataPoint, LanguageData };