import { FeedbackAtom } from '@/types/trace';

export interface CandidateCluster {
  id: string;
  centroid: number[];
  atomIds: string[];
  atoms: FeedbackAtom[];
}

export class VectorClusterer {
  public static readonly COSINE_THRESHOLD = 0.82;
  public static readonly MIN_CLUSTER_SIZE = 3;

  /**
   * Computes cosine similarity between two normalized vectors.
   */
  public static cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }
    return dot;
  }

  /**
   * Calculates the mean centroid vector of an array of vectors.
   */
  public static computeCentroid(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];
    const dim = vectors[0].length;
    const centroid = new Array(dim).fill(0);

    vectors.forEach(v => {
      for (let i = 0; i < dim; i++) {
        centroid[i] += v[i];
      }
    });

    const len = vectors.length;
    const mean = centroid.map(val => val / len);

    // Normalize
    const norm = Math.sqrt(mean.reduce((acc, v) => acc + v * v, 0)) || 1.0;
    return mean.map(v => v / norm);
  }

  /**
   * Deterministically clusters atoms using cosine similarity threshold.
   */
  public static clusterAtoms(atoms: FeedbackAtom[]): CandidateCluster[] {
    const verifiedAtoms = atoms.filter(a => a.verificationStatus === 'verified' && a.embedding && a.embedding.length > 0);
    const clusters: CandidateCluster[] = [];

    verifiedAtoms.forEach(atom => {
      const vec = atom.embedding!;
      let bestCluster: CandidateCluster | null = null;
      let maxSim = -1;

      for (const cluster of clusters) {
        const sim = VectorClusterer.cosineSimilarity(cluster.centroid, vec);
        if (sim > maxSim && sim >= VectorClusterer.COSINE_THRESHOLD) {
          maxSim = sim;
          bestCluster = cluster;
        }
      }

      if (bestCluster) {
        bestCluster.atoms.push(atom);
        bestCluster.atomIds.push(atom.id);
        bestCluster.centroid = VectorClusterer.computeCentroid(bestCluster.atoms.map(a => a.embedding!));
      } else {
        clusters.push({
          id: `cluster-${Date.now()}-${clusters.length}`,
          centroid: [...vec],
          atomIds: [atom.id],
          atoms: [atom]
        });
      }
    });

    // If small dataset where threshold is strict, ensure top topic grouping
    if (clusters.length === 0 && verifiedAtoms.length > 0) {
      clusters.push({
        id: `cluster-${Date.now()}-0`,
        centroid: VectorClusterer.computeCentroid(verifiedAtoms.map(a => a.embedding!)),
        atomIds: verifiedAtoms.map(a => a.id),
        atoms: verifiedAtoms
      });
    }

    return clusters;
  }
}
