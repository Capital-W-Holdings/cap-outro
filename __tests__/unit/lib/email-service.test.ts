import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  interpolateTemplate,
  extractTemplateVariables,
  addTrackingPixel,
  wrapLinksForTracking,
  prepareTrackedEmail,
} from '@/lib/email/service';

describe('Email Service', () => {
  describe('interpolateTemplate', () => {
    it('replaces single variable', () => {
      const result = interpolateTemplate(
        'Hello {{name}}!',
        { name: 'John' }
      );
      expect(result).toBe('Hello John!');
    });

    it('replaces multiple variables', () => {
      const result = interpolateTemplate(
        'Hi {{first_name}}, welcome to {{company}}!',
        { first_name: 'Jane', company: 'Acme' }
      );
      expect(result).toBe('Hi Jane, welcome to Acme!');
    });

    it('handles variables with spaces around them', () => {
      const result = interpolateTemplate(
        'Hello {{ name }}!',
        { name: 'John' }
      );
      expect(result).toBe('Hello John!');
    });

    it('removes unmatched variables', () => {
      const result = interpolateTemplate(
        'Hello {{name}}, your code is {{code}}',
        { name: 'John' }
      );
      expect(result).toBe('Hello John, your code is ');
    });

    it('handles undefined values', () => {
      const result = interpolateTemplate(
        'Hello {{name}}!',
        { name: undefined }
      );
      expect(result).toBe('Hello !');
    });
  });

  describe('extractTemplateVariables', () => {
    it('extracts single variable', () => {
      const result = extractTemplateVariables('Hello {{name}}!');
      expect(result).toEqual(['name']);
    });

    it('extracts multiple unique variables', () => {
      const result = extractTemplateVariables(
        'Hi {{first_name}}, your company {{company}} is great!'
      );
      expect(result).toContain('first_name');
      expect(result).toContain('company');
      expect(result.length).toBe(2);
    });

    it('does not duplicate variables', () => {
      const result = extractTemplateVariables(
        '{{name}} says hello to {{name}}'
      );
      expect(result).toEqual(['name']);
    });

    it('handles variables with spaces', () => {
      const result = extractTemplateVariables('Hello {{ name }}!');
      expect(result).toEqual(['name']);
    });

    it('returns empty array for no variables', () => {
      const result = extractTemplateVariables('Hello World!');
      expect(result).toEqual([]);
    });
  });

  describe('addTrackingPixel', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.test.com');
    });

    it('adds pixel before closing body tag', () => {
      const html = '<html><body><p>Hello</p></body></html>';
      const result = addTrackingPixel(html, 'track-123');
      
      expect(result).toContain('<img src="https://app.test.com/api/tracking/open?id=track-123"');
      expect(result).toContain('</body>');
      expect(result.indexOf('<img')).toBeLessThan(result.indexOf('</body>'));
    });

    it('appends pixel if no body tag', () => {
      const html = '<p>Hello</p>';
      const result = addTrackingPixel(html, 'track-456');
      
      expect(result).toContain('<p>Hello</p>');
      expect(result).toContain('<img src=');
    });
  });

  describe('wrapLinksForTracking', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.test.com');
    });

    it('wraps http links', () => {
      const html = '<a href="http://example.com">Click</a>';
      const result = wrapLinksForTracking(html, 'track-789');
      
      expect(result).toContain('api/tracking/click?id=track-789');
      expect(result).toContain(encodeURIComponent('http://example.com'));
    });

    it('wraps https links', () => {
      const html = '<a href="https://secure.example.com">Click</a>';
      const result = wrapLinksForTracking(html, 'track-abc');
      
      expect(result).toContain('api/tracking/click?id=track-abc');
      expect(result).toContain(encodeURIComponent('https://secure.example.com'));
    });

    it('wraps multiple links', () => {
      const html = '<a href="https://one.com">One</a><a href="https://two.com">Two</a>';
      const result = wrapLinksForTracking(html, 'track-multi');
      
      expect(result).toContain(encodeURIComponent('https://one.com'));
      expect(result).toContain(encodeURIComponent('https://two.com'));
    });
  });

  describe('prepareTrackedEmail', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.test.com');
    });

    it('adds both tracking pixel and link wrapping by default', () => {
      const html = '<body><a href="https://example.com">Link</a></body>';
      const result = prepareTrackedEmail(html, 'full-track');
      
      expect(result).toContain('api/tracking/open');
      expect(result).toContain('api/tracking/click');
    });

    it('skips opens tracking when disabled', () => {
      const html = '<body><a href="https://example.com">Link</a></body>';
      const result = prepareTrackedEmail(html, 'no-opens', { trackOpens: false });
      
      expect(result).not.toContain('api/tracking/open');
      expect(result).toContain('api/tracking/click');
    });

    it('skips clicks tracking when disabled', () => {
      const html = '<body><a href="https://example.com">Link</a></body>';
      const result = prepareTrackedEmail(html, 'no-clicks', { trackClicks: false });
      
      expect(result).toContain('api/tracking/open');
      expect(result).not.toContain('api/tracking/click');
    });
  });
});
