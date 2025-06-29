interface TranslationResponse {
  translatedText: string;
  originalLanguage: string;
  confidence: number;
}

interface TranslationError {
  error: string;
  message: string;
}

class TranslationService {
  private readonly API_URL = 'https://api.mymemory.translated.net/get';
  private readonly BACKUP_API_URL = 'https://translate.googleapis.com/translate_a/single';

  /**
   * Translate text to English using MyMemory Translation API
   */
  async translateToEnglish(
    text: string, 
    sourceLanguage: string
  ): Promise<TranslationResponse | TranslationError> {
    // If already English, return as-is
    if (sourceLanguage.startsWith('en')) {
      return {
        translatedText: text,
        originalLanguage: sourceLanguage,
        confidence: 1.0
      };
    }

    try {
      // Clean and prepare text
      const cleanText = this.cleanText(text);
      if (!cleanText.trim()) {
        throw new Error('No text to translate');
      }

      // Extract language code (e.g., 'hi-IN' -> 'hi')
      const langCode = sourceLanguage.split('-')[0];

      // Try primary translation service
      const result = await this.translateWithMyMemory(cleanText, langCode);
      
      if (result) {
        return result;
      }

      // Fallback to backup service
      return await this.translateWithBackupService(cleanText, langCode);

    } catch (error) {
      console.error('Translation error:', error);
      return {
        error: 'translation_failed',
        message: error instanceof Error ? error.message : 'Translation service unavailable'
      };
    }
  }

  /**
   * Primary translation using MyMemory API
   */
  private async translateWithMyMemory(
    text: string, 
    sourceLang: string
  ): Promise<TranslationResponse | null> {
    try {
      const params = new URLSearchParams({
        q: text,
        langpair: `${sourceLang}|en`,
        de: 'pitchsense@example.com' // Required for higher rate limits
      });

      const response = await fetch(`${this.API_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return {
          translatedText: data.responseData.translatedText,
          originalLanguage: sourceLang,
          confidence: data.responseData.match || 0.8
        };
      }

      return null;
    } catch (error) {
      console.warn('MyMemory translation failed:', error);
      return null;
    }
  }

  /**
   * Backup translation using Google Translate (unofficial API)
   */
  private async translateWithBackupService(
    text: string, 
    sourceLang: string
  ): Promise<TranslationResponse> {
    try {
      // This is a simplified implementation
      // In production, you'd use official Google Translate API with proper authentication
      const params = new URLSearchParams({
        client: 'gtx',
        sl: sourceLang,
        tl: 'en',
        dt: 't',
        q: text
      });

      const response = await fetch(`${this.BACKUP_API_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error('Backup translation service failed');
      }

      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return {
          translatedText: data[0][0][0],
          originalLanguage: sourceLang,
          confidence: 0.7
        };
      }

      throw new Error('Invalid response from backup service');
    } catch (error) {
      throw new Error('All translation services failed');
    }
  }

  /**
   * Clean text for translation
   */
  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?;:'"()-]/g, '') // Remove special characters
      .substring(0, 5000); // Limit length for API constraints
  }

  /**
   * Detect if translation is needed
   */
  isTranslationNeeded(languageCode: string): boolean {
    return !languageCode.startsWith('en');
  }

  /**
   * Get language name from code
   */
  getLanguageName(code: string): string {
    const languageMap: Record<string, string> = {
      'hi': 'Hindi',
      'ta': 'Tamil',
      'fr': 'French',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'en': 'English'
    };

    const langCode = code.split('-')[0];
    return languageMap[langCode] || 'Unknown';
  }
}

export const translationService = new TranslationService();
export type { TranslationResponse, TranslationError };