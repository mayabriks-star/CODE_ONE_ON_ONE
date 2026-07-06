import { TrendingUp, Waves, Building2, Droplets, Radio, ArrowUp } from 'lucide-react';
import { cityOverview } from '../../mockData';

interface Props {
  vulnerableDistricts?: string;
  // When true, the panel reflects the live alert state instead of the
  // baseline "Moderate" overview - same data/copy established on the Alert
  // screen and the hazard-zone hover card, kept consistent rather than
  // inventing new alert language here.
  alert?: boolean;
}

export default function LiveMonitoringPanel({ vulnerableDistricts: vulnerableDistrictsProp, alert }: Props) {
  const status = alert ? 'Severe' : cityOverview.status;
  const statusColor = alert ? '#b91d1d' : '#ffae00';
  const description = alert
    ? 'Sea level has reached a level that requires preventive action.'
    : cityOverview.description;
  const seaLevel = alert ? '+46 mm' : cityOverview.seaLevel;
  const seaLevelPeriod = alert ? '(1h)' : cityOverview.seaLevelPeriod;

  return (
    <div className="absolute left-[21px] top-[119px] w-[326px] glass-65 glass-shadow rounded-[16px] py-[10px] flex flex-col gap-[11px]">
      {/* Live Monitoring header */}
      <div className="flex items-center justify-between px-[11px]">
        <div className="flex items-center gap-[12px]">
          <Radio size={16} className="text-[#1e2939]" strokeWidth={1.5} />
          <span className="font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">Live Monitoring</span>
        </div>
        <div className="flex items-center gap-[12px]">
          <div className="w-[8px] h-[8px] rounded-full bg-[#4aaf59] live-pulse" />
          <span className="font-medium text-[12px] leading-[28px] tracking-[-0.44px] text-[#505153]">Live</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[7px]" />

      {/* City Overview heading */}
      <span className="font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#1e2939] px-[11px]">
        City Overview
      </span>

      {/* City Overview container: status + description grouped */}
      <div className="flex flex-col gap-[3px] w-full px-[11px] py-[6px]">
        <div className="flex items-center gap-[15px]">
          <div className="w-[24px] h-[24px] rounded-full flex-shrink-0" style={{ background: statusColor }} />
          <div className="flex flex-col">
            <span className="font-medium text-[20px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">{status}</span>
            <span className="font-medium text-[14px] leading-[28px] tracking-[-0.44px] text-[#505153]">Overall risk level</span>
          </div>
        </div>
        <div className="flex gap-[15px] items-center">
          <div className="w-[24px] h-[14px] flex-shrink-0" />
          <p className="font-medium text-[16px] leading-[21px] tracking-[-0.44px] text-[#505153]">
            {description}
          </p>
        </div>
      </div>

      {/* Divider between status and metrics */}
      <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[7px]" />

      {/* Stats table */}
      <div className="mx-[15px] flex flex-col gap-[10px] py-[7px]">
        {/* Sea Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <TrendingUp size={16} className="text-[#505153]" strokeWidth={1.5} />
            <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px] text-[#505153]">Sea Level</span>
          </div>
          <div style={{ width: '155px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: '68px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              <ArrowUp size={9} className="text-[#d53c4b]" strokeWidth={2.5} />
              <span className="font-semibold text-[14px] leading-[21px] tracking-[-0.44px] text-black">{seaLevel}</span>
            </div>
            <div style={{ width: '87px', flexShrink: 0, textAlign: 'right' }}>
              <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px] text-[#505153]">{seaLevelPeriod}</span>
            </div>
          </div>
        </div>

        {/* Wave Activity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <Waves size={14} className="text-[#505153]" strokeWidth={1.5} />
            <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px] text-[#505153]">Wave Activity</span>
          </div>
          <div style={{ width: '155px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: '68px', flexShrink: 0, textAlign: 'right' }}>
              <span className="font-semibold text-[14px] leading-[21px] tracking-[-0.44px] text-black">{cityOverview.waveActivity}</span>
            </div>
            <div style={{ width: '87px', flexShrink: 0, textAlign: 'right' }}>
              <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px] text-[#505153]">{cityOverview.waveStatus}</span>
            </div>
          </div>
        </div>

        {/* Vulnerable Districts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[11px]">
            <Building2 size={16} className="text-[#505153]" strokeWidth={1.5} />
            <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px] text-[#505153]">Vulnerable Districts</span>
          </div>
          <div style={{ width: '155px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: '68px', flexShrink: 0, textAlign: 'right' }}>
              <span className="font-semibold text-[14px] leading-[21px] tracking-[-0.44px] text-black">{vulnerableDistrictsProp ?? cityOverview.vulnerableDistricts}</span>
            </div>
            <div style={{ width: '87px', flexShrink: 0, textAlign: 'right' }}>
              <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px] text-[#505153]">of {cityOverview.totalDistricts}</span>
            </div>
          </div>
        </div>

        {/* Tide */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[11px]">
            <Droplets size={16} className="text-[#505153]" strokeWidth={1.5} />
            <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px] text-[#505153]">Tide</span>
          </div>
          <div style={{ width: '155px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: '68px', flexShrink: 0, textAlign: 'right' }}>
              <span className="font-semibold text-[14px] leading-[21px] tracking-[-0.44px] text-black">{cityOverview.tideStatus}</span>
            </div>
            <div style={{ width: '87px', flexShrink: 0, textAlign: 'right' }}>
              <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px] text-[#505153]">{cityOverview.tideTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mx-[11px] mb-[2px]">
        <button
          className="w-full h-[37px] rounded-[14px] flex items-center justify-center"
          style={{ background: 'rgba(16,24,40,0.80)' }}
        >
          <span className="font-medium text-[14px] leading-[20px] tracking-[-0.15px] text-white">
            View full analysis
          </span>
        </button>
      </div>
    </div>
  );
}
