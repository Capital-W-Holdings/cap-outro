import { describe, it, expect } from 'vitest';
import {
  validateCreateCampaign,
  validateUpdateCampaign,
  validateCreateInvestor,
  validateBulkImport,
  validateUpdatePipeline,
} from '@/lib/api/validators';
import { ValidationError } from '@/lib/api/utils';

describe('Validators', () => {
  describe('validateCreateCampaign', () => {
    it('validates valid campaign data', () => {
      const data = {
        name: 'Series A Raise',
        raise_amount: 5000000,
        raise_type: 'series_a',
        sector: ['fintech'],
      };
      const result = validateCreateCampaign(data);
      expect(result.name).toBe('Series A Raise');
    });

    it('throws on missing name', () => {
      expect(() => validateCreateCampaign({})).toThrow(ValidationError);
    });

    it('throws on empty name', () => {
      expect(() => validateCreateCampaign({ name: '' })).toThrow(ValidationError);
    });

    it('validates optional deck_url', () => {
      const data = {
        name: 'Test',
        deck_url: 'https://example.com/deck.pdf',
      };
      const result = validateCreateCampaign(data);
      expect(result.deck_url).toBe('https://example.com/deck.pdf');
    });

    it('allows empty deck_url', () => {
      const data = { name: 'Test', deck_url: '' };
      const result = validateCreateCampaign(data);
      expect(result.deck_url).toBe('');
    });
  });

  describe('validateUpdateCampaign', () => {
    it('validates partial update', () => {
      const data = { status: 'active' };
      const result = validateUpdateCampaign(data);
      expect(result.status).toBe('active');
    });

    it('validates empty object', () => {
      const result = validateUpdateCampaign({});
      expect(result).toEqual({});
    });

    it('throws on invalid status', () => {
      expect(() => validateUpdateCampaign({ status: 'invalid' })).toThrow(ValidationError);
    });
  });

  describe('validateCreateInvestor', () => {
    it('validates valid investor data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        firm: 'Acme VC',
      };
      const result = validateCreateInvestor(data);
      expect(result.name).toBe('John Doe');
    });

    it('throws on missing name', () => {
      expect(() => validateCreateInvestor({ email: 'test@test.com' })).toThrow(ValidationError);
    });

    it('throws on invalid email', () => {
      expect(() => validateCreateInvestor({ name: 'Test', email: 'invalid' })).toThrow(ValidationError);
    });

    it('allows empty email', () => {
      const result = validateCreateInvestor({ name: 'Test', email: '' });
      expect(result.email).toBe('');
    });
  });

  describe('validateBulkImport', () => {
    it('validates array of investors', () => {
      const data = {
        investors: [
          { name: 'John Doe', email: 'john@test.com' },
          { name: 'Jane Doe' },
        ],
      };
      const result = validateBulkImport(data);
      expect(result.investors).toHaveLength(2);
    });

    it('throws on empty array', () => {
      expect(() => validateBulkImport({ investors: [] })).toThrow(ValidationError);
    });

    it('throws when missing name in investor', () => {
      expect(() =>
        validateBulkImport({ investors: [{ email: 'test@test.com' }] })
      ).toThrow(ValidationError);
    });
  });

  describe('validateUpdatePipeline', () => {
    it('validates stage update', () => {
      const data = { stage: 'contacted' };
      const result = validateUpdatePipeline(data);
      expect(result.stage).toBe('contacted');
    });

    it('validates amount updates', () => {
      const data = { amount_soft: 500000, amount_committed: 250000 };
      const result = validateUpdatePipeline(data);
      expect(result.amount_soft).toBe(500000);
    });

    it('throws on invalid stage', () => {
      expect(() => validateUpdatePipeline({ stage: 'invalid_stage' })).toThrow(ValidationError);
    });

    it('throws on negative amount', () => {
      expect(() => validateUpdatePipeline({ amount_soft: -100 })).toThrow(ValidationError);
    });
  });
});
