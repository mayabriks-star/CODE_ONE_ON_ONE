type Mode = 'Protect' | 'Adapt' | 'Retreat';

interface Props {
  active?: Mode;
}

function ProtectIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12 L12 7 L22 12 L12 17 Z" />
    </svg>
  );
}

function AdaptIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9 L12 4 L22 9 L12 14 Z" />
      <path d="M2 15 L12 10 L22 15 L12 20 Z" />
    </svg>
  );
}

function RetreatIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7 L12 3 L22 7 L12 11 Z" />
      <path d="M2 13 L12 9 L22 13 L12 17 Z" />
      <path d="M2 19 L12 15 L22 19 L12 23 Z" />
    </svg>
  );
}

const modes = [
  { label: 'Protect' as Mode, Icon: ProtectIcon },
  { label: 'Adapt'   as Mode, Icon: AdaptIcon   },
  { label: 'Retreat' as Mode, Icon: RetreatIcon  },
];

export default function ModeSelector({ active = 'Protect' }: Props) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[25px] w-[489px] h-[50px] glass-30 glass-shadow-sm rounded-pill flex items-center justify-center gap-[10px] px-[19px] py-[6px]">
      {modes.map(({ label, Icon }) => (
        <div
          key={label}
          className={`flex items-center gap-[10px] px-[13px] py-[6px] rounded-lg ${
            active === label ? 'glass-53' : ''
          }`}
        >
          <div className="text-black opacity-70">
            <Icon />
          </div>
          <span className={`font-medium text-[14px] leading-[20px] tracking-[-0.15px] text-black whitespace-nowrap ${active === label ? 'font-semibold' : ''}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
