import React, { useState } from 'react';
import {
  X,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Layers
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import {
  AppMetadata,
  ReviewFetchResult,
  ReviewPlatform,
  ReviewSourceAdapter
} from '@/evidence/adapters/review-source-adapter';
import { GooglePlayAdapter } from '@/evidence/adapters/google-play-adapter';
import { AppStoreAdapter } from '@/evidence/adapters/app-store-adapter';
import { GooglePlayIcon, AppStoreIcon } from '@/components/ui/store-icons';

interface AppReviewIngestionModalProps {
  initialPlatform?: ReviewPlatform;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

type IngestionState =
  | 'idle'
  | 'validating'
  | 'validated'
  | 'fetching_reviews'
  | 'fetched'
  | 'persisting'
  | 'processing'
  | 'success'
  | 'error';

export function AppReviewIngestionModal({
  initialPlatform = 'google_play',
  onClose,
  onSuccess
}: AppReviewIngestionModalProps) {
  const { ingestCanonicalBatch } = useTraceStore();
  const { addToast } = useToast();

  const [platform, setPlatform] = useState<ReviewPlatform>(initialPlatform);
  const [appUrl, setAppUrl] = useState('');
  const [limit, setLimit] = useState<number>(50);

  const [appMetadata, setAppMetadata] = useState<AppMetadata | null>(null);
  const [fetchResult, setFetchResult] = useState<ReviewFetchResult | null>(null);

  const [state, setState] = useState<IngestionState>('idle');
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Validate URL and load App Metadata Preview
  const handleValidateAndPreview = async () => {
    if (!appUrl.trim()) {
      setErrorMessage('Please enter a public app store URL.');
      return;
    }

    setErrorMessage(null);
    setErrorCode(null);
    setState('validating');
    setCurrentStepText('Validating storefront and retrieving app details...');

    try {
      let preview: AppMetadata;
      if (platform === 'google_play') {
        const validation = GooglePlayAdapter.validateUrl(appUrl);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid Google Play Store URL.');
        }
        preview = await GooglePlayAdapter.fetchAppMetadata(appUrl);
      } else {
        const validation = AppStoreAdapter.validateUrl(appUrl);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid Apple App Store URL.');
        }
        preview = await AppStoreAdapter.fetchAppMetadata(appUrl);
      }

      setAppMetadata(preview);
      setState('validated');
      setCurrentStepText('');
    } catch (err: unknown) {
      const error = err as Error;
      setState('error');
      setErrorCode(error.message.includes('not found') ? 'APP_NOT_FOUND' : 'VALIDATION_ERROR');
      setErrorMessage(error.message || 'Failed to retrieve app details from store.');
    }
  };

  // Fetch real reviews from the store
  const handleFetchReviews = async () => {
    if (!appMetadata) return;

    setErrorMessage(null);
    setErrorCode(null);
    setState('fetching_reviews');
    setCurrentStepText(
      `Fetching up to ${limit} real user reviews from ${
        platform === 'google_play' ? 'Google Play' : 'Apple App Store'
      }...`
    );

    try {
      let result: ReviewFetchResult;
      if (platform === 'google_play') {
        result = await GooglePlayAdapter.fetchReviews(appMetadata.sourceUrl, limit);
      } else {
        result = await AppStoreAdapter.fetchReviews(appMetadata.sourceUrl, limit);
      }

      if (result.reviews.length === 0) {
        setState('error');
        setErrorCode('NO_REVIEWS');
        setErrorMessage('No customer reviews were found for this application on the public store.');
        return;
      }

      setFetchResult(result);
      setState('fetched');
      setCurrentStepText('');
    } catch (err: unknown) {
      const error = err as Error;
      setState('error');
      setErrorCode('FETCH_ERROR');
      setErrorMessage(error.message || 'Failed to fetch reviews from store.');
    }
  };

  // Confirm ingestion: Persist canonical evidence -> Start durable processing job
  const handleConfirmIngest = async () => {
    if (!appMetadata || !fetchResult || fetchResult.reviews.length === 0) return;

    const sourceId = `src-${platform}-${Date.now()}`;
    const importId = `imp-${platform}-${Date.now()}`;
    const workspaceId = 'ws-default';

    setState('persisting');
    setCurrentStepText(`Normalizing & persisting ${fetchResult.reviews.length} reviews to Supabase...`);

    try {
      // 1. Normalization & Verbatim Evidence Mapping
      const { records, validCount, duplicateCount, invalidCount } = ReviewSourceAdapter.normalizeReviews(
        fetchResult.reviews,
        appMetadata,
        {
          workspaceId,
          sourceId,
          importId
        }
      );

      if (records.length === 0) {
        throw new Error('All fetched reviews were duplicate or invalid.');
      }

      // 2. Persist Evidence & Trigger Durable Pipeline
      setState('processing');
      setCurrentStepText('Running Trace intelligence pipeline: atomization, clustering, and priority scoring...');

      const channelTitle = `${appMetadata.appName} (${platform === 'google_play' ? 'Google Play' : 'App Store'})`;

      await ingestCanonicalBatch(records, {
        name: channelTitle,
        type: platform,
        importId,
        validCount,
        invalidCount,
        duplicateCount
      });

      setState('success');
      setCurrentStepText('');

      addToast({
        type: 'success',
        title: 'App Reviews Ingested',
        description: `Persisted ${validCount} real customer reviews into Supabase.`
      });

      if (onSuccess) onSuccess(validCount);
    } catch (err: unknown) {
      const error = err as Error;
      setState('error');
      setErrorCode('PIPELINE_ERROR');
      setErrorMessage(error.message || 'Failed to persist reviews and run intelligence pipeline.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="surface-card border border-slate-200 dark:border-white/10 rounded-2xl max-w-xl w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Clean Professional Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
              {platform === 'google_play' ? (
                <GooglePlayIcon className="w-5 h-5" />
              ) : (
                <AppStoreIcon className="w-5 h-5 rounded-md" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#EDEDED]">
                Import Store Reviews
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Acquire real public customer reviews from Google Play or Apple App Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={state === 'persisting' || state === 'processing'}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-[#EDEDED] rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Platform Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Storefront
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPlatform('google_play');
                  setAppMetadata(null);
                  setFetchResult(null);
                  setState('idle');
                }}
                disabled={state === 'persisting' || state === 'processing'}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  platform === 'google_play'
                    ? 'border-teal-500 bg-teal-500/5 text-slate-900 dark:text-[#EDEDED] shadow-xs'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400'
                }`}
              >
                <GooglePlayIcon className="w-4 h-4 shrink-0" />
                <span>Google Play</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlatform('app_store');
                  setAppMetadata(null);
                  setFetchResult(null);
                  setState('idle');
                }}
                disabled={state === 'persisting' || state === 'processing'}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  platform === 'app_store'
                    ? 'border-blue-500 bg-blue-500/5 text-slate-900 dark:text-[#EDEDED] shadow-xs'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400'
                }`}
              >
                <AppStoreIcon className="w-4 h-4 rounded shrink-0" />
                <span>Apple App Store</span>
              </button>
            </div>
          </div>

          {/* Public App URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Public App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder={
                  platform === 'google_play'
                    ? 'https://play.google.com/store/apps/details?id=com.spotify.music'
                    : 'https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580'
                }
                value={appUrl}
                onChange={e => {
                  setAppUrl(e.target.value);
                  setAppMetadata(null);
                  setFetchResult(null);
                  if (state !== 'idle') setState('idle');
                }}
                disabled={state === 'validating' || state === 'persisting' || state === 'processing'}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-sm text-slate-900 dark:text-[#EDEDED] placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleValidateAndPreview}
                disabled={!appUrl.trim() || state === 'validating' || state === 'persisting' || state === 'processing'}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {state === 'validating' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Preview'
                )}
              </button>
            </div>
          </div>

          {/* Clean App Preview Card */}
          {appMetadata && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2 flex items-start gap-3.5 animate-in fade-in duration-200">
              {appMetadata.iconUrl ? (
                <img
                  src={appMetadata.iconUrl}
                  alt={appMetadata.appName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-base text-slate-700 dark:text-slate-300 shrink-0">
                  {appMetadata.appName.slice(0, 1)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED] truncate">
                    {appMetadata.appName}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {platform === 'google_play' ? 'Google Play' : 'iOS'}
                  </span>
                </div>
                {appMetadata.developer && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {appMetadata.developer}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {appMetadata.rating !== undefined && (
                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {appMetadata.rating}
                    </span>
                  )}
                  {appMetadata.totalReviews !== undefined && (
                    <span className="text-slate-400">
                      {appMetadata.totalReviews.toLocaleString()} ratings
                    </span>
                  )}
                  <a
                    href={appMetadata.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Storefront <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Review Limit & Fetch Action */}
          {appMetadata && state !== 'success' && (
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Requested Review Count
                </label>
                <div className="flex gap-1.5">
                  {[25, 50, 100].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setLimit(cnt)}
                      disabled={state === 'fetching_reviews' || state === 'persisting' || state === 'processing'}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        limit === cnt
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {state === 'validated' && (
                <button
                  type="button"
                  onClick={handleFetchReviews}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  Fetch Reviews from Store <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Acquired Reviews Summary */}
          {fetchResult && state === 'fetched' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 dark:text-[#EDEDED] font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  Acquired {fetchResult.fetchedCount} Real Reviews
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Requested: {fetchResult.requestedCount}
                </span>
              </div>

              {fetchResult.reviews.length > 0 && (
                <div className="p-3 rounded-lg bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic">
                    "{fetchResult.reviews[0].text}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Author: {fetchResult.reviews[0].author || 'Unknown'}</span>
                    <span className="text-amber-500 font-semibold">{fetchResult.reviews[0].rating}★</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmIngest}
                className="w-full py-2.5 rounded-xl bg-[#2E8B75] hover:bg-[#267361] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
              >
                Persist Evidence & Run AI Pipeline <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Progress Indicator */}
          {(state === 'fetching_reviews' || state === 'persisting' || state === 'processing') && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-teal-500 animate-spin shrink-0" />
              <div className="flex-1 text-xs">
                <p className="font-semibold text-slate-900 dark:text-[#EDEDED]">
                  {state === 'fetching_reviews'
                    ? 'Fetching Store Reviews'
                    : state === 'persisting'
                    ? 'Persisting Evidence'
                    : 'Processing Intelligence Pipeline'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentStepText}
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="p-5 rounded-xl border border-teal-500/20 bg-teal-500/5 text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                  Reviews Ingested Successfully
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Persisted {fetchResult?.fetchedCount || 0} customer reviews into Supabase and calculated 5-factor opportunity scores.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors"
              >
                View in Inbox
              </button>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  {errorCode ? `Error: ${errorCode}` : 'Ingestion Error'}
                </span>
                <p className="text-rose-600 dark:text-rose-300 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setState('idle');
                    setErrorMessage(null);
                    setErrorCode(null);
                  }}
                  className="mt-2 text-rose-700 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Try Again
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={state === 'persisting' || state === 'processing'}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors disabled:opacity-50"
          >
            {state === 'success' ? 'Done' : 'Cancel'}
          </button>
        </div>

      </div>
    </div>
  );
}
