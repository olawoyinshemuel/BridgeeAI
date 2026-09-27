// test_natlas_foundation.js
// Verification suite for Phase 1 N-ATLAS Integration Foundation

import { loadNatlasConfig, validateNatlasConfig } from './services/natlas/natlasConfig.js';
import { 
  NATLAS_SUPPORTED_LANGUAGES, 
  isNatlasSupportedLanguage, 
  getNatlasSupportedLanguageCodes,
  getNatlasLanguageMetadata 
} from './services/natlas/natlasRegistry.js';
import { 
  NatlasError, 
  NatlasAuthenticationError, 
  NatlasUnsupportedLanguageError,
  NatlasTimeoutError 
} from './services/natlas/natlasErrors.js';
import { NatlasASRClient } from './services/natlas/natlasClient.js';

async function runFoundationTests() {
  console.log('=== TEST 1: N-ATLAS Configuration Loading & Validation ===');
  const config = loadNatlasConfig();
  console.log('Loaded Config:', {
    enabled: config.enabled,
    apiBaseUrl: config.apiBaseUrl,
    hasApiKey: Boolean(config.apiKey),
    timeoutMs: config.timeoutMs,
    maxRetries: config.maxRetries,
    mockFallback: config.mockFallback
  });

  const validation = validateNatlasConfig(config);
  console.log('Config Validation (default disabled state):', validation);
  if (!validation.valid && config.enabled) {
    throw new Error('Config should be valid in current environment');
  }

  console.log('\n=== TEST 2: Nigerian Language Capability Registry ===');
  const supported = getNatlasSupportedLanguageCodes();
  console.log('Supported Language Codes:', supported);

  const requiredLangs = ['yo-NG', 'ha-NG', 'ig-NG', 'en-NG'];
  for (const lang of requiredLangs) {
    const isSupported = isNatlasSupportedLanguage(lang);
    const meta = getNatlasLanguageMetadata(lang);
    console.log(` - Language ${lang}: supported=${isSupported}, name=${meta?.name}, capability=${meta?.capability}`);
    if (!isSupported || !meta) {
      throw new Error(`Expected language ${lang} to be supported`);
    }
  }

  // Unsupported language test
  const unsupportedCheck = isNatlasSupportedLanguage('xx-YY');
  console.log('Unsupported check (xx-YY):', unsupportedCheck);
  if (unsupportedCheck !== false) {
    throw new Error('Unsupported language check failed');
  }

  console.log('\n=== TEST 3: N-ATLAS Error Hierarchy ===');
  const authErr = new NatlasAuthenticationError('Auth failure test');
  const langErr = new NatlasUnsupportedLanguageError('fr-FR', supported);
  const timeoutErr = new NatlasTimeoutError('Timeout test');

  console.log('Auth Error Code:', authErr.code, '| Instance of NatlasError:', authErr instanceof NatlasError);
  console.log('Lang Error Code:', langErr.code, '| Details:', langErr.details);
  console.log('Timeout Error Code:', timeoutErr.code);

  if (authErr.code !== 'NATLAS_AUTH_ERROR' || langErr.code !== 'NATLAS_UNSUPPORTED_LANGUAGE') {
    throw new Error('Error hierarchy verification failed');
  }

  console.log('\n=== TEST 4: NatlasASRClient HealthCheck & Safeguards ===');
  const client = new NatlasASRClient(config);
  const health = await client.healthCheck();
  console.log('Client Health Status:', health);

  // Attempt transcription with unsupported language -> must throw NatlasUnsupportedLanguageError
  let rejected = false;
  try {
    await client.transcribe({
      audioData: Buffer.alloc(100),
      language: 'fr-FR'
    });
  } catch (err) {
    if (err instanceof NatlasUnsupportedLanguageError) {
      rejected = true;
      console.log('Safeguard Verified: Correctly rejected unsupported language (fr-FR)');
    } else {
      throw err;
    }
  }

  if (!rejected) {
    throw new Error('Client failed to reject unsupported language');
  }

  console.log('\n>>> ALL PHASE 1 FOUNDATION TESTS PASSED SUCCESSFULLY! <<<');
}

runFoundationTests().catch((err) => {
  console.error('Foundation Test Failed:', err);
  process.exit(1);
});
