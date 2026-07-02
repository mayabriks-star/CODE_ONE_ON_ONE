import { Menu, Bell, Minus, Plus, Search, Waves } from 'lucide-react';

const leftIcons = [Menu, Bell, Minus, Plus] as const;

export default function HomePageHeader({ onMinus, map }: { showBadge?: boolean; onMinus?: () => void; map?: any }) {
  return (
    <div className="absolute left-[16px] right-[16px] top-[12px]" style={{ pointerEvents: 'auto' }}>
      <div className="h-[52px] glass-65 glass-shadow rounded-[26px] flex items-center px-[10px] gap-[6px]">

        {/* Icon buttons — each in its own circle */}
        {leftIcons.map((Icon, i) => (
          <button
            key={i}
            className="w-[36px] h-[36px] rounded-full bg-white/60 flex items-center justify-center hover:bg-white/80 transition-colors"
            onClick={i === 2 ? () => { onMinus?.(); map?.zoomOut(); } : i === 3 ? () => map?.zoomIn() : undefined}
          >
            <Icon size={17} strokeWidth={1.5} className="text-[#1e2939]" />
          </button>
        ))}

        <div className="flex-1 flex justify-center">
          <div className="h-[34px] w-[370px] rounded-full bg-white/50 flex items-center gap-[8px] px-[12px]">
            <Search size={13} strokeWidth={1.5} className="text-[#1e2939] flex-shrink-0" />
            <span className="text-[#1e2939] text-[13px] font-medium">Search</span>
          </div>
        </div>

        {/* Shoreline logo */}
        <div className="flex items-center gap-[7px] pr-[6px]">
          <Waves size={18} strokeWidth={1.8} className="text-[#1e2939]" />
          <span className="font-bold text-[15px] tracking-[-0.3px] text-[#1e2939]">Shoreline</span>
        </div>

      </div>
    </div>
  );
}
