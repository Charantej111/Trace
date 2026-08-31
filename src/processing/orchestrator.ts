import {
  ProcessingJob,
  ProcessingJobStage,
  ProcessingStageType,
  ProductContext,
  CustomerSegment,
  Feedback,
  FeedbackAtom,
  Theme,
  PainPoint,
  Insight,
  Opportunity
} from '@/types/trace';
import { ProcessingJobFactory } from './jobs';
import { STAGE_DEPENDENCIES, StageDependencyValidator } from './stage-dependencies';
import { ProcessingJobRepo } from '@/repositories/processing-job-repo';
import { FeedbackRepo } from '@/repositories/feedback-repo';
import { IntelligenceRepo } from '@/repositories/intelligence-repo';
import { DecisionsRepo } from '@/repositories/decisions-repo';
import { SubstringAtomizer } from '@/intelligence/atomization/substring-atomizer';
import { Classifier } from '@/intelligence/classification/classifier';
import { EmbeddingService } from '@/intelligence/embeddings/embedding-service';
import { VectorClusterer, CandidateCluster } from '@/intelligence/clustering/vector-clusterer';
import { ThemeSynthesizer } from '@/intelligence/themes/theme-synthesizer';
import { PainPointSynthesizer } from '@/intelligence/pain-points/pain-point-synthesizer';
import { InsightSynthesizer } from '@/intelligence/insights/insight-synthesizer';
import { ExplainableScoringEngine } from '@/scoring/explainable-scoring';

export type JobProgressCallback = (job: ProcessingJob, currentStage?: ProcessingJobStage) => void;

export class ProcessingOrchestrator {
  private static activeProgressListeners: Set<JobProgressCallback> = new Set();

  public static onProgress(callback: JobProgressCallback): () => void {
    this.activeProgressListeners.add(callback);
    return () => {
      this.activeProgressListeners.delete(callback);
    };
  }


  private static notifyProgress(job: ProcessingJob, stage?: ProcessingJobStage) {
    this.activeProgressListeners.forEach(cb => cb(job, stage));
  }

  /**
   * Initializes a durable 3-level processing job with all 9 stages.
   */
  public static async createJob(params: {
    workspaceId: string;
    importId?: string;
    totalRecords: number;
    type?: 'import' | 'reprocess' | 'incremental';
  }): Promise<ProcessingJob> {
    const job = ProcessingJobFactory.createJob(params);
    await ProcessingJobRepo.saveJob(job);

    const stages: ProcessingStageType[] = [
      'normalization',
      'atomization',
      'classification',
      'embedding',
      'clustering',
      'theme_generation',
      'pain_point_generation',
      'insight_generation',
      'opportunity_generation'
    ];

    for (const stageName of stages) {
      const stage = ProcessingJobFactory.createStage({
        jobId: job.id,
        stage: stageName,
        totalItems: params.totalRecords
      });
      await ProcessingJobRepo.saveStage(stage);
    }

    return job;
  }

