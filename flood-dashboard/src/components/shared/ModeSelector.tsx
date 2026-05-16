import React from 'react';

type Mode = 'Protect' | 'Adapt' | 'Retreat';

interface Props {
  active?: Mode;
}

function ProtectIcon() {
  return (
    <svg width="30" height="8" viewBox="0 0 30 8" fill="none">
      <rect x="0" y="3" width="30" height="2" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="5" y="1" width="20" height="6" rx="2" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

function AdaptIcon() {
  return (
    <svg width="30" height="12" viewBox="0 0 30 12" fill="none">
      <path d="M2 10 Q8 2 15 6 Q22 10 28 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

function RetreatIcon() {
  return (
    <svg width="30" height="15" viewBox="0 0 30 15" fill="none">
      <path d="M2 13 L8 5 L15 9 L22 3 L28 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

export default function ModeSelector({ active = 'Protect' }: Props) {
  const modes: { label: Mode; Icon: () => React.ReactElement }[] = [
    { label: 'Protect', Icon: ProtectIcon },
    { label: 'Adapt', Icon: AdaptIcon },
    { label: 'Retreat', Icon: RetreatIcon },
  ];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[25px] w-[489px] h-[50px] glass-30 glass-shadow-sm rounded-pill flex items-center justify-center gap-[10px] px-[19px] py-[6px]">
      {modes.map(({ label, Icon }) => (
        <div
          key={label}
          className={`flex items-center gap-[10px] px-[13px] py-[6px] rounded-lg ${
            active === label ? 'glass-53' : ''
          }`}
        >
          <Icon />
          <span className={`font-medium text-[14px] leading-[20px] tracking-[-0.15px] text-black whitespace-nowrap ${active === label ? 'font-semibold' : ''}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
