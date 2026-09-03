import { z } from 'zod';
import {
  IntentType,
  SentimentType,
  EmotionalState,
  SeverityType,
  ConfidenceLevel,
  RatingAlignment
} from '../../types/trace';

export const IntentSchema = z.enum([
  'praise',
  'complaint',
  'feature_request',
  'bug_report',
  'question',
  'usability_issue',
  'cancellation',
  'pricing',
  'other'
]);

export const SentimentLabelSchema = z.enum([
  'positive',
  'neutral',
  'negative',
  'mixed'
]);

export const EmotionalStateSchema = z.enum([
  'joy',
  'satisfaction',
  'delight',
  'excitement',
  'gratitude',
  'frustration',
  'anger',
  'disappointment',
  'confusion',
  'sadness',
  'anxiety',
  'relief',
  'trust',
  'neutral',
  'other'
]);

export const SeveritySchema = z.enum([
  'none',
  'low',
  'medium',
  'high',
  'critical'
]);

export const ConfidenceSchema = z.enum([
  'high',
  'medium',
  'low'
]);

export const RatingAlignmentSchema = z.enum([
  'strongly_aligned',
  'aligned',
  'mixed',
  'contradictory',
  'unavailable'
]);

export const ClassificationOutputSchema = z.object({
  intent: IntentSchema,
  sentimentScore: z.number().min(-1).max(1),
  sentimentLabel: SentimentLabelSchema,
  emotion: EmotionalStateSchema,
  emotionalIntensity: z.number().min(0).max(1),
  severity: SeveritySchema,
  confidence: ConfidenceSchema
});

export type ClassificationOutput = z.infer<typeof ClassificationOutputSchema>;

export interface ClassificationContext {
  analysisText: string;
  rating?: number;
  appVersion?: string;
  customerSegmentName?: string;
}

export interface ValidatedClassification {
  intent: IntentType;
  sentiment: SentimentType;
  sentimentScore: number;
  sentimentLabel: SentimentType;
  emotionalState: EmotionalState;
  emotionalIntensity: number;
  severity: SeverityType;
  confidence: ConfidenceLevel;
  ratingAlignment: RatingAlignment;
  model: string;
  provider: string;
  promptVersion: string;
  pipelineVersion: string;
}
