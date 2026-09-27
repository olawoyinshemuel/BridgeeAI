// services/natlas/natlasTypes.js
// Type definitions, message schemas, and contracts for N-ATLAS integration

/**
 * @typedef {Object} NatlasConfig
 * @property {boolean} enabled - Whether N-ATLAS integration is enabled
 * @property {string} apiBaseUrl - Base URL for N-ATLAS API
 * @property {string} apiKey - API key for authentication (server-side only)
 * @property {number} timeoutMs - Request timeout in milliseconds
 * @property {number} maxRetries - Maximum retry attempts on network error
 * @property {boolean} mockFallback - Whether to fallback to mock provider on error
 * @property {Object.<string, string>} models - Model identifiers per language
 */

/**
 * @typedef {Object} NatlasTranscriptionRequest
 * @property {Buffer|Uint8Array|string} audioData - Raw PCM audio buffer or base64 string
 * @property {string} language - Language code ('yo-NG', 'ha-NG', 'ig-NG', 'en-NG')
 * @property {number} sampleRate - Audio sample rate (default 16000)
 * @property {string} [format] - Audio format ('pcm16', 'wav', 'opus')
 * @property {string} [sessionId] - BridgeeAI session identifier
 */

/**
 * @typedef {Object} NatlasTranscriptionResponse
 * @property {boolean} success - Whether transcription succeeded
 * @property {string} transcript - Recognized source text
 * @property {string} language - Detected or confirmed language code
 * @property {number} confidence - Recognition confidence score (0.0 - 1.0)
 * @property {boolean} isFinal - Whether transcript is finalized
 * @property {number} [durationMs] - Audio duration processed
 * @property {string} [provider] - Provider identifier ('natlas' | 'mock-natlas')
 */

/**
 * @typedef {Object} NatlasTranscriptEvent
 * @property {string} type - 'partial' | 'final' | 'error'
 * @property {string} text - Transcript segment text
 * @property {string} language - Language code
 * @property {boolean} isFinal - Boundary flag
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} NatlasHealthStatus
 * @property {boolean} ok - Health status
 * @property {string} status - 'ready' | 'degraded' | 'offline'
 * @property {number} latencyMs - Ping latency in milliseconds
 * @property {string[]} supportedLanguages - Active supported languages
 * @property {string} [message] - Status message or diagnostic detail
 */

/**
 * Standard ASR Provider Interface
 * @interface
 */
export const ASR_PROVIDER_INTERFACE = {
  id: 'string',
  name: 'string',
  supportedLanguages: 'array',
  initialize: 'function',
  processChunk: 'function',
  onPartial: 'function',
  onFinal: 'function',
  resetSession: 'function',
  healthCheck: 'function'
};
