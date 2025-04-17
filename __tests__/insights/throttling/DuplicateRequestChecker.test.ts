
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';

describe('DuplicateRequestChecker', () => {
  beforeEach(() => {
    DuplicateRequestChecker.reset();
    localStorage.clear();
  });

  describe('isDuplicate', () => {
    it('should identify duplicate campaign requests', () => {
      const campaignId = 'test-campaign';
      const datePreset = 'last_30d';

      expect(DuplicateRequestChecker.isDuplicate(campaignId, datePreset)).toBe(false);
      expect(DuplicateRequestChecker.isDuplicate(campaignId, datePreset)).toBe(true);
    });

    it('should block last_28d requests automatically', () => {
      const campaignId = 'test-campaign';
      expect(DuplicateRequestChecker.isDuplicate(campaignId, 'last_28d')).toBe(true);
      expect(DuplicateRequestChecker.isDuplicate(campaignId, '28d')).toBe(true);
      expect(DuplicateRequestChecker.isDuplicate(campaignId, 'last28d')).toBe(true);
    });

    it('should handle different date presets independently', () => {
      const campaignId = 'test-campaign';
      
      expect(DuplicateRequestChecker.isDuplicate(campaignId, 'last_7d')).toBe(false);
      expect(DuplicateRequestChecker.isDuplicate(campaignId, 'last_30d')).toBe(false);
      expect(DuplicateRequestChecker.isDuplicate(campaignId, 'last_7d')).toBe(true);
    });
  });

  describe('isPermanentlyFailed', () => {
    it('should identify permanently failed requests', () => {
      const signature = 'test-signature';
      
      expect(DuplicateRequestChecker.isPermanentlyFailed(signature)).toBe(false);
      DuplicateRequestChecker.markAsPermanentlyFailed(signature);
      expect(DuplicateRequestChecker.isPermanentlyFailed(signature)).toBe(true);
    });

    it('should auto-block requests containing 28d patterns', () => {
      const signatures = [
        'campaign_123_date_preset=last_28d',
        'campaign_123_28d_insights',
        'campaign_123_28day_data'
      ];

      signatures.forEach(signature => {
        expect(DuplicateRequestChecker.isPermanentlyFailed(signature)).toBe(true);
      });
    });
  });

  describe('generateRequestSignature', () => {
    it('should generate consistent signatures for identical requests', () => {
      const objectId = 'campaign-123';
      const endpoint = 'insights';
      const options = { datePreset: 'last_30d' };

      const sig1 = DuplicateRequestChecker.generateRequestSignature(objectId, endpoint, options);
      const sig2 = DuplicateRequestChecker.generateRequestSignature(objectId, endpoint, options);

      expect(sig1).toBe(sig2);
    });

    it('should handle different date presets correctly', () => {
      const objectId = 'campaign-123';
      const endpoint = 'insights';
      
      const sig1 = DuplicateRequestChecker.generateRequestSignature(objectId, endpoint, { datePreset: 'last_28d' });
      const sig2 = DuplicateRequestChecker.generateRequestSignature(objectId, endpoint, { datePreset: 'maximum' });

      expect(sig1).not.toBe(sig2);
    });
  });
});
