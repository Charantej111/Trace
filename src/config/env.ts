export interface ServerEnv {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  GEMINI_EMBEDDING_MODEL: string;
  GOOGLE_PLAY_PACKAGE_NAME?: string;
  GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_PLAY_PRIVATE_KEY?: string;
  PIPELINE_VERSION: string;
  PROMPT_VERSION: string;
}

export function getServerEnv(): ServerEnv {
  const envSource: Record<string, string | undefined> =
    typeof process !== 'undefined' && process.env
      ? process.env
      : (typeof import.meta !== 'undefined' && (import.meta as unknown as { env: Record<string, string | undefined> }).env) || {};

  return {
    NEXT_PUBLIC_SUPABASE_URL: envSource.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: envSource.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: envSource.SUPABASE_SERVICE_ROLE_KEY || '',
    GEMINI_API_KEY: envSource.GEMINI_API_KEY || '',
    GEMINI_MODEL: envSource.GEMINI_MODEL || 'gemini-3.1-flash-lite',
    GEMINI_EMBEDDING_MODEL: envSource.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    GOOGLE_PLAY_PACKAGE_NAME: envSource.GOOGLE_PLAY_PACKAGE_NAME || '',
    GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL: envSource.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL || '',
    GOOGLE_PLAY_PRIVATE_KEY: envSource.GOOGLE_PLAY_PRIVATE_KEY || '',
    PIPELINE_VERSION: envSource.PIPELINE_VERSION || '1.0.0',
    PROMPT_VERSION: envSource.PROMPT_VERSION || 'v1'
  };
}

export const env = getServerEnv();
