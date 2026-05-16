import { ArrowLeft, TriangleAlert } from 'lucide-react';
import AlertOverviewCard from '../components/alert/AlertOverviewCard';
import StrategyCard from '../components/alert/StrategyCard';
import DistrictRiskList from '../components/alert/DistrictRiskList';
import BudgetCard from '../components/alert/BudgetCard';
import AffectionsTable from '../components/alert/AffectionsTable';

interface Props {
  onBack: () => void;
}

export default function AlertPage({ onBack }: Props) {
  return (
    <div className="relative w-full h-full screen-enter">
      {/* White panel */}
      <div
        className="absolute inset-[20px] rounded-lg overflow-y-auto overflow-x-hidden"
        style={{ background: 'white' }}
      >
        {/* Back arrow */}
        <button
          onClick={onBack}
          className="absolute left-[30px] top-[39px] w-[22px] h-[20px] flex items-center justify-center hover:opacity-70 transition-opacity z-10"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-black" strokeWidth={2} />
        </button>

        {/* Status bar (positioned inside white panel) */}
        <div className="relative h-[80px]">
          <div className="absolute flex items-center gap-[15px] top-[29px] right-[21px]">
            <div className="flex flex-col items-start w-[76px]">
              <span className="font-semibold text-[14px] leading-[20px] tracking-[-0.15px] text-black whitespace-nowrap">10:42 AM</span>
              <span className="text-[12px] leading-[16px] text-[#505153] whitespace-nowrap">Last update</span>
            </div>
            <div className="w-px h-[37px] bg-[#e5e7eb]" />
            <div className="flex flex-col items-start w-[76px]">
              <span className="font-semibold text-[14px] leading-[20px] tracking-[-0.15px] text-black whitespace-nowrap">Moderate</span>
              <span className="text-[12px] leading-[16px] text-[#505153] whitespace-nowrap">City status</span>
            </div>
            <div className="w-px h-[37px] bg-[#e5e7eb]" />
            <div className="flex flex-col items-center w-[28px] relative">
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#fb2c36] rounded-full w-[8px] h-[8px]" />
              </div>
              <span className="text-[10px] leading-[12px] text-[#505153] text-center">Alerts</span>
            </div>
            <div className="w-px h-[37px] bg-[#e5e7eb]" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
              <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </div>
        </div>

        {/* Warning icon + title */}
        <div className="absolute left-[83px] top-[77px]">
          <TriangleAlert size={48} className="text-[#fb2c36]" strokeWidth={1.5} fill="#fb2c36" fillOpacity={0.15} />
        </div>
        <h1 className="absolute left-[144px] top-[88px] font-semibold text-[20px] leading-[28px] tracking-[-0.15px] text-[#101828]">
          Sea Level Early Warning
        </h1>

        {/* Content panels (absolute positioned to match Figma) */}
        <div className="relative" style={{ height: '980px' }}>
          <AlertOverviewCard />
          <StrategyCard />
          <DistrictRiskList />
          <BudgetCard />
          <AffectionsTable />
        </div>
      </div>
    </div>
  );
}
