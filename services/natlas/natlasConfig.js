// services/natlas/natlasConfig.js
// Configuration loader and validator for N-ATLAS

/**
 * Loads and validates N-ATLAS configuration from process.env
 * @returns {import('./natlasTypes.js').NatlasConfig}
 */
export function loadNatlasConfig() {
  const isEnabled = process.env.NATLAS_ENABLED === 'true' || process.env.FEATURE_NATLAS_ASR === 'true';
  const apiBaseUrl = (process.env.NATLAS_API_BASE_URL || 'https://api.natlas.ncair.gov.ng/v1').replace(/\/+$/, '');
  const apiKey = process.env.NATLAS_API_KEY || '';
  const timeoutMs = parseInt(process.env.NATLAS_TIMEOUT_MS || '5000', 10);
  const maxRetries = parseInt(process.env.NATLAS_MAX_RETRIES || '3', 10);
  const mockFallback = process.env.NATLAS_MOCK_FALLBACK !== 'false'; // Default to true for safety

  const models = {
    'yo-NG': process.env.NATLAS_MODEL_YORUBA || 'natlas-asr-yo-v1',
    'ha-NG': process.env.NATLAS_MODEL_HAUSA || 'natlas-asr-ha-v1',
    'ig-NG': process.env.NATLAS_MODEL_IGBO || 'natlas-asr-ig-v1',
    'en-NG': process.env.NATLAS_MODEL_NIGERIAN_ENGLISH || 'natlas-asr-en-ng-v1'
  };

  return {
    enabled: isEnabled,
    apiBaseUrl,
    apiKey,
    timeoutMs: isNaN(timeoutMs) ? 5000 : timeoutMs,
    maxRetries: isNaN(maxRetries) ? 3 : maxRetries,
    mockFallback,
    models
  };
}

/**
 * Validates configuration readiness
 * @param {import('./natlasTypes.js').NatlasConfig} config
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateNatlasConfig(config) {
  const errors = [];

  if (config.enabled) {
    if (!config.apiKey) {
      errors.push('NATLAS_API_KEY is required when N-ATLAS is enabled');
    }
    if (!config.apiBaseUrl || !config.apiBaseUrl.startsWith('http')) {
      errors.push('NATLAS_API_BASE_URL must be a valid HTTP/HTTPS URL');
    }
    if (config.timeoutMs <= 0) {
      errors.push('NATLAS_TIMEOUT_MS must be greater than 0');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
