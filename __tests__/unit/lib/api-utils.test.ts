import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '@/lib/api/utils';

describe('API Error Classes', () => {
  describe('AppError', () => {
    it('creates error with code and message', () => {
      const error = new AppError('VALIDATION_ERROR', 'Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('AppError');
    });

    it('includes details when provided', () => {
      const details = { email: ['Invalid email format'] };
      const error = new AppError('VALIDATION_ERROR', 'Invalid input', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('creates error with VALIDATION_ERROR code', () => {
      const error = new ValidationError('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('includes field-level details', () => {
      const details = {
        name: ['Name is required'],
        email: ['Invalid email'],
      };
      const error = new ValidationError('Validation failed', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('creates error with resource name in message', () => {
      const error = new NotFoundError('Campaign');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Campaign not found');
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('UnauthorizedError', () => {
    it('creates error with default message', () => {
      const error = new UnauthorizedError();
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Unauthorized');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('allows custom message', () => {
      const error = new UnauthorizedError('Session expired');
      expect(error.message).toBe('Session expired');
    });
  });

  describe('ForbiddenError', () => {
    it('creates error with default message', () => {
      const error = new ForbiddenError();
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Forbidden');
      expect(error.name).toBe('ForbiddenError');
    });
  });
});
