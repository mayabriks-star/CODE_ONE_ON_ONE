import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { strategy } from '../../mockData';

const metricCards = [
  { label: 'Timeline', value: strategy.timeline, valueColor: '#101828' },
  { label: 'Investment', value: strategy.investment, valueColor: '#101828' },
  { label: 'Risk Reduction', value: strategy.riskReduction, valueColor: '#00a63e' },
  { label: 'Impact Delay', value: strategy.impactDelay, valueColor: '#101828' },
];

export default function StrategyCard() {
  const leftComponents = strategy.components.slice(0, 3);
  const rightComponents = strategy.components.slice(3);

  return (
    <>
      {/* Strategy header */}
      <div className="absolute left-[103px] top-[334px] flex items-center gap-[12px]">
        <div className="w-[40px] h-[40px] rounded-sm bg-[#519bd3] flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={24} className="text-white" strokeWidth={1.5} />
        </div>
        <span className="font-bold text-[18px] leading-[28px] tracking-[-0.44px] text-[#101828]">
          {strategy.title}
        </span>
      </div>

      {/* Description */}
      <p className="absolute left-[103px] top-[385px] w-[719px] text-[14px] leading-[22.75px] tracking-[-0.15px] text-[#364153]">
        {strategy.description}
      </p>

      {/* Metric cards */}
      <div className="absolute left-[103px] top-[443px] flex items-center gap-[16px]">
        {metricCards.map(({ label, value, valueColor }) => (
          <div
            key={label}
            className="w-[167px] h-[68px] rounded-sm pt-[12px] px-[12px] flex flex-col gap-[4px]"
            style={{ background: 'white', border: '1px solid #f0f0f0' }}
          >
            <span className="text-[12px] leading-[16px] text-[#4a5565]">{label}</span>
            <span className="font-bold text-[16px] leading-[24px] tracking-[-0.31px]" style={{ color: valueColor }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* KEY COMPONENTS label */}
      <span className="absolute left-[103px] top-[524px] uppercase text-[12px] leading-[16px] tracking-wide font-semibold text-[#364153]">
        Key Components
      </span>

      {/* Left components */}
      <div className="absolute left-[103px] top-[553px] flex flex-col gap-[10px]">
        {leftComponents.map((item) => (
          <div key={item} className="flex items-center gap-[8px] h-[20px]">
            <CheckCircle2 size={16} className="text-[#519bd3] flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#364153]">{item}</span>
          </div>
        ))}
      </div>

      {/* Right components */}
      <div className="absolute left-[473px] top-[553px] flex flex-col gap-[10px]">
        {rightComponents.map((item) => (
          <div key={item} className="flex items-center gap-[8px] h-[20px]">
            <CheckCircle2 size={16} className="text-[#519bd3] flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#364153]">{item}</span>
          </div>
        ))}
      </div>

      {/* Compare link */}
      <span className="absolute left-[104px] top-[645px] text-[14px] leading-[30px] tracking-[-0.45px] text-black underline cursor-pointer">
        Compare other options
      </span>
    </>
  );
}
