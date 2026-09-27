// services/natlas/natlasRegistry.js
// Language capability and provider routing registry for Nigerian languages

export const NATLAS_SUPPORTED_LANGUAGES = {
  'yo-NG': {
    code: 'yo-NG',
    name: 'Yorùbá',
    englishName: 'Yoruba',
    script: 'Latin (Tonal diacritics)',
    capability: 'yoruba-asr',
    sampleUtterances: [
      'Ẹ káàbọ̀ sí àpérò wa lónìí.',
      'A ń lo ìmọ̀ ẹ̀rọ láti mú kí gbogbo ènìyàn gbọ́ ara wọn yé.',
      'Ọ̀rọ̀ tí a sọ ní èdè Yorùbá yóò yí padà sí èdè míràn lójú ẹsẹ̀.'
    ]
  },
  'ha-NG': {
    code: 'ha-NG',
    name: 'Hausa',
    englishName: 'Hausa',
    script: 'Latin (Boko diacritics)',
    capability: 'hausa-asr',
    sampleUtterances: [
      'Barka da zuwa taronmu na yau.',
      'Muna amfani da fasahar zamani don saukaka fahimtar juna.',
      'Maganar da aka yi da harshen Hausa za ta fassara nan take.'
    ]
  },
  'ig-NG': {
    code: 'ig-NG',
    name: 'Asụsụ Igbo',
    englishName: 'Igbo',
    script: 'Latin (Sub-dots)',
    capability: 'igbo-asr',
    sampleUtterances: [
      'Nnọọ na nzukọ anyị taa.',
      'Anyị na-eji nkà na ụzụ ọgbara ọhụrụ eme ka onye ọ bụla nwee nghọta.',
      'Okwu a na-asụ n’asụsụ Igbo ga-atụgharị ozugbo n’asụsụ ọzọ.'
    ]
  },
  'en-NG': {
    code: 'en-NG',
    name: 'Nigerian English / Pidgin',
    englishName: 'Nigerian English',
    script: 'Latin',
    capability: 'nigerian-english-asr',
    sampleUtterances: [
      'Welcome everyone to this important gathering today.',
      'We are making sure that language barrier no dey stop anybody again.',
      'Everything wey speaker dey talk, BridgeeAI go translate am sharp sharp.'
    ]
  }
};

/**
 * Checks if a language code is supported by N-ATLAS
 * @param {string} langCode
 * @returns {boolean}
 */
export function isNatlasSupportedLanguage(langCode) {
  if (!langCode) return false;
  const normalized = langCode.trim();
  return Boolean(NATLAS_SUPPORTED_LANGUAGES[normalized]);
}

/**
 * Returns list of language codes supported by N-ATLAS
 * @returns {string[]}
 */
export function getNatlasSupportedLanguageCodes() {
  return Object.keys(NATLAS_SUPPORTED_LANGUAGES);
}

/**
 * Resolves capability metadata for a language
 * @param {string} langCode
 * @returns {object|null}
 */
export function getNatlasLanguageMetadata(langCode) {
  return NATLAS_SUPPORTED_LANGUAGES[langCode] || null;
}
