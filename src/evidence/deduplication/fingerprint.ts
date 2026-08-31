export class FingerprintEngine {
  /**
   * Deterministic FNV-1a 32-bit hash.
   */
  public static hash(input: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return `fp-${(h >>> 0).toString(16)}`;
  }

  /**
   * Generates identity fingerprint for source-provided external ID.
   */
  public static generateIdentityFingerprint(workspaceId: string, sourceId: string, externalId: string): string {
    return FingerprintEngine.hash(`${workspaceId}:${sourceId}:${externalId}`);
  }

  /**
   * Generates content fingerprint for exact evidence matching per customer.
   * Note: Identical complaints from different customers produce different fingerprints to preserve frequency evidence.
   */
  public static generateContentFingerprint(
    workspaceId: string,
    text: string,
    customerKey = 'anonymous'
  ): string {
    const normalizedText = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
    return FingerprintEngine.hash(`${workspaceId}:${customerKey}:${normalizedText}`);
  }
}
