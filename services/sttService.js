// BridgeeAI — Speech-to-Text & Sentence Boundary (VAD) Service
// Converts streaming 250ms audio chunks into real-time partials and finalized sentences

// Template-specific speech corpora for realistic presentation simulation
const domainCorpora = {
  'TECH-2026': [
    "Welcome everyone to the Global AI and Ethics Summit 2026.",
    "Today we are exploring how real-time multilingual communication breaks down barriers.",
    "When a presenter speaks in one language, every participant should understand instantly.",
    "Our core architecture streams lightweight text captions under two kilobytes per second.",
    "This ensures that delegates on cellular connections remain completely included.",
    "Machine learning models must be designed with human dignity and accessibility first.",
    "Let us examine our findings from the international deployment trials."
  ],
  'EDU-101': [
    "Good morning class, welcome to module four of our Machine Learning Bootcamp.",
    "Today we are analyzing stochastic gradient descent and loss function optimization.",
    "Notice how backpropagation computes gradients backwards through the computational graph.",
    "By adjusting our learning rate schedule, we achieve significantly faster convergence.",
    "Please open your interactive notebook and execute the third code cell."
  ],
  'CHURCH-LIVE': [
    "Grace and peace to everyone joining our sanctuary and online fellowship today.",
    "We are gathered together from many nations and communities in unity.",
    "No matter what language you speak, the message of love and fellowship is universal.",
    "Let us open our hearts as we read together from the scriptures."
  ],
  'GLOBAL-EVENT': [
    "Distinguished delegates, welcome to the World Civic Innovation Assembly.",
    "Today representatives from sixty nations are discussing climate resilience strategies.",
    "Effective civic collaboration requires every voice to be heard and understood.",
    "We will now begin the keynote presentations from our regional leaders."
  ]
};

export class STTService {
  constructor() {
    this.sessionStates = new Map();
    this.realSpeechActiveRooms = new Set();
  }

  setRealSpeechActive(roomId, active = true) {
    if (active) {
      this.realSpeechActiveRooms.add(roomId);
    } else {
      this.realSpeechActiveRooms.delete(roomId);
    }
  }

  isRealSpeechActive(roomId) {
    return this.realSpeechActiveRooms.has(roomId);
  }

  // Initialize or get STT tracker for a session
  getTracker(roomId) {
    if (!this.sessionStates.has(roomId)) {
      const sentences = domainCorpora[roomId] || domainCorpora['TECH-2026'];
      this.sessionStates.set(roomId, {
        sentences,
        sentenceIndex: 0,
        wordIndex: 0,
        chunkAccumulator: 0,
        wordsInCurrentSentence: sentences[0].split(' ')
      });
    }
    return this.sessionStates.get(roomId);
  }

  // Process a 250ms audio chunk from the host
  processAudioChunk(roomId, audioBuffer, onPartial, onFinal) {
    // If real speech recognition is active in the host browser, suppress mock corpus
    if (this.isRealSpeechActive(roomId)) {
      return;
    }

    const tracker = this.getTracker(roomId);
    tracker.chunkAccumulator++;

    // Every 250ms chunk (or pair of chunks ~500ms), advance partial transcription
    if (tracker.chunkAccumulator >= 2) {
      tracker.chunkAccumulator = 0;
      tracker.wordIndex += 2; // Advance 2 words per ~500ms (natural speaking rate ~150 wpm)

      const currentSentenceWords = tracker.wordsInCurrentSentence;
      const visibleWords = currentSentenceWords.slice(0, tracker.wordIndex);
      const partialText = visibleWords.join(' ');

      // If we haven't reached the end of the current sentence, emit partial
      if (tracker.wordIndex < currentSentenceWords.length) {
        if (onPartial) {
          onPartial({
            roomId,
            partialText,
            timestamp: new Date().toISOString(),
            isFinal: false
          });
        }
      } else {
        // Sentence boundary reached (VAD trigger)
        const finalSentence = currentSentenceWords.join(' ');
        
        if (onFinal) {
          onFinal({
            roomId,
            finalText: finalSentence,
            timestamp: new Date().toISOString(),
            isFinal: true
          });
        }

        // Cycle to next sentence in presentation corpus
        tracker.sentenceIndex = (tracker.sentenceIndex + 1) % tracker.sentences.length;
        tracker.wordIndex = 0;
        tracker.wordsInCurrentSentence = tracker.sentences[tracker.sentenceIndex].split(' ');
      }
    }
  }

  resetSession(roomId) {
    this.sessionStates.delete(roomId);
    this.realSpeechActiveRooms.delete(roomId);
  }
}

export const sttEngine = new STTService();
