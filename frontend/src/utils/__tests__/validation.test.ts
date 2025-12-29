import { isValidAddress, isValidAmount, formatAddress, isValidChainId, sanitizeInput } from '../validation';

describe('validation utilities', () => {
  describe('isValidAddress', () => {
    it('validates correct Ethereum addresses', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(true);
      expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
    });

    it('rejects invalid addresses', () => {
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('validates positive numbers', () => {
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount('0.5')).toBe(true);
      expect(isValidAmount('1e18')).toBe(true);
    });

    it('rejects invalid amounts', () => {
      expect(isValidAmount('0')).toBe(false);
      expect(isValidAmount('-1')).toBe(false);
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('')).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
    });
  });

  describe('formatAddress', () => {
    it('formats addresses correctly', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      expect(formatAddress(address)).toBe('0x742d...0bEb');
      expect(formatAddress(address, 4, 4)).toBe('0x74...0bEb');
    });

    it('handles short addresses', () => {
      expect(formatAddress('0x123')).toBe('0x123');
      expect(formatAddress('')).toBe('');
    });
  });

  describe('isValidChainId', () => {
    it('validates chain IDs', () => {
      expect(isValidChainId(1)).toBe(true);
      expect(isValidChainId(84532)).toBe(true);
      expect(isValidChainId(8453)).toBe(true);
    });

    it('rejects invalid chain IDs', () => {
      expect(isValidChainId(0)).toBe(false);
      expect(isValidChainId(-1)).toBe(false);
      expect(isValidChainId(1.5)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('sanitizes HTML input', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(sanitizeInput('Hello World')).toBe('Hello World');
    });
  });
});

