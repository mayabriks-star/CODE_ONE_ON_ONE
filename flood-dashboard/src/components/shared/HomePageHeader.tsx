import { Menu, Bell, Minus, Plus, Search, Navigation, ChevronDown } from 'lucide-react';

const leftIcons = [Menu, Bell, Minus, Plus] as const;

export default function HomePageHeader({ showBadge, onMinus }: { showBadge?: boolean; onMinus?: () => void }) {
  return (
    <div className="absolute left-0 right-0 top-0 h-[70px] flex items-center px-[20px]">
      {/* Left: icon buttons */}
      <div className="flex items-center gap-[8px]">
        {leftIcons.map((Icon, i) => (
          <div key={i} className="relative">
            <button
              className="w-[44px] h-[44px] rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center"
              onClick={i === 2 ? onMinus : undefined}
            >
              <Icon size={18} strokeWidth={1.5} className="text-gray-700" />
            </button>
            {i === 1 && showBadge && (
              <span className="absolute top-[6px] right-[6px] w-[8px] h-[8px] rounded-full bg-red-500" />
            )}
          </div>
        ))}
      </div>

      {/* Center: search bar */}
      <div className="flex-1 flex justify-center px-[24px]">
        <div className="w-full max-w-[440px] h-[44px] rounded-full bg-white/70 backdrop-blur-sm flex items-center gap-[10px] px-[18px]">
          <Search size={16} strokeWidth={1.5} className="text-gray-400" />
          <span className="text-gray-400 text-[14px]">Search</span>
        </div>
      </div>

      {/* Right: Protect button */}
      <div className="h-[44px] rounded-full bg-white/70 backdrop-blur-sm flex items-center gap-[8px] px-[16px]">
        <Navigation size={16} strokeWidth={1.5} className="text-gray-600" />
        <span className="text-[14px] font-medium text-gray-800">Protect</span>
        <ChevronDown size={14} strokeWidth={1.5} className="text-gray-500" />
      </div>
    </div>
  );
}
