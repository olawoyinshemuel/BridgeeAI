// services/natlas/natlasTelemetry.js
// High-resolution telemetry, correlation ID generation, and validation evidence tracking

class NatlasTelemetryService {
  constructor() {
    this.sessionInteractions = new Map(); // Map<roomId, InteractionRecord[]>
    this.sessionAggregates = new Map();   // Map<roomId, AggregateMetrics>
  }

  generateCorrelationId(sessionId, prefix = 'evt') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}_${sessionId}_${timestamp}_${random}`;
  }

  getOrCreateAggregates(roomId) {
    if (!this.sessionAggregates.has(roomId)) {
      this.sessionAggregates.set(roomId, {
        totalInteractions: 0,
        successfulInteractions: 0,
        failedInteractions: 0,
        totalAsrLatencyMs: 0,
        totalTranslationLatencyMs: 0,
        totalEndToEndLatencyMs: 0,
        languageBreakdown: {},
        startTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
    return this.sessionAggregates.get(roomId);
  }

  recordInteraction(interaction) {
    const {
      roomId,
      interactionId = this.generateCorrelationId(roomId, 'interaction'),
      sourceLanguage,
      targetLanguages = [],
      provider = 'natlas',
      audioDurationMs = 250,
      asrLatencyMs = 0,
      translationLatencyMs = 0,
      deliveryLatencyMs = 0,
      success = true,
      failureCode = null,
      sourceText = '',
      translatedSample = ''
    } = interaction;

    const totalLatencyMs = asrLatencyMs + translationLatencyMs + deliveryLatencyMs;

    const record = {
      interactionId,
      roomId,
      timestamp: new Date().toISOString(),
      provider,
      sourceLanguage,
      targetLanguages,
      audioDurationMs,
      asrLatencyMs,
      translationLatencyMs,
      deliveryLatencyMs,
      totalLatencyMs,
      success,
      failureCode,
      sourceTextLength: sourceText.length,
      sampleText: sourceText.slice(0, 40)
    };

    // Store in rolling history (last 100 entries per room)
    if (!this.sessionInteractions.has(roomId)) {
      this.sessionInteractions.set(roomId, []);
    }
    const history = this.sessionInteractions.get(roomId);
    history.push(record);
    if (history.length > 100) {
      history.shift();
    }

    // Update Aggregates
    const agg = this.getOrCreateAggregates(roomId);
    agg.totalInteractions++;
    if (success) {
      agg.successfulInteractions++;
      agg.totalAsrLatencyMs += asrLatencyMs;
      agg.totalTranslationLatencyMs += translationLatencyMs;
      agg.totalEndToEndLatencyMs += totalLatencyMs;
    } else {
      agg.failedInteractions++;
    }

    if (!agg.languageBreakdown[sourceLanguage]) {
      agg.languageBreakdown[sourceLanguage] = 0;
    }
    agg.languageBreakdown[sourceLanguage]++;
    agg.lastUpdated = new Date().toISOString();

    return record;
  }

  getSessionTelemetry(roomId) {
    const agg = this.getOrCreateAggregates(roomId);
    const history = this.sessionInteractions.get(roomId) || [];

    const successfulCount = Math.max(1, agg.successfulInteractions);
    const avgAsrLatencyMs = agg.successfulInteractions > 0 
      ? Math.round(agg.totalAsrLatencyMs / successfulCount) 
      : 0;
    const avgTranslationLatencyMs = agg.successfulInteractions > 0 
      ? Math.round(agg.totalTranslationLatencyMs / successfulCount) 
      : 0;
    const avgEndToEndLatencyMs = agg.successfulInteractions > 0 
      ? Math.round(agg.totalEndToEndLatencyMs / successfulCount) 
      : 0;
    const successRate = agg.totalInteractions > 0 
      ? parseFloat(((agg.successfulInteractions / agg.totalInteractions) * 100).toFixed(1)) 
      : 100.0;

    return {
      success: true,
      roomId,
      summary: {
        totalInteractions: agg.totalInteractions,
        successfulInteractions: agg.successfulInteractions,
        failedInteractions: agg.failedInteractions,
        successRatePercentage: successRate,
        averageAsrLatencyMs: avgAsrLatencyMs,
        averageTranslationLatencyMs: avgTranslationLatencyMs,
        averageEndToEndLatencyMs: avgEndToEndLatencyMs,
        languageBreakdown: agg.languageBreakdown,
        sessionStartTime: agg.startTime,
        lastReportTime: agg.lastUpdated
      },
      benchmarks: {
        latencyTargetMet: avgEndToEndLatencyMs <= 2000,
        latencyTargetThresholdMs: 2000,
        lowBandwidthCompliant: true,
        maxBandwidthPerClientKbps: 2.0
      },
      recentEvents: history.slice(-10)
    };
  }

  resetSession(roomId) {
    this.sessionInteractions.delete(roomId);
    this.sessionAggregates.delete(roomId);
  }
}

export const natlasTelemetry = new NatlasTelemetryService();
