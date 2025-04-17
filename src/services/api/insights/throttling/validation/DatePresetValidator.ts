
/**
 * Validates date presets for insights requests
 */
export class DatePresetValidator {
  static isProblematicDatePreset(value?: string): boolean {
    if (!value) return false;
    
    return value === 'last_28d' || 
           value.includes('28d') || 
           value.includes('28day') ||
           value === 'last28d';
  }

  static hasProblematicDatePreset(datePreset?: string): boolean {
    return this.isProblematicDatePreset(datePreset);
  }
}
