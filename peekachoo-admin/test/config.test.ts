import { config } from '@/lib/config';

describe('Config', () => {
  describe('config object', () => {
    it('should have adminPassword property', () => {
      expect(config).toHaveProperty('adminPassword');
      expect(typeof config.adminPassword).toBe('string');
    });

    it('should have backendUrl property', () => {
      expect(config).toHaveProperty('backendUrl');
      expect(typeof config.backendUrl).toBe('string');
    });

    it('should have adminApiKey property', () => {
      expect(config).toHaveProperty('adminApiKey');
      expect(typeof config.adminApiKey).toBe('string');
    });

    it('should have default values when env vars are not set', () => {
      // Default values should be set
      expect(config.adminPassword).toBeDefined();
      expect(config.backendUrl).toBeDefined();
      expect(config.adminApiKey).toBeDefined();
    });

    it('should have valid URL format for backendUrl', () => {
      expect(config.backendUrl).toMatch(/^https?:\/\//);
    });
  });
});
