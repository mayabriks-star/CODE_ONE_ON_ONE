import { LayoutDashboard, GitBranch, ArrowLeftRight, FileText, Share2, ArrowUp } from 'lucide-react';
import { summaryStats } from '../../mockData';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: GitBranch, label: 'Scenarios' },
  { icon: ArrowLeftRight, label: 'Compare' },
  { icon: FileText, label: 'Reports' },
  { icon: Share2, label: 'Share' },
];

export default function BottomSummaryBar() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[138px] glass-80 glass-shadow flex flex-col items-center justify-center px-[40px] pb-[37px] pt-[17px]"
    >
      <div className="flex items-center justify-between w-full h-[70px]">
        {/* Stats row */}
        <div className="flex items-center gap-[64px] h-[70px]">
          {/* Risk Level */}
          <div className="flex flex-col gap-[4px]">
            <span className="font-medium text-[14px] leading-[16px] text-[#505153]">Risk Level</span>
            <span className="font-bold text-[24px] leading-[30px] tracking-[0.4px] text-[#ffae00]">
              {summaryStats.riskLevel}
            </span>
            <span className="text-[14px] leading-[16px] text-[#505153]">w/ 2050 projection</span>
          </div>

          <div className="w-px h-[62px] bg-[#e5e7eb]" />

          {/* Affected Districts */}
          <div className="flex flex-col gap-[4px]">
            <span className="font-medium text-[14px] leading-[16px] text-[#505153]">Affected Districts</span>
            <span className="font-bold text-[30px] leading-[30px] tracking-[0.4px] text-black">
              {summaryStats.affectedDistricts} / {summaryStats.totalDistricts}
            </span>
            <div className="flex items-center gap-[4px]">
              <ArrowUp size={14} className="text-[#fb2c36]" strokeWidth={2} />
              <span className="text-[14px] leading-[16px] text-[#fb2c36]">{summaryStats.districtsChange}</span>
            </div>
          </div>

          <div className="w-px h-[62px] bg-[#e5e7eb]" />

          {/* Population at Risk */}
          <div className="flex flex-col gap-[4px]">
            <span className="font-medium text-[14px] leading-[16px] text-[#505153]">Population at Risk</span>
            <span className="font-bold text-[30px] leading-[30px] tracking-[0.4px] text-black">
              {summaryStats.populationAtRisk}
            </span>
            <span className="text-[14px] leading-[16px] text-[#505153]">{summaryStats.populationPercent}</span>
          </div>

          <div className="w-px h-[62px] bg-[#e5e7eb]" />

          {/* Active Alerts */}
          <div className="flex flex-col gap-[4px]">
            <span className="font-medium text-[14px] leading-[16px] text-[#505153]">Active Alerts</span>
            <span className="font-bold text-[30px] leading-[30px] tracking-[0.4px] text-black">
              {summaryStats.activeAlerts}
            </span>
            <span className="text-[14px] leading-[16px] text-[#51a2ff]">View all alerts</span>
          </div>
        </div>

        {/* Nav icons */}
        <div className="flex items-center gap-[12px] h-[56px]">
          {navItems.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-[4px] px-[16px] py-[8px] rounded-sm hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            >
              <Icon size={20} className="text-[#505153]" strokeWidth={1.5} />
              <span className="font-medium text-[12px] leading-[16px] text-[#505153] text-center whitespace-nowrap">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom expand arrow */}
      <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2">
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <path d="M4 4 L12 10 L20 4" stroke="#505153" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
