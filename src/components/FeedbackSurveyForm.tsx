import React from 'react';
import { AlertCircle, Check, Loader2, RotateCcw } from 'lucide-react';
import {
  FeedbackFormValues,
  OTHER_PLATFORMS,
  PRIORITY_AREAS,
  Q1_LABELS,
  Q7_LABELS,
  ValidationErrors,
} from '../types/feedback';
import { countRequiredCompleted, resolveQ10Value } from '../services/feedbackSubmission';
import { FivePointScale, NpsScale, SegmentedTriChoice } from './ScaleControls';

interface FeedbackSurveyFormProps {
  values: FeedbackFormValues;
  errors: ValidationErrors;
  submitError: string | null;
  isSubmitting: boolean;
  onChange: <K extends keyof FeedbackFormValues>(field: K, value: FeedbackFormValues[K]) => void;
  onTogglePlatform: (platform: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onJumpToSection: (sectionId: string) => void;
}

export const FeedbackSurveyForm: React.FC<FeedbackSurveyFormProps> = ({
  values,
  errors,
  submitError,
  isSubmitting,
  onChange,
  onTogglePlatform,
  onSubmit,
  onReset,
  onJumpToSection,
}) => {
  const requiredCompleted = countRequiredCompleted(values);
  const totalRequired = 8;
  const progressPercent = Math.round((requiredCompleted / totalRequired) * 100);

  const sectionStatus = [
    {
      id: 'section-satisfaction',
      label: '01. Overall Satisfaction',
      detail: 'Q1 – Q4',
      done:
        /^[1-5]$/.test(values.q1) &&
        values.q2.trim().length > 0 &&
        /^(10|[0-9])$/.test(values.q3) &&
        values.q4.trim().length > 0,
    },
    {
      id: 'section-accuracy',
      label: '02. Order Accuracy & Value',
      detail: 'Q5 – Q7',
      done: ['Yes', 'Partly', 'No'].includes(values.q5) && /^[1-5]$/.test(values.q7),
    },
    {
      id: 'section-comparison',
      label: '03. Market Comparison',
      detail: 'Q8 – Q9 (Optional)',
      done: values.q8Selected.length > 0 || values.q9.trim().length > 0,
      optional: true,
    },
    {
      id: 'section-priorities',
      label: '04. Priorities & Contact',
      detail: 'Q10 – Q12',
      done: resolveQ10Value(values).length > 0 && values.q11.trim().length > 0,
    },
  ];

  const renderFieldError = (message?: string) => {
    if (!message) return null;
    return (
      <p
        role="alert"
        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#B91C1C]"
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </p>
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mx-auto max-w-7xl px-6 py-8 md:py-10"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Main Help-Center Style Survey Container (single-level elevation, hairline dividers) */}
        <div className="rounded-2xl bg-[#F7F7F7] px-6 py-7 sm:px-9 sm:py-9">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#E5E5E5] pb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#191919]">
                Customer Experience Survey
              </h2>
              <p className="mt-1 text-sm text-[#555555]">
                Questions marked <span className="font-semibold text-[#191919]">Required</span> must be completed before submitting.
              </p>
            </div>
            <span className="text-xs font-medium text-[#555555] tabular-nums">
              12 questions · {requiredCompleted} of {totalRequired} required answered
            </span>
          </div>

          {/* Global Submission Error Banner */}
          {submitError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3.5 text-sm text-[#991B1B]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
              <div>
                <div className="font-semibold">Unable to submit feedback</div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#7F1D1D]">{submitError}</p>
              </div>
            </div>
          )}

          {/* SECTION 01: OVERALL SATISFACTION */}
          <section id="section-satisfaction" className="pt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-bold text-[#191919]">
                01. Overall Satisfaction
              </h3>
              <span className="text-xs text-[#555555]">Q1 – Q4</span>
            </div>

            <div className="mt-5 divide-y divide-[#E5E5E5]">
              {/* Q1 */}
              <div className="py-6 first:pt-2">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q1-scale"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q1. Overall, how satisfied are you with your eBay shopping experience?
                  </label>
                  <span className="text-xs font-medium text-[#0064D2]">Required</span>
                </div>
                <FivePointScale
                  id="q1-scale"
                  value={values.q1}
                  onChange={(val) => onChange('q1', val)}
                  labels={Q1_LABELS}
                  lowAnchor="Very dissatisfied"
                  highAnchor="Very satisfied"
                  hasError={Boolean(errors.q1)}
                />
                {renderFieldError(errors.q1)}
              </div>

              {/* Q2 */}
              <div className="py-6">
                <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q2-input"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q2. What is the primary reason for your satisfaction rating?
                  </label>
                  <span className="text-xs font-medium text-[#0064D2]">Required</span>
                </div>
                <textarea
                  id="q2-input"
                  rows={3}
                  value={values.q2}
                  onChange={(e) => onChange('q2', e.target.value)}
                  placeholder="Tell us what went well or what caused friction during your shopping experience..."
                  aria-invalid={Boolean(errors.q2)}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191919] placeholder:text-[#767676] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3665F3] ${
                    errors.q2 ? 'border-[#DC2626]' : 'border-[#D1D5DB] hover:border-[#9CA3AF]'
                  }`}
                />
                {renderFieldError(errors.q2)}
              </div>

              {/* Q3 */}
              <div className="py-6">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q3-scale"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q3. How likely are you to recommend shopping on eBay to a friend or colleague?
                  </label>
                  <span className="text-xs font-medium text-[#0064D2]">Required</span>
                </div>
                <NpsScale
                  id="q3-scale"
                  value={values.q3}
                  onChange={(val) => onChange('q3', val)}
                  hasError={Boolean(errors.q3)}
                />
                {renderFieldError(errors.q3)}
              </div>

              {/* Q4 */}
              <div className="py-6 pb-2">
                <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q4-input"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q4. What is the main reason for your recommendation score?
                  </label>
                  <span className="text-xs font-medium text-[#0064D2]">Required</span>
                </div>
                <textarea
                  id="q4-input"
                  rows={3}
                  value={values.q4}
                  onChange={(e) => onChange('q4', e.target.value)}
                  placeholder="Share why you would or wouldn't recommend eBay to others..."
                  aria-invalid={Boolean(errors.q4)}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191919] placeholder:text-[#767676] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3665F3] ${
                    errors.q4 ? 'border-[#DC2626]' : 'border-[#D1D5DB] hover:border-[#9CA3AF]'
                  }`}
                />
                {renderFieldError(errors.q4)}
              </div>
            </div>
          </section>

          {/* SECTION 02: ORDER ACCURACY & VALUE */}
          <section id="section-accuracy" className="mt-8 border-t border-[#E0E0E0] pt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-bold text-[#191919]">
                02. Order Accuracy &amp; Value
              </h3>
              <span className="text-xs text-[#555555]">Q5 – Q7</span>
            </div>

            <div className="mt-5 divide-y divide-[#E5E5E5]">
              {/* Q5 */}
              <div className="py-6 first:pt-2">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q5-choice"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q5. Did the item condition and delivery match the seller&apos;s listing description?
                  </label>
                  <span className="text-xs font-medium text-[#0064D2]">Required</span>
                </div>
                <SegmentedTriChoice
                  id="q5-choice"
                  value={values.q5}
                  onChange={(val) => onChange('q5', val)}
                  hasError={Boolean(errors.q5)}
                />
                {renderFieldError(errors.q5)}
              </div>

              {/* Q6 */}
              <div className="py-6">
                <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q6-input"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q6. What specific aspects of the item condition, packaging, or delivery could be improved?
                  </label>
                  <span className="text-xs text-[#555555]">Optional</span>
                </div>
                <textarea
                  id="q6-input"
                  rows={3}
                  value={values.q6}
                  onChange={(e) => onChange('q6', e.target.value)}
                  placeholder="Optional details on packaging protection, tracking accuracy, or item grading..."
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#191919] placeholder:text-[#767676] transition-colors hover:border-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3665F3]"
                />
              </div>

              {/* Q7 */}
              <div className="py-6 pb-2">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q7-scale"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q7. How do you rate eBay&apos;s pricing, seller fees, and overall value for money?
                  </label>
                  <span className="text-xs font-medium text-[#0064D2]">Required</span>
                </div>
                <FivePointScale
                  id="q7-scale"
                  value={values.q7}
                  onChange={(val) => onChange('q7', val)}
                  labels={Q7_LABELS}
                  lowAnchor="Very poor value"
                  highAnchor="Excellent value"
                  hasError={Boolean(errors.q7)}
                />
                {renderFieldError(errors.q7)}
              </div>
            </div>
          </section>

          {/* SECTION 03: MARKET COMPARISON */}
          <section id="section-comparison" className="mt-8 border-t border-[#E0E0E0] pt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-bold text-[#191919]">
                03. Market Comparison
              </h3>
              <span className="text-xs text-[#555555]">Q8 – Q9</span>
            </div>

            <div className="mt-5 divide-y divide-[#E5E5E5]">
              {/* Q8 */}
              <div className="py-6 first:pt-2">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[15px] font-semibold leading-snug text-[#191919]">
                    Q8. Which other shopping platforms do you use regularly? (pick as many as apply)
                  </span>
                  <span className="text-xs text-[#555555]">Optional</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {[...OTHER_PLATFORMS, 'Other'].map((platform) => {
                    const checked = values.q8Selected.includes(platform);
                    return (
                      <label
                        key={platform}
                        className={`flex min-h-[44px] items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors cursor-pointer ${
                          checked
                            ? 'border-[#3665F3] bg-[#EEF3FE] text-[#191919] font-medium'
                            : 'border-[#D1D5DB] bg-white text-[#191919] hover:border-[#3665F3] hover:bg-[#F8FAFF]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onTogglePlatform(platform)}
                          className="h-4 w-4 rounded border-[#9CA3AF] text-[#3665F3] focus:ring-[#3665F3]"
                        />
                        <span>{platform}</span>
                      </label>
                    );
                  })}
                </div>

                {values.q8Selected.includes('Other') && (
                  <div className="mt-3">
                    <label htmlFor="q8-other" className="sr-only">
                      Specify other shopping platforms
                    </label>
                    <input
                      id="q8-other"
                      type="text"
                      value={values.q8Other}
                      onChange={(e) => onChange('q8Other', e.target.value)}
                      placeholder="Specify other platform(s)..."
                      className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#191919] placeholder:text-[#767676] focus:outline-none focus:ring-2 focus:ring-[#3665F3]"
                    />
                  </div>
                )}
              </div>

              {/* Q9 */}
              <div className="py-6 pb-2">
                <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q9-input"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q9. What do other platforms do better than eBay?
                  </label>
                  <span className="text-xs text-[#555555]">Optional</span>
                </div>
                <textarea
                  id="q9-input"
                  rows={3}
                  value={values.q9}
                  onChange={(e) => onChange('q9', e.target.value)}
                  placeholder="Optional comparison on search filters, shipping speed, checkout flow, or buyer support..."
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#191919] placeholder:text-[#767676] transition-colors hover:border-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3665F3]"
                />
              </div>
            </div>
          </section>

          {/* SECTION 04: PRIORITIES & CONTACT */}
          <section id="section-priorities" className="mt-8 border-t border-[#E0E0E0] pt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-bold text-[#191919]">
                04. Priorities &amp; Contact
              </h3>
              <span className="text-xs text-[#555555]">Q10 – Q12</span>
            </div>

            <div className="mt-5 divide-y divide-[#E5E5E5]">
              {/* Q10 */}
              <div id="q10-group" className="py-6 first:pt-2">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[15px] font-semibold leading-snug text-[#191919]">
                    Q10. What area should eBay prioritize improving most?
                  </span>
                  <span className="text-xs font-medium text-[#0064D2]">Required</span>
                </div>

                <div
                  role="radiogroup"
                  aria-invalid={Boolean(errors.q10)}
                  className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                >
                  {PRIORITY_AREAS.map((area) => {
                    const selected = values.q10Selection === area;
                    return (
                      <label
                        key={area}
                        className={`flex min-h-[46px] items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#3665F3] bg-[#EEF3FE] text-[#191919] font-medium ring-1 ring-[#3665F3]'
                            : errors.q10
                              ? 'border-[#DC2626]/50 bg-white text-[#191919] hover:border-[#3665F3]'
                              : 'border-[#D1D5DB] bg-white text-[#191919] hover:border-[#3665F3] hover:bg-[#F8FAFF]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="q10-priority"
                          value={area}
                          checked={selected}
                          onChange={() => onChange('q10Selection', area)}
                          className="h-4 w-4 border-[#9CA3AF] text-[#3665F3] focus:ring-[#3665F3]"
                        />
                        <span>{area}</span>
                      </label>
                    );
                  })}
                </div>

                {values.q10Selection === 'Other' && (
                  <div className="mt-3">
                    <label htmlFor="q10-other" className="sr-only">
                      Specify other priority area
                    </label>
                    <input
                      id="q10-other"
                      type="text"
                      value={values.q10Other}
                      onChange={(e) => onChange('q10Other', e.target.value)}
                      placeholder="Enter the priority area eBay should improve..."
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#191919] placeholder:text-[#767676] focus:outline-none focus:ring-2 focus:ring-[#3665F3] ${
                        errors.q10 ? 'border-[#DC2626]' : 'border-[#D1D5DB]'
                      }`}
                    />
                  </div>
                )}

                {renderFieldError(errors.q10)}
              </div>

              {/* Q11 */}
              <div className="py-6">
                <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q11-input"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q11. What is the single most important improvement eBay should make to enhance your experience?
                  </label>
                  <span className="text-xs font-medium text-[#0064D2]">Required</span>
                </div>
                <textarea
                  id="q11-input"
                  rows={3}
                  value={values.q11}
                  onChange={(e) => onChange('q11', e.target.value)}
                  placeholder="Describe the one change that would make the biggest positive difference for you..."
                  aria-invalid={Boolean(errors.q11)}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191919] placeholder:text-[#767676] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3665F3] ${
                    errors.q11 ? 'border-[#DC2626]' : 'border-[#D1D5DB] hover:border-[#9CA3AF]'
                  }`}
                />
                {renderFieldError(errors.q11)}
              </div>

              {/* Q12 */}
              <div className="py-6 pb-2">
                <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="q12-input"
                    className="text-[15px] font-semibold leading-snug text-[#191919]"
                  >
                    Q12. Email address (optional)
                  </label>
                  <span className="text-xs text-[#555555]">Optional</span>
                </div>
                <input
                  id="q12-input"
                  type="email"
                  value={values.q12}
                  onChange={(e) => onChange('q12', e.target.value)}
                  placeholder="name@example.com"
                  aria-invalid={Boolean(errors.q12)}
                  className={`w-full max-w-md rounded-xl border bg-white px-4 py-2.5 text-sm text-[#191919] placeholder:text-[#767676] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3665F3] ${
                    errors.q12 ? 'border-[#DC2626]' : 'border-[#D1D5DB] hover:border-[#9CA3AF]'
                  }`}
                />
                <p className="mt-1.5 text-xs text-[#555555]">
                  Only used if Customer Service needs to follow up on your feedback.
                </p>
                {renderFieldError(errors.q12)}
              </div>
            </div>
          </section>

          {/* Bottom Submit Bar (Mobile & End-of-Form Action) */}
          <div
            id="survey-submit-anchor"
            className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#E0E0E0] pt-6"
          >
            <button
              type="button"
              onClick={onReset}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#555555] underline underline-offset-4 hover:text-[#191919] disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3665F3] rounded"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Clear all responses</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#3665F3] px-8 py-3 text-sm font-semibold text-white hover:bg-[#2B54D9] active:bg-[#2347B8] disabled:cursor-not-allowed disabled:opacity-70 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Submitting feedback...</span>
                </>
              ) : (
                <span>Submit Feedback</span>
              )}
            </button>
          </div>
        </div>

        {/* Sticky Desktop Sidebar: Progress & Section Navigation */}
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-2xl bg-[#F7F7F7] p-6">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-base font-bold text-[#191919]">Your Progress</h2>
              <span className="text-xs font-semibold text-[#191919] tabular-nums">
                {requiredCompleted}/{totalRequired} required
              </span>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
              <div
                className="h-full rounded-full bg-[#3665F3] transition-transform duration-200 origin-left"
                style={{ transform: `scaleX(${progressPercent / 100})` }}
              />
            </div>

            <nav aria-label="Section checklist" className="mt-5 divide-y divide-[#E5E5E5]">
              {sectionStatus.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onJumpToSection(sec.id)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:text-[#0064D2] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3] rounded"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#191919]">{sec.label}</div>
                    <div className="text-xs text-[#555555]">{sec.detail}</div>
                  </div>
                  <span
                    aria-label={sec.done ? 'Completed' : 'Pending'}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      sec.done
                        ? 'border-[#137333] bg-[#E6F4EA] text-[#137333]'
                        : 'border-[#D1D5DB] bg-white text-transparent'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </nav>

            <div className="mt-5 border-t border-[#E5E5E5] pt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#3665F3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2B54D9] active:bg-[#2347B8] disabled:cursor-not-allowed disabled:opacity-70 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </button>
              <p className="mt-3 text-xs leading-relaxed text-[#555555]">
                Your responses are saved securely to the Customer Service Feedback Responses sheet. Draft answers are kept locally until submitted.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
};
