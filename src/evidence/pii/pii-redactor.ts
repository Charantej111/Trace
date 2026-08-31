export class PiiRedactor {
  private static EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  private static PHONE_REGEX = /\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

  /**
   * Sanitizes text for AI inference while strictly preserving immutable evidence in originalText.
   */
  public static redact(text: string): { originalText: string; analysisText: string; hasRedactions: boolean } {
    if (!text) return { originalText: '', analysisText: '', hasRedactions: false };

    let analysisText = text;
    let hasRedactions = false;

    if (PiiRedactor.EMAIL_REGEX.test(analysisText)) {
      analysisText = analysisText.replace(PiiRedactor.EMAIL_REGEX, '[REDACTED_EMAIL]');
      hasRedactions = true;
    }

    if (PiiRedactor.PHONE_REGEX.test(analysisText)) {
      analysisText = analysisText.replace(PiiRedactor.PHONE_REGEX, '[REDACTED_PHONE]');
      hasRedactions = true;
    }

    return {
      originalText: text,
      analysisText,
      hasRedactions
    };
  }
}
