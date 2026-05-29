import { TriangleAlert } from 'lucide-react';
import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';

interface MarkerProps {
  iconSrc: string;
  label: string;
  sub: string;
  left: number;
  top: number;
}

function MapMarker({ iconSrc, label, sub, left, top }: MarkerProps) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left, top }}>
      <div
        className="flex items-center bg-white shadow-md"
        style={{ height: '45px', borderRadius: '9999px', paddingLeft: '5px', paddingRight: '16px' }}
      >
        <img src={iconSrc} alt="" width={35} height={35} style={{ flexShrink: 0 }} />
        <div style={{ marginLeft: '27px' }}>
          <p className="font-semibold text-[14px] leading-[18px] text-[#101828]">{label}</p>
          <p className="font-medium text-[12px] leading-[16px] text-[#505153]">{sub}</p>
        </div>
      </div>
      <div className="w-[1px] h-[20px] bg-white/70" />
      <div className="w-[8px] h-[8px] rounded-full bg-white/70" />
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
        <h1 className="absolute left-[21px] top-[80px] font-bold text-[30px] leading-[36px] text-white">
          Harbor District
        </h1>

        <div
          className="absolute flex flex-col justify-center items-center glass-80 glass-shadow"
          style={{ left: '21px', top: '140px', width: '326px', height: '325px', padding: '10px 0', gap: '11px', borderRadius: '16px' }}
        >
          <div className="flex items-center gap-[8px] w-full px-[14px]">
            <TriangleAlert size={18} className="text-[#1e2939]" strokeWidth={2} />
            <span className="font-bold text-[14px] leading-[18px] text-[#1e2939]">
              Early Warning - Harbor District
            </span>
          </div>

          <div className="w-full h-px bg-[rgba(0,0,0,0.08)]" />

          <div className="flex items-center gap-[10px] w-full px-[14px]">
            <div className="w-[32px] h-[32px] rounded-full bg-[#ff6b00] flex-shrink-0" />
            <div>
              <span className="font-bold text-[32px] leading-[36px] text-[#101828]">High</span>
              <p className="font-medium text-[11px] leading-[16px] text-[#505153]">Overall risk level</p>
            </div>
          </div>

          <p className="font-medium text-[11px] leading-[17px] text-[#505153] w-full px-[14px]">
            Sea level has reached the city's early action threshold. This district now requires preventive review before coastal impact begins.
          </p>

          <div className="w-full h-px bg-[rgba(0,0,0,0.08)]" />

          <div className="w-full px-[14px]">
            <span className="font-bold text-[13px] leading-[18px] text-[#101828]">12 - 20 months</span>
            <p className="font-medium text-[11px] leading-[16px] text-[#505153]">first signs without action</p>
          </div>

          <div className="w-full px-[14px]">
            <button className="w-full h-[44px] rounded-[20px] bg-[#101828] flex items-center justify-center">
              <span className="font-medium text-[14px] text-white">Start Response Plan →</span>
            </button>
          </div>
        </div>

        <MapMarker iconSrc="/icons/costal-road-access.svg"     label="Costal Road Access"      sub="Potential disruption"        left={668} top={148} />
        <MapMarker iconSrc="/icons/electric-utility-point.svg"  label="Electric Utility Point"   sub="Changing the defense system" left={940} top={358} />
        <MapMarker iconSrc="/icons/residential-edge-blocks.svg" label="Residential Edge Blocks"  sub="Higher exposure"             left={468} top={480} />
        <MapMarker iconSrc="/icons/increase-pump-capacity.svg"  label="Increase pump capacity"   sub="Back-flow risk"              left={258} top={650} />
        <MapMarker iconSrc="/icons/vulnerable-residents.svg"    label="Vulnerable Residents"     sub="Support planning needed"     left={940} top={722} />
      </ScaledLayout>

      <HomePageHeader onMinus={onZoomOut} />
    </>
  );
}
