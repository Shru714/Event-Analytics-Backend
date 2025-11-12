const { generateApiKey, hashApiKey, getApiKeyPrefix } = require('../src/utils/crypto');
const { parseUserAgent } = require('../src/utils/userAgent');

describe('Crypto Utils', () => {
  describe('generateApiKey', () => {
    it('should generate API key with correct prefix', () => {
      const key = generateApiKey();
      expect(key).toMatch(/^ak_[a-f0-9]{64}$/);
    });

    it('should generate unique keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('hashApiKey', () => {
    it('should hash API key consistently', () => {
      const key = 'ak_test123';
      const hash1 = hashApiKey(key);
      const hash2 = hashApiKey(key);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = hashApiKey('ak_key1');
      const hash2 = hashApiKey('ak_key2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getApiKeyPrefix', () => {
    it('should return first 12 characters', () => {
      const key = 'ak_1234567890abcdef';
      const prefix = getApiKeyPrefix(key);
      expect(prefix).toBe('ak_123456789');
      expect(prefix.length).toBe(12);
    });
  });
});

describe('User Agent Parser', () => {
  it('should parse Chrome user agent', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const result = parseUserAgent(ua);
    expect(result.browser).toContain('Chrome');
    expect(result.os).toContain('Windows');
  });

  it('should parse Safari user agent', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
    const result = parseUserAgent(ua);
    expect(result.browser).toContain('Safari');
    expect(result.os).toContain('Mac OS X');
  });

  it('should handle missing user agent', () => {
    const result = parseUserAgent(null);
    expect(result.browser).toBe('Unknown');
    expect(result.os).toBe('Unknown');
    expect(result.device).toBe('Unknown');
  });
});
