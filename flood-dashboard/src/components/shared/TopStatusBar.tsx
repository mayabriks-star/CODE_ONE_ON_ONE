import { Bell, Menu } from 'lucide-react';

interface Props {
  showBadge?: boolean;
  dark?: boolean;
}

export default function TopStatusBar({ showBadge = false, dark = false }: Props) {
  const textColor = dark ? 'text-[#101828]' : 'text-black';
  const subColor = dark ? 'text-[#505153]' : 'text-[#505153]';
  const divColor = dark ? 'bg-[#e5e7eb]' : 'bg-[rgba(255,255,255,0.4)]';

  return (
    <div className="absolute flex items-center gap-[15px] top-[29px] right-[21px]">
      <div className="flex flex-col items-start w-[76px]">
        <span className={`font-semibold text-[14px] leading-[20px] tracking-[-0.15px] whitespace-nowrap ${textColor}`}>10:42 AM</span>
        <span className={`text-[12px] leading-[16px] whitespace-nowrap ${subColor}`}>Last update</span>
      </div>
      <div className={`w-px h-[37px] ${divColor}`} />
      <div className="flex flex-col items-start w-[76px]">
        <span className={`font-semibold text-[14px] leading-[20px] tracking-[-0.15px] whitespace-nowrap ${textColor}`}>Moderate</span>
        <span className={`text-[12px] leading-[16px] whitespace-nowrap ${subColor}`}>City status</span>
      </div>
      <div className={`w-px h-[37px] ${divColor}`} />
      <div className="flex flex-col items-center w-[28px] relative">
        <div className="relative">
          <Bell size={20} className={dark ? 'text-[#101828]' : 'text-black'} strokeWidth={1.5} />
          {showBadge && (
            <span className="absolute -top-1 -right-1 bg-[#fb2c36] rounded-full w-[8px] h-[8px]" />
          )}
        </div>
        <span className={`text-[10px] leading-[12px] text-center ${subColor}`}>Alerts</span>
      </div>
      <div className={`w-px h-[37px] ${divColor}`} />
      <Menu size={20} className={dark ? 'text-[#101828]' : 'text-black'} strokeWidth={1.5} />
    </div>
  );
}
