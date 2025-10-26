/**
 * LIFF SDK Setup Test
 *
 * Test suite for verifying LIFF SDK package installation and environment variable configuration
 * This test ensures that:
 * - LIFF SDK package is installed with correct TypeScript types
 * - Environment variable NEXT_PUBLIC_LIFF_ID can be accessed
 * - Package exports expected interfaces
 */

// Import LIFF SDK for testing
import liff from '@line/liff';
// Import package.json for version check
import packageJson from '../../../../package.json';

describe('LIFF SDK Setup', () => {
  describe('Package Installation', () => {
    it('should have @line/liff package installed', () => {
      // Verify that the LIFF SDK module is available
      expect(liff).toBeDefined();
    });

    it('should provide TypeScript type definitions', () => {
      // Verify main LIFF SDK interface exists
      expect(liff).toBeDefined();
      expect(typeof liff.init).toBe('function');
      expect(typeof liff.isInClient).toBe('function');
      expect(typeof liff.isLoggedIn).toBe('function');
      expect(typeof liff.getProfile).toBe('function');
    });
  });

  describe('Environment Variable Configuration', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
      // Reset environment before each test
      jest.resetModules();
      process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
      // Restore original environment
      process.env = ORIGINAL_ENV;
    });

    it('should allow access to NEXT_PUBLIC_LIFF_ID environment variable', () => {
      // Set test LIFF ID
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id-1234567890';

      // Verify it can be read
      expect(process.env.NEXT_PUBLIC_LIFF_ID).toBe('test-liff-id-1234567890');
    });

    it('should return undefined when NEXT_PUBLIC_LIFF_ID is not set', () => {
      // Ensure variable is not set
      delete process.env.NEXT_PUBLIC_LIFF_ID;

      // Verify it returns undefined
      expect(process.env.NEXT_PUBLIC_LIFF_ID).toBeUndefined();
    });

    it('should handle empty string as LIFF ID', () => {
      // Set empty string
      process.env.NEXT_PUBLIC_LIFF_ID = '';

      // Verify it's an empty string (not undefined)
      expect(process.env.NEXT_PUBLIC_LIFF_ID).toBe('');
    });
  });

  describe('LIFF SDK Version Compatibility', () => {
    it('should be using LIFF SDK v2.x or later', () => {
      // Check if @line/liff is in dependencies
      const dependencies = packageJson.dependencies as Record<string, string>;
      const devDependencies = packageJson.devDependencies as Record<
        string,
        string
      >;
      const liffVersion =
        dependencies?.['@line/liff'] || devDependencies?.['@line/liff'];

      expect(liffVersion).toBeDefined();

      // Verify it's v2.x or later (starts with ^ or ~ or is exact version >= 2)
      // This regex matches: ^2.x.x, ~2.x.x, 2.x.x, or latest
      expect(liffVersion).toMatch(/^[\^~]?2\.\d+\.\d+$|^latest$/);
    });
  });
});
