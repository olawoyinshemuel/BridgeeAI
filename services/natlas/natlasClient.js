// services/natlas/natlasClient.js
// Low-level HTTP / REST Client Adapter for official N-ATLAS ASR API

import { 
  NatlasAuthenticationError, 
  NatlasNetworkError, 
  NatlasTimeoutError, 
  NatlasUnsupportedLanguageError,
  NatlasError
} from './natlasErrors.js';
import { isNatlasSupportedLanguage, getNatlasSupportedLanguageCodes } from './natlasRegistry.js';

export class NatlasASRClient {
  /**
   * @param {import('./natlasTypes.js').NatlasConfig} config
   */
  constructor(config = {}) {
    this.config = config;
    this.apiBaseUrl = config.apiBaseUrl || 'https://api.natlas.ncair.gov.ng/v1';
    this.apiKey = config.apiKey || '';
    this.timeoutMs = config.timeoutMs || 5000;
    this.maxRetries = config.maxRetries || 3;
  }

  /**
   * Performs an authenticated transcription request to N-ATLAS
   * @param {import('./natlasTypes.js').NatlasTranscriptionRequest} request
   * @returns {Promise<import('./natlasTypes.js').NatlasTranscriptionResponse>}
   */
  async transcribe(request) {
    const { audioData, language, sampleRate = 16000, format = 'pcm16', sessionId } = request;

    if (!isNatlasSupportedLanguage(language)) {
      throw new NatlasUnsupportedLanguageError(language, getNatlasSupportedLanguageCodes());
    }

    if (!this.apiKey && this.config.enabled) {
      throw new NatlasAuthenticationError('Missing NATLAS_API_KEY for live transcription');
    }

    // Convert audio buffer to base64 if needed
    let base64Audio;
    if (Buffer.isBuffer(audioData)) {
      base64Audio = audioData.toString('base64');
    } else if (typeof audioData === 'string') {
      base64Audio = audioData;
    } else if (audioData instanceof Uint8Array) {
      base64Audio = Buffer.from(audioData).toString('base64');
    } else {
      throw new NatlasError('Invalid audioData payload: expected Buffer, Uint8Array, or base64 string');
    }

    const endpoint = `${this.apiBaseUrl}/audio/transcriptions`;
    const payload = {
      audio: base64Audio,
      language,
      sample_rate: sampleRate,
      format,
      session_id: sessionId || null
    };

    let attempt = 0;
    let lastError = null;

    while (attempt <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Client-Agent': 'BridgeeAIX-NATLAS-Adapter/1.0'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 401 || response.status === 403) {
          throw new NatlasAuthenticationError(`Authentication failed: status ${response.status}`);
        }

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new NatlasError(`N-ATLAS API returned HTTP ${response.status}`, 'NATLAS_HTTP_ERROR', {
            status: response.status,
            body: errorBody
          });
        }

        const data = await response.json();
        return {
          success: true,
          transcript: data.transcript || data.text || '',
          language: data.language || language,
          confidence: typeof data.confidence === 'number' ? data.confidence : 1.0,
          isFinal: data.is_final !== undefined ? Boolean(data.is_final) : true,
          durationMs: data.duration_ms || null,
          provider: 'natlas'
        };

      } catch (err) {
        lastError = err;
        if (err.name === 'AbortError') {
          lastError = new NatlasTimeoutError(`Request timed out after ${this.timeoutMs}ms`);
        } else if (!(err instanceof NatlasError)) {
          lastError = new NatlasNetworkError(err.message, { originalError: err });
        }

        // Don't retry on auth errors or unsupported languages
        if (lastError instanceof NatlasAuthenticationError || lastError instanceof NatlasUnsupportedLanguageError) {
          throw lastError;
        }

        attempt++;
        if (attempt <= this.maxRetries) {
          // Exponential backoff
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
          await new Promise((res) => setTimeout(res, backoffMs));
        }
      }
    }

    throw lastError || new NatlasError('All transcription retry attempts failed');
  }

  /**
   * Performs an end-to-end healthcheck against the N-ATLAS service
   * @returns {Promise<import('./natlasTypes.js').NatlasHealthStatus>}
   */
  async healthCheck() {
    const startTime = Date.now();
    const supported = getNatlasSupportedLanguageCodes();

    if (!this.config.enabled) {
      return {
        ok: false,
        status: 'disabled',
        latencyMs: 0,
        supportedLanguages: supported,
        message: 'N-ATLAS integration is disabled in configuration'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client-Agent': 'BridgeeAIX-NATLAS-Adapter/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          ok: true,
          status: 'ready',
          latencyMs,
          supportedLanguages: supported,
          message: 'N-ATLAS ASR API operational'
        };
      }

      return {
        ok: false,
        status: 'degraded',
        latencyMs,
        supportedLanguages: supported,
        message: `N-ATLAS health check responded with status ${response.status}`
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      return {
        ok: false,
        status: 'offline',
        latencyMs,
        supportedLanguages: supported,
        message: err.message
      };
    }
  }
}
