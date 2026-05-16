import { ChevronDown } from 'lucide-react';
import { budget } from '../../mockData';

const RADIUS = 60;
const STROKE = 18;
const CIRC = 2 * Math.PI * RADIUS;

export default function BudgetCard() {
  const protectionDash = (budget.protectionPercent / 100) * CIRC;
  const adaptDash = (budget.adaptationPercent / 100) * CIRC;
  

  return (
    <div
      className="absolute rounded-md flex flex-col"
      style={{ left: '930px', top: '669px', width: '533px', height: '276px', background: 'white', border: '1px solid #e5e7eb' }}
    >
      {/* Header */}
      <div className="px-[24px] pt-[3px] pb-px border-b border-[#e5e7eb] rounded-t-md" style={{ background: '#f9fafb', height: '51px' }}>
        <span className="font-bold text-[18px] leading-[30px] tracking-[-0.45px] text-[#101828] block">Estimated Budget</span>
        <span className="text-[12px] leading-[20px] tracking-[-0.15px] text-[#4a5565]">Comprehensive financial planning for recommended strategy</span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-[14px] px-[24px] pt-[12px]">
        <div className="flex items-center gap-[32px] h-[148px]">
          {/* Donut chart */}
          <div className="w-[160px] h-[160px] flex-shrink-0 relative flex items-center justify-center">
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* Background ring */}
              <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#f3f4f6" strokeWidth={STROKE} />
              {/* Adaptation slice (light blue, starts at top) */}
              <circle
                cx="80" cy="80" r={RADIUS} fill="none"
                stroke="#51a2ff" strokeWidth={STROKE}
                strokeDasharray={`${adaptDash - 3} ${CIRC - adaptDash + 3}`}
                strokeDashoffset={CIRC * 0.25}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
              />
              {/* Protection slice (dark blue) */}
              <circle
                cx="80" cy="80" r={RADIUS} fill="none"
                stroke="#155dfc" strokeWidth={STROKE}
                strokeDasharray={`${protectionDash - 3} ${CIRC - protectionDash + 3}`}
                strokeDashoffset={CIRC * 0.25 - adaptDash}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-bold text-[20px] leading-[24px] text-[#101828]">$70M</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-[10px] flex-1">
            <div className="flex flex-col gap-[4px]">
              <span className="font-bold text-[22px] leading-[40px] tracking-[0.37px] text-[#101828]">{budget.total}</span>
              <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#4a5565]">Total estimated investment over 5 years</span>
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[12px] h-[12px] rounded-full bg-[#155dfc]" />
                  <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#364153]">{budget.protectionLabel}</span>
                </div>
                <span className="font-semibold text-[16px] leading-[24px] tracking-[-0.31px] text-[#101828]">{budget.protectionAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[12px] h-[12px] rounded-full bg-[#51a2ff]" />
                  <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#364153]">{budget.adaptationLabel}</span>
                </div>
                <span className="font-semibold text-[16px] leading-[24px] tracking-[-0.31px] text-[#101828]">{budget.adaptationAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* See Detailed Breakdown button */}
        <button
          className="w-full h-[33px] rounded-sm flex items-center justify-center gap-[16px] hover:bg-[#f9fafb] transition-colors"
          style={{ border: '1px solid #d1d5dc' }}
        >
          <ChevronDown size={16} className="text-[#364153]" strokeWidth={1.5} />
          <span className="font-medium text-[14px] leading-[20px] tracking-[-0.15px] text-[#364153] text-center">
            See Detailed Breakdown
          </span>
        </button>
      </div>
    </div>
  );
}
