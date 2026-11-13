import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Q1_LABELS, Q7_LABELS, SubmissionPayload } from '../types/feedback';

interface SubmissionSuccessViewProps {
  payload: SubmissionPayload;
  serverMessage: string;
  submittedAt: string;
  onStartNew: () => void;
}

export const SubmissionSuccessView: React.FC<SubmissionSuccessViewProps> = ({
  payload,
  serverMessage,
  submittedAt,
  onStartNew,
}) => {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-2xl bg-[#F7F7F7] p-6 sm:p-10">
        <div className="flex flex-col gap-4 border-b border-[#E5E5E5] pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E6F4EA] text-[#137333]">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#191919]">
                Feedback received
              </h2>
              <p className="mt-1 text-sm text-[#555555]">{serverMessage}</p>
            </div>
          </div>

          <div className="text-xs text-[#555555] sm:text-right">
            <div>Submitted {submittedAt}</div>
            <div className="mt-0.5 font-mono text-[11px] text-[#767676]">
              Ref: {payload.requestToken.slice(0, 12)}
            </div>
          </div>
        </div>

        {/* Clean Summary Grid — hairline dividers, tabular numbers, no nested cards */}
        <div className="py-7">
          <h3 className="text-sm font-semibold text-[#191919]">
            Summary of your submitted responses
          </h3>

          <dl className="mt-4 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
            <div className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[260px_1fr] sm:gap-4">
              <dt className="text-sm text-[#555555]">Q1. Overall satisfaction</dt>
              <dd className="text-sm font-semibold text-[#191919] tabular-nums">
                {payload.q1} / 5 — {Q1_LABELS[payload.q1] || ''}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[260px_1fr] sm:gap-4">
              <dt className="text-sm text-[#555555]">Q3. Likelihood to recommend</dt>
              <dd className="text-sm font-semibold text-[#191919] tabular-nums">
                {payload.q3} / 10
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[260px_1fr] sm:gap-4">
              <dt className="text-sm text-[#555555]">Q5. Listing &amp; delivery match</dt>
              <dd className="text-sm font-semibold text-[#191919]">{payload.q5}</dd>
            </div>

            <div className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[260px_1fr] sm:gap-4">
              <dt className="text-sm text-[#555555]">Q7. Pricing &amp; value rating</dt>
              <dd className="text-sm font-semibold text-[#191919] tabular-nums">
                {payload.q7} / 5 — {Q7_LABELS[payload.q7] || ''}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[260px_1fr] sm:gap-4">
              <dt className="text-sm text-[#555555]">Q10. Top improvement priority</dt>
              <dd className="text-sm font-semibold text-[#191919]">{payload.q10}</dd>
            </div>

            <div className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[260px_1fr] sm:gap-4">
              <dt className="text-sm text-[#555555]">Q11. Most important improvement</dt>
              <dd className="text-sm text-[#191919] leading-relaxed">{payload.q11}</dd>
            </div>

            {payload.q12 && (
              <div className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[260px_1fr] sm:gap-4">
                <dt className="text-sm text-[#555555]">Q12. Follow-up email</dt>
                <dd className="text-sm font-medium text-[#191919]">{payload.q12}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <p className="text-xs text-[#555555]">
            Need help with a specific order? Visit eBay Customer Service from your account orders page.
          </p>
          <button
            type="button"
            onClick={onStartNew}
            className="inline-flex items-center gap-2 rounded-full bg-[#3665F3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2B54D9] active:bg-[#2347B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3]"
          >
            <span>Submit another response</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
