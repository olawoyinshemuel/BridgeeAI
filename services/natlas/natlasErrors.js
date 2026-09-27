// services/natlas/natlasErrors.js
// Standardized error taxonomy for N-ATLAS ASR provider

export class NatlasError extends Error {
  constructor(message, code = 'NATLAS_GENERAL_ERROR', details = null) {
    super(message);
    this.name = 'NatlasError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class NatlasAuthenticationError extends NatlasError {
  constructor(message = 'Invalid or missing N-ATLAS API Key', details = null) {
    super(message, 'NATLAS_AUTH_ERROR', details);
    this.name = 'NatlasAuthenticationError';
  }
}

export class NatlasNetworkError extends NatlasError {
  constructor(message = 'Failed to connect to N-ATLAS API endpoint', details = null) {
    super(message, 'NATLAS_NETWORK_ERROR', details);
    this.name = 'NatlasNetworkError';
  }
}

export class NatlasTimeoutError extends NatlasError {
  constructor(message = 'N-ATLAS API request timed out', details = null) {
    super(message, 'NATLAS_TIMEOUT_ERROR', details);
    this.name = 'NatlasTimeoutError';
  }
}

export class NatlasUnsupportedLanguageError extends NatlasError {
  constructor(language, supportedList = []) {
    super(
      `Language "${language}" is not supported by N-ATLAS ASR. Supported: ${supportedList.join(', ')}`,
      'NATLAS_UNSUPPORTED_LANGUAGE',
      { language, supportedList }
    );
    this.name = 'NatlasUnsupportedLanguageError';
  }
}

export class NatlasRateLimitError extends NatlasError {
  constructor(message = 'N-ATLAS API rate limit exceeded', details = null) {
    super(message, 'NATLAS_RATE_LIMIT_ERROR', details);
    this.name = 'NatlasRateLimitError';
  }
}
