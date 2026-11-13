import React from 'react';
import { ChevronRight } from 'lucide-react';

interface EbayHeaderProps {
  isSubmitted: boolean;
  onJumpToSection: (sectionId: string) => void;
  onStartNew: () => void;
}

export const EbayHeader: React.FC<EbayHeaderProps> = ({
  isSubmitted,
  onJumpToSection,
  onStartNew,
}) => {
  return (
    <header className="w-full bg-white">
      {/* Top Bar Contract: 3 clean zones separated by gap-8 */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Brand Lockup */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-4 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3665F3] rounded"
          aria-label="eBay Customer Service"
        >
          <svg
            width="86"
            height="34"
            viewBox="0 0 120 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-8 w-auto"
          >
            <text
              x="2"
              y="36"
              fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
              fontWeight="700"
              fontSize="41"
              letterSpacing="-2.4"
            >
              <tspan fill="#E53238">e</tspan>
              <tspan fill="#0064D2">b</tspan>
              <tspan fill="#F5AF02">a</tspan>
              <tspan fill="#86B817">y</tspan>
            </text>
          </svg>
          <span className="text-[21px] font-normal tracking-tight text-[#191919]">
            Customer Service
          </span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        {!isSubmitted ? (
          <nav
            aria-label="Survey sections"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#555555]"
          >
            <button
              type="button"
              onClick={() => onJumpToSection('section-satisfaction')}
              className="hover:text-[#191919] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3665F3] rounded"
            >
              Satisfaction
            </button>
            <button
              type="button"
              onClick={() => onJumpToSection('section-accuracy')}
              className="hover:text-[#191919] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3665F3] rounded"
            >
              Order &amp; Value
            </button>
            <button
              type="button"
              onClick={() => onJumpToSection('section-comparison')}
              className="hover:text-[#191919] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3665F3] rounded"
            >
              Comparison
            </button>
            <button
              type="button"
              onClick={() => onJumpToSection('section-priorities')}
              className="hover:text-[#191919] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3665F3] rounded"
            >
              Priorities
            </button>
          </nav>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          {isSubmitted ? (
            <button
              type="button"
              onClick={onStartNew}
              className="rounded-full bg-[#3665F3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2B54D9] active:bg-[#2347B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3]"
            >
              New Feedback
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onJumpToSection('survey-submit-anchor')}
              className="rounded-full bg-[#3665F3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2B54D9] active:bg-[#2347B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3]"
            >
              Review &amp; Submit
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb Strip */}
      <div className="border-t border-[#F0F0F0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-6 py-2.5 text-xs text-[#555555]">
          <span>Home</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#767676]" aria-hidden="true" />
          <span>Customer Service</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#767676]" aria-hidden="true" />
          <span className="font-medium text-[#191919]">Shopping Experience Feedback</span>
        </div>
      </div>

      {/* Signature eBay Customer Service Soft Periwinkle Hero Band */}
      <div className="w-full bg-[#D4E2FC]">
        <div className="mx-auto max-w-7xl px-6 py-9 md:py-11">
          <h1
            className="max-w-3xl text-3xl font-bold tracking-tight text-[#191919] md:text-[34px] md:leading-[1.2]"
            style={{ textWrap: 'balance' }}
          >
            {isSubmitted
              ? 'Thank you for helping us improve eBay.'
              : 'How was your eBay shopping experience?'}
          </h1>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-[#333333]">
            {isSubmitted
              ? 'Your response has been recorded in our Customer Service feedback log and will directly inform upcoming marketplace improvements.'
              : 'Share candid feedback on satisfaction, item delivery, pricing value, and what eBay should prioritize next. Takes about 3 minutes.'}
          </p>
        </div>
      </div>
    </header>
  );
};
