import { z } from 'zod';
import { ValidationError } from './utils';

// Campaign schemas
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  raise_amount: z.number().positive().optional(),
  raise_type: z.enum(['seed', 'series_a', 'series_b', 'bridge', 'note']).optional(),
  sector: z.array(z.string()).optional(),
  deck_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  raise_amount: z.number().positive().optional(),
  raise_type: z.enum(['seed', 'series_a', 'series_b', 'bridge', 'note']).optional(),
  sector: z.array(z.string()).optional(),
  deck_url: z.string().url().optional().or(z.literal('')),
});

// Investor schemas
export const createInvestorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  firm: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  check_size_min: z.number().positive().optional(),
  check_size_max: z.number().positive().optional(),
  stages: z.array(z.string()).optional(),
  sectors: z.array(z.string()).optional(),
});

export const bulkImportSchema = z.object({
  investors: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email().optional().or(z.literal('')),
      firm: z.string().optional(),
      title: z.string().optional(),
      linkedin_url: z.string().url().optional().or(z.literal('')),
    })
  ).min(1, 'At least one investor required').max(1000, 'Maximum 1000 investors per import'),
});

// Pipeline schemas
export const updatePipelineSchema = z.object({
  stage: z.enum([
    'not_contacted',
    'contacted',
    'responded',
    'meeting_scheduled',
    'meeting_held',
    'dd',
    'term_sheet',
    'committed',
    'passed',
  ]).optional(),
  amount_soft: z.number().positive().optional(),
  amount_committed: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
});

// Email template schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  type: z.enum(['initial', 'followup', 'intro_request', 'update']).optional(),
});

// Generic validator factory
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const details: Record<string, string[]> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'root';
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(issue.message);
      });
      throw new ValidationError('Validation failed', details);
    }
    return result.data;
  };
}

// Export validators
export const validateCreateCampaign = createValidator(createCampaignSchema);
export const validateUpdateCampaign = createValidator(updateCampaignSchema);
export const validateCreateInvestor = createValidator(createInvestorSchema);
export const validateBulkImport = createValidator(bulkImportSchema);
export const validateUpdatePipeline = createValidator(updatePipelineSchema);
export const validateCreateTemplate = createValidator(createTemplateSchema);

// Sequence schemas
export const createSequenceSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const updateSequenceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['draft', 'active', 'paused']).optional(),
});

export const createSequenceStepSchema = z.object({
  order: z.number().int().positive(),
  type: z.enum(['email', 'linkedin', 'task', 'wait']),
  delay_days: z.number().int().min(0).default(0),
  template_id: z.string().uuid().optional().nullable(),
  content: z.string().max(10000).optional().nullable(),
  subject: z.string().max(200).optional().nullable(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  type: z.enum(['initial', 'followup', 'intro_request', 'update']).optional(),
});

// Referral schemas
export const createReferralSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  name: z.string().max(100).optional(),
});

export const updateReferralSchema = z.object({
  status: z.enum(['pending', 'signed_up', 'converted', 'expired']).optional(),
  reward_granted: z.boolean().optional(),
});

// Export validators
export const validateCreateSequence = createValidator(createSequenceSchema);
export const validateUpdateSequence = createValidator(updateSequenceSchema);
export const validateCreateSequenceStep = createValidator(createSequenceStepSchema);
export const validateUpdateTemplate = createValidator(updateTemplateSchema);
export const validateCreateReferral = createValidator(createReferralSchema);
export const validateUpdateReferral = createValidator(updateReferralSchema);

// Type exports
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateInvestorInput = z.infer<typeof createInvestorSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateSequenceInput = z.infer<typeof createSequenceSchema>;
export type UpdateSequenceInput = z.infer<typeof updateSequenceSchema>;
export type CreateSequenceStepInput = z.infer<typeof createSequenceStepSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralInput = z.infer<typeof updateReferralSchema>;
