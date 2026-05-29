import type { LucideIcon } from 'lucide-react';
import { TriangleAlert, Car, Zap, Building2, Droplets, Users } from 'lucide-react';
import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';

interface MarkerProps {
  icon: LucideIcon;
  color: string;
  label: string;
  sub: string;
  left: number;
  top: number;
}

function MapMarker({ icon: Icon, color, label, sub, left, top }: MarkerProps) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left, top }}>
      <div className="flex items-center gap-[8px] bg-white rounded-full px-[12px] py-[8px] shadow-md">
        <div
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: color }}
        >
          <Icon size={16} className="text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-semibold text-[12px] leading-[16px] text-[#101828]">{label}</p>
          <p className="font-medium text-[10px] leading-[14px] text-[#505153]">{sub}</p>
        </div>
      </div>
      <div className="w-[1px] h-[16px] bg-white/70" />
      <div className="w-[6px] h-[6px] rounded-full bg-white/70" />
    </div>
  );
}

interface Props {
  onZoomOut: () => void;
}

export default function AlertPage({ onZoomOut }: Props) {
  return (
    <>
      <ScaledLayout className="screen-enter">
        {/* Page title */}
        <h1 className="absolute left-[21px] top-[80px] font-bold text-[40px] leading-[44px] text-[#101828]">
          Harbor District
        </h1>

        {/* Left alert panel */}
        <div className="absolute left-[21px] top-[140px] w-[310px] rounded-xl glass-65 glass-shadow">
          {/* Panel header */}
          <div className="flex items-center gap-[8px] px-[14px] pt-[14px] pb-[10px]">
            <TriangleAlert size={14} className="text-[#fb2c36]" strokeWidth={2} />
            <span className="font-semibold text-[12px] leading-[16px] text-[#1e2939]">
              Early Warning - Harbor District
            </span>
          </div>
          <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[10px]" />

          {/* Risk level */}
          <div className="flex items-center gap-[10px] px-[14px] pt-[12px]">
            <div className="w-[20px] h-[20px] rounded-full bg-[#ff6b00] flex-shrink-0" />
            <div>
              <span className="font-bold text-[24px] leading-[28px] text-[#101828]">High</span>
              <p className="font-medium text-[11px] leading-[16px] text-[#505153]">Overall risk level</p>
            </div>
          </div>

          {/* Description */}
          <p className="px-[14px] pt-[10px] pb-[12px] font-medium text-[11px] leading-[17px] text-[#505153]">
            Sea level has reached the city's early action threshold. This district now requires preventive review before coastal impact begins.
          </p>
          <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[10px]" />

          {/* Timeline */}
          <div className="px-[14px] py-[12px]">
            <span className="font-bold text-[13px] leading-[18px] text-[#101828]">18 - 24 months</span>
            <p className="font-medium text-[11px] leading-[16px] text-[#505153]">first signs without action</p>
          </div>
          <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[10px]" />

          {/* CTA */}
          <div className="px-[14px] py-[12px]">
            <button className="w-full h-[40px] rounded-lg bg-[#101828] flex items-center justify-center">
              <span className="font-medium text-[14px] text-white">Start Response Review →</span>
            </button>
          </div>
        </div>

        {/* Map markers */}
        <MapMarker icon={Car}      color="#f59e0b" label="Costal Road Access"      sub="Potential disruption"         left={668} top={148} />
        <MapMarker icon={Zap}      color="#eab308" label="Electric Utility Point"   sub="Changing the defense system"  left={940} top={358} />
        <MapMarker icon={Building2} color="#be123c" label="Residential Edge Blocks"  sub="Higher exposure"              left={468} top={480} />
        <MapMarker icon={Droplets} color="#2563eb" label="Drainage Pressure Point"  sub="Back-flow risk"               left={258} top={650} />
        <MapMarker icon={Users}    color="#16a34a" label="Vulnerable Residents"     sub="Support planning needed"      left={940} top={722} />
      </ScaledLayout>

      <HomePageHeader onMinus={onZoomOut} />
    </>
  );
}
