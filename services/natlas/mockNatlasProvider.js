// services/natlas/mockNatlasProvider.js
// Mock N-ATLAS ASR Provider for local testing, offline development, and zero-key demonstrations

import { NATLAS_SUPPORTED_LANGUAGES } from './natlasRegistry.js';

// Domain-specific speech corpora in authentic Nigerian languages with correct diacritics
const NIGERIAN_SPEECH_CORPORA = {
  'yo-NG': [
    "Ẹ káàbọ̀ sí àpérò àgbáyé lórí ọgbọ́n ẹ̀rọ àti ìbánisọ̀rọ̀.",
    "A ń lo ìmọ̀ ẹ̀rọ láti mú kí gbogbo ènìyàn gbọ́ ara wọn yé láìsí ìdènà.",
    "Bí a bá ti ń sọ̀rọ̀ báyìí, ẹ̀rọ BridgeeAI ń ṣe ìtumọ̀ rẹ̀ lẹ́sẹ̀kẹsẹ̀.",
    "Ọ̀rọ̀ wa ń dún jákèjádò ayé pẹ̀lú àlàáfíà àti ìtẹ̀síwájú.",
    "Ẹ jẹ́ kí a tẹ̀síwájú nínú ìfọwọ́sowọ́pọ̀ láti kọ́ ọjọ́ ọ̀la rere."
  ],
  'ha-NG': [
    "Barka da zuwa babban taron kasa da kasa kan fasahar zamani.",
    "Muna amfani da sabbin hanyoyin sadarwa don hada kan al'umma.",
    "Duk abin da mai magana ya fada, tsarin yana fassara shi nan take.",
    "Wannan babban ci gaba ne ga dukkan kasashenmu baki daya.",
    "Bari mu ci gaba da aiki tare don samar da makoma mai haske."
  ],
  'ig-NG': [
    "Nnọọ na nnukwu ọgbakọ mba ụwa maka ọganihu teknụzụ.",
    "Anyị na-eji amamihe ọgbara ọhụrụ emepụta njikọ n'etiti ndị mmadụ.",
    "Okwu ọ bụla onye na-ekwu okwu na-asụ na-atụgharị n'otu ntabi anya.",
    "Nke a na-enye ohere ka onye ọ bụla nụrụ ma ghọta ozi a nke ọma.",
    "Ka anyị jikọọ aka ọnụ rụọ ọrụ maka ọdịmma obodo anyị niile."
  ],
  'en-NG': [
    "Welcome everybody to this special innovation summit today.",
    "We are using technology to make sure language barrier no stop anybody.",
    "As speaker dey drop word, BridgeeAI dey translate am live and direct.",
    "Every participant inside this venue dey follow up without delay.",
    "Make we continue to collaborate build better solutions for our people."
  ]
};

export class MockNatlasASRProvider {
  constructor() {
    this.id = 'mock-natlas';
    this.name = 'Mock N-ATLAS Speech Recognition Provider';
    this.supportedLanguages = Object.keys(NATLAS_SUPPORTED_LANGUAGES);
    this.sessionStates = new Map();
    this.partialCallbacks = new Set();
    this.finalCallbacks = new Set();
  }

  async initialize(config = {}) {
    this.config = config;
    return true;
  }

  getTracker(roomId, language = 'yo-NG') {
    const key = `${roomId}:${language}`;
    if (!this.sessionStates.has(key)) {
      const corpus = NIGERIAN_SPEECH_CORPORA[language] || NIGERIAN_SPEECH_CORPORA['yo-NG'];
      this.sessionStates.set(key, {
        language,
        corpus,
        sentenceIndex: 0,
        wordIndex: 0,
        chunkAccumulator: 0,
        wordsInCurrentSentence: corpus[0].split(' ')
      });
    }
    return this.sessionStates.get(key);
  }

  onPartial(callback) {
    if (typeof callback === 'function') {
      this.partialCallbacks.add(callback);
    }
  }

  onFinal(callback) {
    if (typeof callback === 'function') {
      this.finalCallbacks.add(callback);
    }
  }

  /**
   * Processes a 250ms audio chunk and simulates realistic speech timing
   */
  async processChunk(roomId, audioBuffer, language = 'yo-NG') {
    const tracker = this.getTracker(roomId, language);
    tracker.chunkAccumulator++;

    // Advance speech every 2 chunks (~500ms = 2 words)
    if (tracker.chunkAccumulator >= 2) {
      tracker.chunkAccumulator = 0;
      tracker.wordIndex += 2;

      const currentSentenceWords = tracker.wordsInCurrentSentence;
      const visibleWords = currentSentenceWords.slice(0, tracker.wordIndex);
      const partialText = visibleWords.join(' ');

      if (tracker.wordIndex < currentSentenceWords.length) {
        // Emit partial transcript
        const partialEvent = {
          roomId,
          type: 'partial',
          text: partialText,
          language,
          isFinal: false,
          provider: 'mock-natlas',
          timestamp: new Date().toISOString()
        };

        for (const cb of this.partialCallbacks) {
          try {
            cb(partialEvent);
          } catch (e) {
            console.error('[MockNatlas] Partial callback error:', e);
          }
        }
        return partialEvent;
      } else {
        // Sentence boundary reached (VAD trigger)
        const finalSentence = currentSentenceWords.join(' ');
        const finalEvent = {
          roomId,
          type: 'final',
          text: finalSentence,
          language,
          isFinal: true,
          provider: 'mock-natlas',
          timestamp: new Date().toISOString()
        };

        for (const cb of this.finalCallbacks) {
          try {
            cb(finalEvent);
          } catch (e) {
            console.error('[MockNatlas] Final callback error:', e);
          }
        }

        // Advance to next sentence in Nigerian corpus
        tracker.sentenceIndex = (tracker.sentenceIndex + 1) % tracker.corpus.length;
        tracker.wordIndex = 0;
        tracker.wordsInCurrentSentence = tracker.corpus[tracker.sentenceIndex].split(' ');

        return finalEvent;
      }
    }

    return null;
  }

  resetSession(roomId) {
    for (const key of this.sessionStates.keys()) {
      if (key.startsWith(`${roomId}:`)) {
        this.sessionStates.delete(key);
      }
    }
  }

  async healthCheck() {
    return {
      ok: true,
      status: 'ready',
      latencyMs: 1,
      supportedLanguages: this.supportedLanguages,
      message: 'Mock N-ATLAS ASR Provider operational'
    };
  }
}
