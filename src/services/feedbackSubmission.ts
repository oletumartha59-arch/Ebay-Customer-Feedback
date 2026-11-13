import {
  AppsScriptResponse,
  FeedbackFormValues,
  SubmissionPayload,
  ValidationErrors,
} from '../types/feedback';

export function resolveQ8Value(values: FeedbackFormValues): string {
  const selected = values.q8Selected.filter((item) => item !== 'Other');
  const other = values.q8Other.trim();
  if (values.q8Selected.includes('Other') && other) {
    selected.push(`Other: ${other}`);
  } else if (values.q8Selected.includes('Other')) {
    selected.push('Other');
  }
  return selected.join(', ');
}

export function resolveQ10Value(values: FeedbackFormValues): string {
  if (values.q10Selection === 'Other') {
    const custom = values.q10Other.trim();
    return custom ? `Other: ${custom}` : '';
  }
  return values.q10Selection.trim();
}

export function validateFeedbackForm(values: FeedbackFormValues): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!/^[1-5]$/.test(values.q1)) {
    errors.q1 = 'Please select an overall satisfaction rating from 1 to 5.';
  }

  if (!values.q2.trim()) {
    errors.q2 = 'Please share the primary reason for your satisfaction rating.';
  }

  if (!/^(10|[0-9])$/.test(values.q3)) {
    errors.q3 = 'Please select a recommendation score from 0 to 10.';
  }

  if (!values.q4.trim()) {
    errors.q4 = 'Please explain the main reason for your recommendation score.';
  }

  if (!['Yes', 'Partly', 'No'].includes(values.q5)) {
    errors.q5 = 'Please indicate whether the item condition and delivery matched the listing.';
  }

  if (!/^[1-5]$/.test(values.q7)) {
    errors.q7 = 'Please rate pricing, fees, and overall value from 1 to 5.';
  }

  const resolvedQ10 = resolveQ10Value(values);
  if (!resolvedQ10) {
    errors.q10 =
      values.q10Selection === 'Other'
        ? 'Please specify the area eBay should prioritize improving.'
        : 'Please choose the area eBay should prioritize improving most.';
  }

  if (!values.q11.trim()) {
    errors.q11 = 'Please describe the single most important improvement eBay should make.';
  }

  const email = values.q12.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.q12 = 'Please enter a valid email address or leave this field blank.';
  }

  return errors;
}

export function countRequiredCompleted(values: FeedbackFormValues): number {
  let count = 0;
  if (/^[1-5]$/.test(values.q1)) count += 1;
  if (values.q2.trim()) count += 1;
  if (/^(10|[0-9])$/.test(values.q3)) count += 1;
  if (values.q4.trim()) count += 1;
  if (['Yes', 'Partly', 'No'].includes(values.q5)) count += 1;
  if (/^[1-5]$/.test(values.q7)) count += 1;
  if (resolveQ10Value(values)) count += 1;
  if (values.q11.trim()) count += 1;
  return count;
}

export function buildSubmissionPayload(
  values: FeedbackFormValues,
  requestToken: string
): SubmissionPayload {
  return {
    requestToken,
    q1: values.q1.trim(),
    q2: values.q2.trim(),
    q3: values.q3.trim(),
    q4: values.q4.trim(),
    q5: values.q5,
    q6: values.q6.trim(),
    q7: values.q7.trim(),
    q8: resolveQ8Value(values),
    q9: values.q9.trim(),
    q10: resolveQ10Value(values),
    q11: values.q11.trim(),
    q12: values.q12.trim(),
  };
}

function generateRequestToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Submits the feedback payload through the backend /api/submit-feedback route,
 * avoiding browser X-Frame-Options / CORS restrictions on Google Apps Script redirects.
 */
export async function submitFeedbackToAppsScript(
  values: FeedbackFormValues,
  timeoutMs = 20000
): Promise<{ response: AppsScriptResponse; payload: SubmissionPayload }> {
  const requestToken = generateRequestToken();
  const payload = buildSubmissionPayload(values, requestToken);

  const controller = new AbortController();
  const timerId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('/api/submit-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => null)) as Partial<AppsScriptResponse> | null;

    if (!res.ok || !data?.success) {
      throw new Error(
        data?.message || 'Unable to save feedback. Please check your configuration and try again.'
      );
    }

    return {
      response: {
        success: true,
        message: data.message || 'Feedback successfully saved.',
        requestToken: data.requestToken || requestToken,
      },
      payload,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'The feedback service timed out before confirming your submission. Please try again.'
      );
    }
    throw err;
  } finally {
    window.clearTimeout(timerId);
  }
}
