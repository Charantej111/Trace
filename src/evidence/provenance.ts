import { CanonicalFeedback, FeedbackAtom } from '@/types/trace';

export class ProvenanceVerifier {
  /**
   * Asserts that an atom is completely reconstructable from original customer evidence.
   */
  public static verifyAtomProvenance(atom: FeedbackAtom, feedback: CanonicalFeedback | { originalText: string }): boolean {
    if (!feedback || !feedback.originalText) return false;
    const extracted = feedback.originalText.slice(atom.sourceStart, atom.sourceEnd);
    return extracted === atom.atomText;
  }

  /**
   * Asserts that an evidence quote exactly exists within the source feedback text.
   */
  public static verifyQuoteProvenance(quoteText: string, feedbackOriginalText: string): boolean {
    if (!quoteText || !feedbackOriginalText) return false;
    return feedbackOriginalText.includes(quoteText);
  }
}
