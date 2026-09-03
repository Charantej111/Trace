export interface ServerEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
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

  const supabaseUrl =
    envSource.VITE_SUPABASE_URL ||
    envSource.NEXT_PUBLIC_SUPABASE_URL ||
    envSource.SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    envSource.VITE_SUPABASE_ANON_KEY ||
    envSource.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    envSource.SUPABASE_ANON_KEY ||
    '';

  const geminiApiKey =
    envSource.VITE_GEMINI_API_KEY ||
    envSource.GEMINI_API_KEY ||
    '';

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: envSource.SUPABASE_SERVICE_ROLE_KEY || '',
    GEMINI_API_KEY: geminiApiKey,
    GEMINI_MODEL: envSource.VITE_GEMINI_MODEL || envSource.GEMINI_MODEL || 'gemini-3.6-flash',
    GEMINI_EMBEDDING_MODEL: envSource.VITE_GEMINI_EMBEDDING_MODEL || envSource.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    GOOGLE_PLAY_PACKAGE_NAME: envSource.GOOGLE_PLAY_PACKAGE_NAME || '',
    GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL: envSource.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL || '',
    GOOGLE_PLAY_PRIVATE_KEY: envSource.GOOGLE_PLAY_PRIVATE_KEY || '',
    PIPELINE_VERSION: envSource.PIPELINE_VERSION || '1.0.0',
    PROMPT_VERSION: envSource.PROMPT_VERSION || 'v1'
  };
}

export const env = getServerEnv();
