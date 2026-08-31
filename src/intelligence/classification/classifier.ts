import { FeedbackAtom, IntentType, SentimentType, SeverityType } from '@/types/trace';

export class Classifier {
  /**
   * Validates and normalizes classification properties on Feedback Atoms.
   */
  public static classifyAtom(atom: FeedbackAtom): FeedbackAtom {
    const text = atom.atomText.toLowerCase();

    // Deterministic intent classification
    let intent: IntentType = atom.intent;
    if (/crash|freeze|error|bug|broken|failed|timeout|latency/i.test(text)) {
      intent = 'bug_report';
    } else if (/add|support|want|please|need|feature|request|allow/i.test(text)) {
      intent = 'feature_request';
    } else if (/love|great|awesome|excellent|amazing|good/i.test(text)) {
      intent = 'praise';
    }

    // Continuous sentiment scoring (-1.0 to +1.0)
    let sentiment: SentimentType = atom.sentiment;
    let sentimentScore = atom.sentimentScore ?? 0.0;
    if (intent === 'praise') {
      sentiment = 'positive';
      sentimentScore = Math.max(0.7, sentimentScore);
    } else if (intent === 'bug_report' || intent === 'complaint') {
      sentiment = 'negative';
      sentimentScore = Math.min(-0.5, sentimentScore);
    } else {
      sentiment = 'neutral';
      sentimentScore = 0.0;
    }

    // Severity scoring
    let severity: SeverityType = atom.severity;
    if (intent === 'bug_report') {
      if (/crash|data loss|corrupt|security|lockout|fatal|stuck/i.test(text)) {
        severity = 'critical';
      } else {
        severity = 'high';
      }
    } else if (intent === 'praise') {
      severity = 'low';
    }

    return {
      ...atom,
      intent,
      sentiment,
      sentimentScore,
      severity
    };
  }
}
