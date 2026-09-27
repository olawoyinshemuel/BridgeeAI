// services/natlas/index.js
// N-ATLAS Subsystem Entrypoint and Provider Factory

import { NatlasASRProvider } from './natlasProvider.js';
import { MockNatlasASRProvider } from './mockNatlasProvider.js';
import { NatlasASRClient } from './natlasClient.js';
import { loadNatlasConfig, validateNatlasConfig } from './natlasConfig.js';
import { 
  NATLAS_SUPPORTED_LANGUAGES, 
  isNatlasSupportedLanguage, 
  getNatlasSupportedLanguageCodes,
  getNatlasLanguageMetadata 
} from './natlasRegistry.js';
import * as NatlasErrors from './natlasErrors.js';
import { natlasTelemetry } from './natlasTelemetry.js';

// Singleton instance cache
let activeNatlasProvider = null;
let activeMockProvider = null;

/**
 * Returns a speech provider based on provider ID and language
 * @param {Object} options
 * @param {string} [options.provider] - 'natlas' | 'mock-natlas'
 * @param {string} [options.language] - Language code
 * @param {object} [options.config] - Optional custom config override
 * @returns {NatlasASRProvider|MockNatlasASRProvider}
 */
export function getSpeechProvider({ provider = 'natlas', language = 'yo-NG', config = null } = {}) {
  const loadedConfig = config || loadNatlasConfig();

  if (provider === 'mock-natlas') {
    if (!activeMockProvider) {
      activeMockProvider = new MockNatlasASRProvider();
      activeMockProvider.initialize(loadedConfig);
    }
    return activeMockProvider;
  }

  // Default provider ('natlas')
  if (!activeNatlasProvider) {
    activeNatlasProvider = new NatlasASRProvider(loadedConfig);
    activeNatlasProvider.initialize();
  }
  return activeNatlasProvider;
}

export {
  NatlasASRProvider,
  MockNatlasASRProvider,
  NatlasASRClient,
  loadNatlasConfig,
  validateNatlasConfig,
  NATLAS_SUPPORTED_LANGUAGES,
  isNatlasSupportedLanguage,
  getNatlasSupportedLanguageCodes,
  getNatlasLanguageMetadata,
  NatlasErrors,
  natlasTelemetry
};
