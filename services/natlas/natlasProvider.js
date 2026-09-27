// services/natlas/natlasProvider.js
// Production-grade N-ATLAS ASR Provider with automatic mock fallback

import { NatlasASRClient } from './natlasClient.js';
import { MockNatlasASRProvider } from './mockNatlasProvider.js';
import { NATLAS_SUPPORTED_LANGUAGES, isNatlasSupportedLanguage } from './natlasRegistry.js';
import { NatlasUnsupportedLanguageError } from './natlasErrors.js';

export class NatlasASRProvider {
  /**
   * @param {import('./natlasTypes.js').NatlasConfig} config
   */
  constructor(config = {}) {
    this.id = 'natlas';
    this.name = 'Official N-ATLAS Speech Recognition Provider';
    this.config = config;
    this.supportedLanguages = Object.keys(NATLAS_SUPPORTED_LANGUAGES);
    this.client = new NatlasASRClient(config);
    this.mockProvider = new MockNatlasASRProvider();

    this.partialCallbacks = new Set();
    this.finalCallbacks = new Set();
    this.isLiveAvailable = false;
    this.audioBuffers = new Map(); // Map<roomId, Buffer[]>
  }

  async initialize(config = null) {
    if (config) {
      this.config = config;
      this.client = new NatlasASRClient(config);
    }

    if (this.config.enabled && this.config.apiKey) {
      try {
        const health = await this.client.healthCheck();
        this.isLiveAvailable = health.ok;
      } catch (e) {
        this.isLiveAvailable = false;
      }
    } else {
      this.isLiveAvailable = false;
    }

    return true;
  }

  onPartial(callback) {
    if (typeof callback === 'function') {
      this.partialCallbacks.add(callback);
      this.mockProvider.onPartial(callback);
    }
  }

  onFinal(callback) {
    if (typeof callback === 'function') {
      this.finalCallbacks.add(callback);
      this.mockProvider.onFinal(callback);
    }
  }

  /**
   * Process a 250ms binary PCM chunk
   * @param {string} roomId
   * @param {Buffer} audioBuffer
   * @param {string} language
   */
  async processChunk(roomId, audioBuffer, language = 'yo-NG') {
    if (!isNatlasSupportedLanguage(language)) {
      throw new NatlasUnsupportedLanguageError(language, this.supportedLanguages);
    }

    // If live N-ATLAS API is active and configured
    if (this.config.enabled && this.isLiveAvailable) {
      if (!this.audioBuffers.has(roomId)) {
        this.audioBuffers.set(roomId, []);
      }
      const bufferList = this.audioBuffers.get(roomId);
      bufferList.push(audioBuffer);

      // Slicing window: Accumulate 4 chunks (1.0 second) for remote API transcription
      if (bufferList.length >= 4) {
        const combined = Buffer.concat(bufferList);
        this.audioBuffers.set(roomId, []);

        try {
          const res = await this.client.transcribe({
            audioData: combined,
            language,
            sampleRate: 16000,
            format: 'pcm16',
            sessionId: roomId
          });

          if (res.transcript && res.transcript.trim()) {
            const eventPayload = {
              roomId,
              type: res.isFinal ? 'final' : 'partial',
              text: res.transcript.trim(),
              language,
              isFinal: res.isFinal,
              provider: 'natlas',
              timestamp: new Date().toISOString()
            };

            const callbackSet = res.isFinal ? this.finalCallbacks : this.partialCallbacks;
            for (const cb of callbackSet) {
              try {
                cb(eventPayload);
              } catch (err) {
                console.error('[NatlasProvider] Callback error:', err);
              }
            }
            return eventPayload;
          }
        } catch (err) {
          console.warn('[NatlasProvider] Remote transcription failure, checking mock fallback:', err.message);
          if (this.config.mockFallback) {
            return this.mockProvider.processChunk(roomId, audioBuffer, language);
          }
          throw err;
        }
      }
      return null;
    }

    // Default / Mock fallback mode
    if (this.config.mockFallback) {
      return this.mockProvider.processChunk(roomId, audioBuffer, language);
    }

    return null;
  }

  resetSession(roomId) {
    this.audioBuffers.delete(roomId);
    this.mockProvider.resetSession(roomId);
  }

  async healthCheck() {
    if (this.config.enabled && this.config.apiKey) {
      return this.client.healthCheck();
    }
    return {
      ok: true,
      status: 'mock_fallback',
      latencyMs: 1,
      supportedLanguages: this.supportedLanguages,
      message: 'Running in safe mock fallback mode (awaiting upstream credentials)'
    };
  }
}
