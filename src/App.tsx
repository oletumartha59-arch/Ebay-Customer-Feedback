import React, { useEffect, useState } from 'react';
import { EbayHeader } from './components/EbayHeader';
import { FeedbackSurveyForm } from './components/FeedbackSurveyForm';
import { SubmissionSuccessView } from './components/SubmissionSuccessView';
import {
  submitFeedbackToAppsScript,
  validateFeedbackForm,
} from './services/feedbackSubmission';
import {
  FeedbackFormValues,
  INITIAL_FORM_VALUES,
  SubmissionPayload,
  ValidationErrors,
} from './types/feedback';

const DRAFT_STORAGE_KEY = 'ebay_customer_feedback_draft_v1';

const ERROR_ANCHOR_MAP: Record<string, string> = {
  q1: 'q1-scale',
  q2: 'q2-input',
  q3: 'q3-scale',
  q4: 'q4-input',
  q5: 'q5-choice',
  q7: 'q7-scale',
  q10: 'q10-group',
  q11: 'q11-input',
  q12: 'q12-input',
};

function loadInitialDraft(): FeedbackFormValues {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return INITIAL_FORM_VALUES;
    const parsed = JSON.parse(raw) as Partial<FeedbackFormValues>;
    return {
      ...INITIAL_FORM_VALUES,
      ...parsed,
      q8Selected: Array.isArray(parsed.q8Selected) ? parsed.q8Selected : [],
    };
  } catch {
    return INITIAL_FORM_VALUES;
  }
}

export default function App() {
  const [values, setValues] = useState<FeedbackFormValues>(() => loadInitialDraft());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    payload: SubmissionPayload;
    message: string;
    submittedAt: string;
  } | null>(null);

  useEffect(() => {
    if (submittedData) return;
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
    } catch {
      // Ignore storage quota errors
    }
  }, [values, submittedData]);

  const handleFieldChange = <K extends keyof FeedbackFormValues>(
    field: K,
    value: FeedbackFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);

    if (field === 'q10Selection' || field === 'q10Other') {
      if (errors.q10) {
        setErrors((prev) => ({ ...prev, q10: undefined }));
      }
    } else if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTogglePlatform = (platform: string) => {
    setValues((prev) => {
      const exists = prev.q8Selected.includes(platform);
      const nextSelected = exists
        ? prev.q8Selected.filter((item) => item !== platform)
        : [...prev.q8Selected, platform];

      return {
        ...prev,
        q8Selected: nextSelected,
      };
    });
  };

  const handleJumpToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReset = () => {
    setValues(INITIAL_FORM_VALUES);
    setErrors({});
    setSubmitError(null);
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNew = () => {
    setSubmittedData(null);
    setValues(INITIAL_FORM_VALUES);
    setErrors({});
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateFeedbackForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('Please complete all compulsory questions highlighted below.');

      const firstErrorKey = Object.keys(ERROR_ANCHOR_MAP).find(
        (key) => validationErrors[key as keyof ValidationErrors]
      );
      if (firstErrorKey) {
        const anchor = document.getElementById(ERROR_ANCHOR_MAP[firstErrorKey]);
        if (anchor) {
          anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { response, payload } = await submitFeedbackToAppsScript(values);
      try {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
      setSubmittedData({
        payload,
        message: response.message,
        submittedAt: new Date().toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to submit feedback right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="top" className="flex min-h-screen flex-col bg-white text-[#191919]">
      <EbayHeader
        isSubmitted={Boolean(submittedData)}
        onJumpToSection={handleJumpToSection}
        onStartNew={handleStartNew}
      />

      <main className="flex-1">
        {submittedData ? (
          <SubmissionSuccessView
            payload={submittedData.payload}
            serverMessage={submittedData.message}
            submittedAt={submittedData.submittedAt}
            onStartNew={handleStartNew}
          />
        ) : (
          <FeedbackSurveyForm
            values={values}
            errors={errors}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onChange={handleFieldChange}
            onTogglePlatform={handleTogglePlatform}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onJumpToSection={handleJumpToSection}
          />
        )}
      </main>

      <footer className="border-t border-[#E5E5E5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-[#555555]">
          <span>eBay Customer Service · Shopping Experience Feedback</span>
          <span>Questions 1–5, 7, 10, and 11 are required · Email is optional</span>
        </div>
      </footer>
    </div>
  );
}
