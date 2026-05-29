import { ChevronRight } from 'lucide-react';

interface Props {
  onClick?: () => void;
}

export default function NewAlertCard({ onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="absolute left-[21px] top-[630px] w-[326px] rounded-lg cursor-pointer alert-card-enter hover:opacity-90 transition-opacity"
      style={{ background: 'rgba(180, 30, 40, 0.92)', backdropFilter: 'blur(8px)' }}
      role="button"
      aria-label="View alert details"
    >
      <div className="flex items-center justify-between px-[14px] py-[12px] gap-[12px]">
        <div className="flex flex-col gap-[4px] flex-1">
          <span className="font-bold text-[13px] leading-[18px] text-white">New Alert</span>
          <p className="text-[11px] leading-[16px] text-[rgba(255,255,255,0.85)]">
            Sea level has reached a level that requires preventive action.
          </p>
          <p className="text-[11px] leading-[16px] text-[rgba(255,255,255,0.85)]">
            Review risk areas before impact occurs
          </p>
        </div>
        <div className="flex-shrink-0 w-[28px] h-[28px] rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
          <ChevronRight size={16} className="text-white" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
