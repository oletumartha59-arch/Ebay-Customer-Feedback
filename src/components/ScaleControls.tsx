import React from 'react';

interface FivePointScaleProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  labels: Record<string, string>;
  lowAnchor: string;
  highAnchor: string;
  hasError?: boolean;
}

export const FivePointScale: React.FC<FivePointScaleProps> = ({
  id,
  value,
  onChange,
  labels,
  lowAnchor,
  highAnchor,
  hasError = false,
}) => {
  const options = ['1', '2', '3', '4', '5'];

  return (
    <div id={id} role="radiogroup" aria-invalid={hasError}>
      <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
        {options.map((num) => {
          const isSelected = value === num;
          return (
            <button
              key={num}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(num)}
              className={`group flex min-h-[58px] flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3] ${
                isSelected
                  ? 'border-[#3665F3] bg-[#3665F3] text-white shadow-sm'
                  : hasError
                    ? 'border-[#DC2626]/50 bg-white text-[#191919] hover:border-[#3665F3] hover:bg-[#F5F8FF]'
                    : 'border-[#D1D5DB] bg-white text-[#191919] hover:border-[#3665F3] hover:bg-[#F5F8FF]'
              }`}
            >
              <span className="text-lg font-bold tabular-nums leading-none">{num}</span>
              <span
                className={`mt-1.5 hidden text-[11px] font-medium leading-tight sm:block ${
                  isSelected ? 'text-white/95' : 'text-[#555555]'
                }`}
              >
                {labels[num]}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-[#555555]">
        <span>1 — {lowAnchor}</span>
        {value && (
          <span className="font-medium text-[#191919] sm:hidden">
            Selected: {value} ({labels[value]})
          </span>
        )}
        <span>5 — {highAnchor}</span>
      </div>
    </div>
  );
};

interface NpsScaleProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}

export const NpsScale: React.FC<NpsScaleProps> = ({
  id,
  value,
  onChange,
  hasError = false,
}) => {
  const scores = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  const getScoreHint = (val: string) => {
    if (!val) return '';
    const n = Number(val);
    if (n <= 6) return 'Detractor';
    if (n <= 8) return 'Passive';
    return 'Promoter';
  };

  return (
    <div id={id} role="radiogroup" aria-invalid={hasError}>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
        {scores.map((score) => {
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(score)}
              className={`flex min-h-[46px] items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3] ${
                isSelected
                  ? 'border-[#3665F3] bg-[#3665F3] text-white shadow-sm'
                  : hasError
                    ? 'border-[#DC2626]/50 bg-white text-[#191919] hover:border-[#3665F3] hover:bg-[#F5F8FF]'
                    : 'border-[#D1D5DB] bg-white text-[#191919] hover:border-[#3665F3] hover:bg-[#F5F8FF]'
              }`}
            >
              {score}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-[#555555]">
        <span>0 — Not at all likely</span>
        {value !== '' && (
          <span className="font-medium text-[#191919] tabular-nums">
            Score: {value}/10 ({getScoreHint(value)})
          </span>
        )}
        <span>10 — Extremely likely</span>
      </div>
    </div>
  );
};

interface SegmentedTriChoiceProps {
  id: string;
  value: 'Yes' | 'Partly' | 'No' | '';
  onChange: (val: 'Yes' | 'Partly' | 'No') => void;
  hasError?: boolean;
}

export const SegmentedTriChoice: React.FC<SegmentedTriChoiceProps> = ({
  id,
  value,
  onChange,
  hasError = false,
}) => {
  const choices: Array<{ value: 'Yes' | 'Partly' | 'No'; caption: string }> = [
    { value: 'Yes', caption: 'Matched description & arrived as expected' },
    { value: 'Partly', caption: 'Minor differences in condition or delivery' },
    { value: 'No', caption: 'Did not match listing or delivery failed' },
  ];

  return (
    <div
      id={id}
      role="radiogroup"
      aria-invalid={hasError}
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
    >
      {choices.map((item) => {
        const isSelected = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(item.value)}
            className={`flex min-h-[68px] flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3665F3] ${
              isSelected
                ? 'border-[#3665F3] bg-[#EEF3FE] text-[#191919] ring-1 ring-[#3665F3]'
                : hasError
                  ? 'border-[#DC2626]/50 bg-white text-[#191919] hover:border-[#3665F3] hover:bg-[#F8FAFF]'
                  : 'border-[#D1D5DB] bg-white text-[#191919] hover:border-[#3665F3] hover:bg-[#F8FAFF]'
            }`}
          >
            <span
              className={`text-sm font-semibold ${
                isSelected ? 'text-[#0064D2]' : 'text-[#191919]'
              }`}
            >
              {item.value}
            </span>
            <span className="mt-0.5 text-xs leading-snug text-[#555555]">
              {item.caption}
            </span>
          </button>
        );
      })}
    </div>
  );
};
