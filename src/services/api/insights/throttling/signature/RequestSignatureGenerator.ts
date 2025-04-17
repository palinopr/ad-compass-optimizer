
/**
 * Generates unique signatures for API requests
 */
import { DuplicateStorage } from '../storage/DuplicateStorage';

export class RequestSignatureGenerator {
  static generate(
    objectId: string, 
    endpoint: string, 
    options: Record<string, any> = {}
  ): string {
    console.log(`[INSIGHTS] Generating request signature for ${endpoint}:${objectId}`, options);
    
    // Handle problematic date presets
    if (this.hasProblematicDatePreset(options.datePreset)) {
      console.log(`[INSIGHTS] Replacing problematic date preset "${options.datePreset}" with maximum in signature generation`);
      options = { ...options, datePreset: 'maximum' };
      DuplicateStorage.storeDatePresetReplacement(objectId, endpoint, options.datePreset);
    }
  
    const optionsStr = JSON.stringify(options, (key, value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).sort().reduce((sorted, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {} as Record<string, any>);
      }
      return value;
    });
    
    const signature = `${endpoint}:${objectId}:${optionsStr}`;
    console.log(`[INSIGHTS] Generated request signature: ${signature}`);
    return signature;
  }

  private static hasProblematicDatePreset(datePreset?: string): boolean {
    return Boolean(
      datePreset === 'last_28d' || 
      (typeof datePreset === 'string' && 
       (datePreset.includes('28d') || datePreset.includes('28day')))
    );
  }
}
