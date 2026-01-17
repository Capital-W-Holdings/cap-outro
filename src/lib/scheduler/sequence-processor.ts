import { createServiceClient } from '@/lib/supabase/server';
import { sendEmail, interpolateTemplate, prepareTrackedEmail } from '@/lib/email/service';
import type { SequenceEnrollment, SequenceStep, Investor } from '@/types';

interface ProcessResult {
  processed: number;
  sent: number;
  errors: number;
  details: Array<{
    enrollmentId: string;
    status: 'sent' | 'skipped' | 'error';
    message: string;
  }>;
}

interface EnrollmentWithDetails extends SequenceEnrollment {
  investor: Investor;
  sequence: {
    id: string;
    name: string;
    campaign_id: string;
    org_id: string;
    status: string;
    steps: SequenceStep[];
  };
}

/**
 * Process all due sequence enrollments
 * This is called by the cron job to send outreach at scheduled times
 */
export async function processSequenceEnrollments(): Promise<ProcessResult> {
  const supabase = createServiceClient();
  const result: ProcessResult = {
    processed: 0,
    sent: 0,
    errors: 0,
    details: [],
  };

  try {
    // Find all active enrollments that are due to send
    const { data: enrollments, error: fetchError } = await supabase
      .from('sequence_enrollments')
      .select(`
        id,
        sequence_id,
        investor_id,
        campaign_id,
        org_id,
        status,
        current_step_order,
        next_send_at,
        enrolled_at,
        started_at,
        completed_at,
        investor:investors(id, name, email, firm, title),
        sequence:sequences(
          id,
          name,
          campaign_id,
          org_id,
          status,
          steps:sequence_steps(id, sequence_id, order, type, delay_days, template_id, content, subject)
        )
      `)
      .eq('status', 'active')
      .lte('next_send_at', new Date().toISOString())
      .order('next_send_at', { ascending: true })
      .limit(100);

    if (fetchError) {
      console.error('Error fetching enrollments:', fetchError);
      throw fetchError;
    }

    if (!enrollments || enrollments.length === 0) {
      return result;
    }

    // Process each enrollment
    for (const enrollment of enrollments as unknown as EnrollmentWithDetails[]) {
      result.processed++;

      try {
        const processResult = await processEnrollment(supabase, enrollment);
        result.details.push(processResult);

        if (processResult.status === 'sent') {
          result.sent++;
        } else if (processResult.status === 'error') {
          result.errors++;
        }
      } catch (err) {
        result.errors++;
        result.details.push({
          enrollmentId: enrollment.id,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return result;
  } catch (err) {
    console.error('Sequence processor error:', err);
    throw err;
  }
}

/**
 * Process a single enrollment - execute the current step and advance
 */
async function processEnrollment(
  supabase: ReturnType<typeof createServiceClient>,
  enrollment: EnrollmentWithDetails
): Promise<{ enrollmentId: string; status: 'sent' | 'skipped' | 'error'; message: string }> {
  const { investor, sequence } = enrollment;

  // Check if sequence is still active
  if (sequence.status !== 'active') {
    // Pause enrollment if sequence is not active
    await supabase
      .from('sequence_enrollments')
      .update({ status: 'paused' })
      .eq('id', enrollment.id);

    return {
      enrollmentId: enrollment.id,
      status: 'skipped',
      message: 'Sequence not active',
    };
  }

  // Check if investor has email
  if (!investor.email) {
    return {
      enrollmentId: enrollment.id,
      status: 'skipped',
      message: 'Investor has no email',
    };
  }

  // Sort steps by order
  const steps = sequence.steps.sort((a, b) => a.order - b.order);

  // Get the next step to execute
  const nextStepIndex = enrollment.current_step_order;
  const currentStep = steps[nextStepIndex];

  if (!currentStep) {
    // No more steps - mark as completed
    await supabase
      .from('sequence_enrollments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id);

    return {
      enrollmentId: enrollment.id,
      status: 'skipped',
      message: 'Sequence completed',
    };
  }

  // Process based on step type
  if (currentStep.type === 'email') {
    // Prepare email content
    const templateVars = {
      investor_name: investor.name,
      investor_first_name: investor.name.split(' ')[0],
      investor_firm: investor.firm || '',
      investor_title: investor.title || '',
    };

    const subject = currentStep.subject
      ? interpolateTemplate(currentStep.subject, templateVars)
      : 'Following up';

    const content = currentStep.content
      ? interpolateTemplate(currentStep.content, templateVars)
      : '';

    // Create outreach record first
    const { data: outreach, error: outreachError } = await supabase
      .from('outreach')
      .insert({
        campaign_id: sequence.campaign_id,
        investor_id: investor.id,
        sequence_id: sequence.id,
        step_id: currentStep.id,
        enrollment_id: enrollment.id,
        type: 'email',
        status: 'scheduled',
        scheduled_at: new Date().toISOString(),
        subject,
        content,
      })
      .select('id')
      .single();

    if (outreachError || !outreach) {
      throw new Error('Failed to create outreach record');
    }

    // Send the email with tracking
    const htmlContent = prepareTrackedEmail(
      `<html><body>${content.replace(/\n/g, '<br>')}</body></html>`,
      outreach.id,
      { trackOpens: true, trackClicks: true }
    );

    const defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'noreply@capoutro.com';

    const sendResult = await sendEmail({
      to: { email: investor.email, name: investor.name },
      subject,
      html: htmlContent,
      from: { email: defaultFrom },
    });

    if (sendResult.success) {
      // Update outreach status
      await supabase
        .from('outreach')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', outreach.id);
    } else {
      // Mark as failed
      await supabase
        .from('outreach')
        .update({
          status: 'bounced',
        })
        .eq('id', outreach.id);

      throw new Error(sendResult.error || 'Email send failed');
    }
  } else if (currentStep.type === 'linkedin' || currentStep.type === 'task') {
    // Create outreach record for manual action
    const { error: outreachError } = await supabase
      .from('outreach')
      .insert({
        campaign_id: sequence.campaign_id,
        investor_id: investor.id,
        sequence_id: sequence.id,
        step_id: currentStep.id,
        enrollment_id: enrollment.id,
        type: currentStep.type === 'linkedin' ? 'linkedin' : 'call',
        status: 'scheduled',
        scheduled_at: new Date().toISOString(),
        content: currentStep.content || '',
      });

    if (outreachError) {
      throw new Error('Failed to create outreach record');
    }
  }
  // 'wait' type steps don't create outreach records, just advance time

  // Calculate next send time
  const nextStep = steps[nextStepIndex + 1];
  let nextSendAt: Date | null = null;

  if (nextStep) {
    nextSendAt = new Date();
    nextSendAt.setDate(nextSendAt.getDate() + (nextStep.delay_days || 0));
  }

  // Advance the enrollment to the next step
  const updateData: Record<string, unknown> = {
    current_step_order: nextStepIndex + 1,
    next_send_at: nextSendAt?.toISOString() || null,
  };

  // Mark as started if this is the first step
  if (nextStepIndex === 0 && !enrollment.started_at) {
    updateData.started_at = new Date().toISOString();
  }

  // Mark as completed if no more steps
  if (!nextStep) {
    updateData.status = 'completed';
    updateData.completed_at = new Date().toISOString();
  }

  await supabase
    .from('sequence_enrollments')
    .update(updateData)
    .eq('id', enrollment.id);

  return {
    enrollmentId: enrollment.id,
    status: 'sent',
    message: `Processed step ${nextStepIndex + 1}: ${currentStep.type}`,
  };
}

/**
 * Get processing stats
 */
export async function getProcessingStats(): Promise<{
  pending: number;
  dueNow: number;
  processedToday: number;
}> {
  const supabase = createServiceClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Count pending enrollments
  const { count: pending } = await supabase
    .from('sequence_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  // Count due now
  const { count: dueNow } = await supabase
    .from('sequence_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .lte('next_send_at', now.toISOString());

  // Count outreach sent today
  const { count: processedToday } = await supabase
    .from('outreach')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', startOfDay.toISOString())
    .eq('status', 'sent');

  return {
    pending: pending || 0,
    dueNow: dueNow || 0,
    processedToday: processedToday || 0,
  };
}
