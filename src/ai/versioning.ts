/**
 * Centralized AI & Pipeline Versioning Metadata
 * Locked contract: all intelligence artifacts must record version provenance.
 */
export const PIPELINE_VERSION = '1.0.0';

export const PROMPT_VERSIONS = {
  atomization: 'v1.0',
  classification: 'v1.0',
  themes: 'v1.0',
  painPoints: 'v1.0',
  insights: 'v1.0',
  opportunities: 'v1.0'
} as const;

export const AI_MODELS = {
  classification: 'claude-3-5-sonnet-latest',
  synthesis: 'claude-3-5-sonnet-latest',
  embedding: 'text-embedding-3-small',
  embeddingDimensions: 1536,
  embeddingVersion: 'v1.0'
} as const;
