import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (classnames utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toContain('base-class');
      expect(result).toContain('additional-class');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).toContain('active');
    });

    it('should filter out falsy values', () => {
      const result = cn('base', false && 'hidden', undefined, null, 'visible');
      expect(result).toContain('base');
      expect(result).toContain('visible');
      expect(result).not.toContain('hidden');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
});
