import { TriangleAlert } from 'lucide-react';
import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';

interface MarkerProps {
  iconSrc: string;
  label: string;
  sub: string;
  left: number;
  top: number;
  delay: number;
}

function MapMarker({ iconSrc, label, sub, left, top, delay }: MarkerProps) {
  return (
    <div style={{ position: 'absolute', left, top }}>
      {/* Tab — reveals left to right */}
      <div
        className="inline-flex items-center bg-white shadow-md"
        style={{
          height: '45px',
          borderRadius: '9999px',
          paddingLeft: '5px',
          paddingRight: '16px',
          animation: `alertTabReveal 0.35s cubic-bezier(0.4,0,0.2,1) both`,
          animationDelay: `${delay + 0.5}s`,
        }}
      >
        <img src={iconSrc} alt="" width={35} height={35} style={{ flexShrink: 0 }} />
        <div style={{ marginLeft: '27px' }}>
          <p className="font-semibold text-[14px] leading-[18px] text-[#101828]">{label}</p>
          <p className="font-medium text-[12px] leading-[16px] text-[#505153]">{sub}</p>
        </div>
      </div>
      {/* Connector line — grows upward from dot, at icon right edge (32px from tab left) */}
      <div
        style={{
          position: 'absolute',
          left: 32,
          top: 45,
          width: 1,
          height: 33,
          background: 'rgba(255,255,255,0.7)',
          animation: `alertLineGrow 0.3s ease both`,
          animationDelay: `${delay + 0.2}s`,
          transformOrigin: 'bottom center',
        }}
      />
      {/* Dot — appears first, centered on the line */}
      <div
        style={{
          position: 'absolute',
          left: 29,
          top: 78,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.7)',
          animation: `alertDotAppear 0.2s ease both`,
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  );
}

interface Props {
  onZoomOut: () => void;
  onPlan: () => void;
}

export default function AlertPage({ onZoomOut, onPlan }: Props) {
  return (
    <>
      <style>{`
        @keyframes alertDotAppear {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes alertLineGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes alertTabReveal {
          from { clip-path: inset(0 100% 0 0); opacity: 0; }
          to   { clip-path: inset(0 0% 0 0);   opacity: 1; }
        }
      `}</style>
      <ScaledLayout className="screen-enter">
        <h1 className="absolute left-[21px] top-[80px] font-bold text-[30px] leading-[36px] text-white">
          Harbor District
        </h1>

        <div
          className="absolute flex flex-col justify-center items-center glass-80 glass-shadow"
          style={{ left: '21px', top: '140px', width: '326px', height: '325px', padding: '10px 0', gap: '11px', borderRadius: '16px' }}
        >
          <div className="flex items-center gap-[8px] w-full px-[14px]">
            <TriangleAlert size={24} className="text-[#1e2939]" strokeWidth={2} />
            <span className="font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">
              Early Warning - Harbor District
            </span>
          </div>

          <div className="w-full h-px bg-[rgba(0,0,0,0.08)]" />

          <div className="flex flex-col gap-[3px] w-full px-[14px] py-[6px]">
            <div className="flex gap-[15px] items-start">
              <div className="w-[24px] h-[24px] rounded-full bg-[#ff6b00] flex-shrink-0" />
              <div>
                <p className="font-medium text-[20px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">High</p>
                <p className="font-medium text-[13px] leading-[28px] tracking-[-0.44px] text-[#505153]">Overall risk level</p>
              </div>
            </div>
            <div className="flex gap-[14px] items-center">
              <div className="w-[24px] h-[14px] flex-shrink-0" />
              <p className="font-medium text-[13px] leading-[21px] tracking-[-0.44px] text-[#505153]">
                Sea level has reached the city's early action threshold. This district now requires preventive review before coastal impact begins.
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-[rgba(0,0,0,0.08)]" />

          <div className="w-full pl-[52px] pr-[14px]">
            <span className="font-bold text-[12px] leading-[21px] text-[#101828]">12 - 20 months</span>
            <p className="font-medium text-[13px] leading-[21px] text-[#505153]">first signs without action</p>
          </div>

          <div className="w-full px-[14px]">
            <button onClick={onPlan} className="w-full h-[37px] rounded-[14px] bg-[rgba(16,24,40,0.9)] flex items-center justify-center">
              <span className="font-medium text-[14px] text-white">Start Response Plan →</span>
            </button>
          </div>
        </div>

        <MapMarker iconSrc="/icons/costal-road-access.svg"     label="Costal Road Access"      sub="Potential disruption"        left={713}  top={172} delay={0}    />
        <MapMarker iconSrc="/icons/electric-utility-point.svg"  label="Electric Utility Point"   sub="Changing the defense system" left={888}  top={392} delay={0.15} />
        <MapMarker iconSrc="/icons/residential-edge-blocks.svg" label="Residential Edge Blocks"  sub="Higher exposure"             left={429}  top={527} delay={0.3}  />
        <MapMarker iconSrc="/icons/increase-pump-capacity.svg"  label="Increase pump capacity"   sub="Back-flow risk"              left={310}  top={718} delay={0.45} />
        <MapMarker iconSrc="/icons/vulnerable-residents.svg"    label="Vulnerable Residents"     sub="Support planning needed"     left={1066} top={814} delay={0.6}  />
      </ScaledLayout>

      <HomePageHeader onMinus={onZoomOut} />
    </>
  );
}