  /**
   * Executes processing stages sequentially or resumes from a failed stage.
   */
  public static async executeJob(
    jobId: string,
    context?: ProductContext,
    customerSegments: CustomerSegment[] = []
  ): Promise<ProcessingJob> {
    const job = await ProcessingJobRepo.getJobById(jobId);
    if (!job) throw new Error(`Processing job ${jobId} not found`);

    job.status = 'processing';
    job.startedAt = job.startedAt || new Date().toISOString();
    await ProcessingJobRepo.saveJob(job);

    const stages = await ProcessingJobRepo.getStagesByJobId(jobId);
    const completedStages = new Set<ProcessingStageType>(
      stages.filter(s => s.status === 'completed').map(s => s.stage)
    );

    const stageOrder: ProcessingStageType[] = [
      'normalization',
      'atomization',
      'classification',
      'embedding',
      'clustering',
      'theme_generation',
      'pain_point_generation',
      'insight_generation',
      'opportunity_generation'
    ];

    try {
      for (const stageName of stageOrder) {
        const stage = stages.find(s => s.stage === stageName);
        if (!stage || stage.status === 'completed') continue;

        // Verify dependencies
        const check = StageDependencyValidator.canExecuteStage(stageName, completedStages);
        if (!check.allowed) {
          throw new Error(`Cannot execute stage '${stageName}': missing dependency '${check.missingDependency}'`);
        }

        stage.status = 'processing';
        stage.startedAt = new Date().toISOString();
        await ProcessingJobRepo.saveStage(stage);
        this.notifyProgress(job, stage);

        // Execute discrete stage
        await this.runStage(job, stage, context, customerSegments);

        stage.status = 'completed';
        stage.completedAt = new Date().toISOString();
        stage.processedItems = stage.totalItems;
        await ProcessingJobRepo.saveStage(stage);
        completedStages.add(stageName);

        this.notifyProgress(job, stage);
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.processedRecords = job.totalRecords;
      await ProcessingJobRepo.saveJob(job);
      this.notifyProgress(job);

    } catch (err: unknown) {
      const error = err as Error;
      job.status = 'partially_failed';
      job.error = error.message;
      await ProcessingJobRepo.saveJob(job);
      this.notifyProgress(job);
      throw error;
    }

    return job;
  }

  /**
   * Executes a single discrete stage.
   */
  private static async runStage(
    job: ProcessingJob,
    stage: ProcessingJobStage,
    context?: ProductContext,
    customerSegments: CustomerSegment[] = []
  ): Promise<void> {
    const workspaceId = job.workspaceId;

    switch (stage.stage) {
      case 'normalization': {
        // Evidence is already normalized & persisted before job creation
        stage.processedItems = stage.totalItems;
        break;
      }

      case 'atomization': {
        const feedbackList = await FeedbackRepo.getFeedbackByWorkspace(workspaceId);
        const allAtoms: FeedbackAtom[] = [];

        for (const fb of feedbackList) {
          const item = ProcessingJobFactory.createItem({
            stageId: stage.id,
            jobId: job.id,
            entityType: 'feedback',
            entityId: fb.id
          });
          item.status = 'processing';
          await ProcessingJobRepo.saveItem(item);

          try {
            const atoms = await SubstringAtomizer.atomizeFeedback(fb, job.id);
            allAtoms.push(...atoms);
            item.status = 'completed';
          } catch (e: unknown) {
            const err = e as Error;
            item.status = 'failed';
            item.error = err.message;
            stage.failedItems++;
          }
          await ProcessingJobRepo.saveItem(item);
          stage.processedItems++;
        }

        await FeedbackRepo.saveAtoms(allAtoms);
        break;
      }

      case 'classification': {
        const atoms = await FeedbackRepo.getAtomsByWorkspace(workspaceId);
        const classified = atoms.map(atom => Classifier.classifyAtom(atom));
        await FeedbackRepo.saveAtoms(classified);
        stage.processedItems = stage.totalItems;
        break;
      }

      case 'embedding': {
        const verifiedAtoms = await FeedbackRepo.getVerifiedAtomsByWorkspace(workspaceId);
        const embeddedAtoms: FeedbackAtom[] = [];

        for (const atom of verifiedAtoms) {
          const item = ProcessingJobFactory.createItem({
            stageId: stage.id,
            jobId: job.id,
            entityType: 'atom',
            entityId: atom.id
          });
          item.status = 'processing';
          await ProcessingJobRepo.saveItem(item);

          try {
            const res = await EmbeddingService.embedAtom(atom, job.id);
            embeddedAtoms.push(res);
            item.status = 'completed';
          } catch (e: unknown) {
            const err = e as Error;
            item.status = 'failed';
            item.error = err.message;
            stage.failedItems++;
          }
          await ProcessingJobRepo.saveItem(item);
          stage.processedItems++;
        }

        await FeedbackRepo.saveAtoms(embeddedAtoms);
        break;
      }

      case 'clustering': {
        const embeddedAtoms = await FeedbackRepo.getVerifiedAtomsByWorkspace(workspaceId);
        const clusters = VectorClusterer.clusterAtoms(embeddedAtoms);
        stage.processedItems = stage.totalItems;
        break;
      }

      case 'theme_generation': {
        const embeddedAtoms = await FeedbackRepo.getVerifiedAtomsByWorkspace(workspaceId);
        const clusters = VectorClusterer.clusterAtoms(embeddedAtoms);
        const themes = await ThemeSynthesizer.synthesizeThemes(clusters, workspaceId, job.id);
        await IntelligenceRepo.saveThemes(themes);
        stage.processedItems = stage.totalItems;
        break;
      }

      case 'pain_point_generation': {
        const themes = await IntelligenceRepo.getThemesByWorkspace(workspaceId);
        const atoms = await FeedbackRepo.getAtomsByWorkspace(workspaceId);
        const feedbackList = await FeedbackRepo.getFeedbackByWorkspace(workspaceId);

        const painPoints = await PainPointSynthesizer.synthesizePainPoints(
          themes,
          atoms,
          feedbackList,
          workspaceId,
          job.id
        );
        await IntelligenceRepo.savePainPoints(painPoints);
        stage.processedItems = stage.totalItems;
        break;
      }

      case 'insight_generation': {
        const painPoints = await IntelligenceRepo.getPainPointsByWorkspace(workspaceId);
        const atoms = await FeedbackRepo.getAtomsByWorkspace(workspaceId);
        const feedbackList = await FeedbackRepo.getFeedbackByWorkspace(workspaceId);

        const insights = await InsightSynthesizer.synthesizeInsights(
          painPoints,
          atoms,
          feedbackList,
          workspaceId,
          job.id
        );
        await IntelligenceRepo.saveInsights(insights);
        stage.processedItems = stage.totalItems;
        break;
      }

      case 'opportunity_generation': {
        const insights = await IntelligenceRepo.getInsightsByWorkspace(workspaceId);
        const atoms = await FeedbackRepo.getAtomsByWorkspace(workspaceId);

        const opportunities = await ExplainableScoringEngine.synthesizeOpportunities({
          insights,
          atoms,
          context,
          customerSegments,
          workspaceId,
          jobId: job.id
        });
        await DecisionsRepo.saveOpportunities(opportunities);
        stage.processedItems = stage.totalItems;
        break;
      }
    }
  }

  /**
   * Retries a single failed stage without re-running completed stages.
   */
  public static async retryStage(
    jobId: string,
    stageName: ProcessingStageType,
    context?: ProductContext,
    customerSegments: CustomerSegment[] = []
  ): Promise<ProcessingJobStage> {
    const job = await ProcessingJobRepo.getJobById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    const stage = await ProcessingJobRepo.getStage(jobId, stageName);
    if (!stage) throw new Error(`Stage ${stageName} not found for job ${jobId}`);

    stage.status = 'processing';
    stage.attempt++;
    stage.error = undefined;
    stage.startedAt = new Date().toISOString();
    await ProcessingJobRepo.saveStage(stage);
    this.notifyProgress(job, stage);

    try {
      await this.runStage(job, stage, context, customerSegments);
      stage.status = 'completed';
      stage.completedAt = new Date().toISOString();
      await ProcessingJobRepo.saveStage(stage);
    } catch (e: unknown) {
      const err = e as Error;
      stage.status = 'failed';
      stage.error = err.message;
      await ProcessingJobRepo.saveStage(stage);
      throw err;
    }

    this.notifyProgress(job, stage);
    return stage;
  }
}
