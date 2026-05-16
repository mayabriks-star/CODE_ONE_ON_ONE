import { TrendingUp, Waves, Building2, Droplets, Radio } from 'lucide-react';
import { cityOverview } from '../../mockData';

export default function LiveMonitoringPanel() {
  return (
    <div className="absolute left-[21px] top-[119px] w-[326px] glass-65 glass-shadow rounded-lg py-[10px] flex flex-col gap-[21px]">
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

      {/* Status sub-card */}
      <div className="mx-[11px] glass-40 rounded-lg h-[139px] px-[13px] flex flex-col gap-[3px] justify-center">
        <div className="flex items-center gap-[15px]">
          <div className="w-[24px] h-[24px] rounded-full bg-[#ffae00] flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-[20px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">Moderate</span>
            <span className="font-medium text-[12px] leading-[28px] tracking-[-0.44px] text-[#505153]">Overall risk level</span>
          </div>
        </div>
        <p className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]">
          {cityOverview.description}
        </p>
      </div>

      {/* Stats table */}
      <div className="mx-[15px] flex flex-col gap-[10px] py-[7px]" style={{ filter: 'drop-shadow(0px -3px 8.1px rgba(0,0,0,0.03))' }}>
        {/* Sea Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <TrendingUp size={16} className="text-[#505153]" strokeWidth={1.5} />
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]">Sea Level</span>
          </div>
          <div className="flex items-center" style={{ width: '155px', justifyContent: 'flex-end' }}>
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-black" style={{ minWidth: '58px', textAlign: 'right' }}>{cityOverview.seaLevel}</span>
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]" style={{ minWidth: '90px', textAlign: 'right', paddingLeft: '7px' }}>{cityOverview.seaLevelPeriod}</span>
          </div>
        </div>

        {/* Wave Activity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <Waves size={14} className="text-[#505153]" strokeWidth={1.5} />
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]">Wave Activity</span>
          </div>
          <div className="flex items-center" style={{ width: '155px', justifyContent: 'flex-end' }}>
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-black" style={{ minWidth: '58px', textAlign: 'right' }}>{cityOverview.waveActivity}</span>
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]" style={{ minWidth: '90px', textAlign: 'right', paddingLeft: '7px' }}>{cityOverview.waveStatus}</span>
          </div>
        </div>

        {/* Vulnerable Districts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[11px]">
            <Building2 size={16} className="text-[#505153]" strokeWidth={1.5} />
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]">Vulnerable Districts</span>
          </div>
          <div className="flex items-center" style={{ width: '155px', justifyContent: 'flex-end' }}>
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-black" style={{ minWidth: '58px', textAlign: 'right' }}>{cityOverview.vulnerableDistricts}</span>
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]" style={{ minWidth: '90px', textAlign: 'right', paddingLeft: '7px' }}>of {cityOverview.totalDistricts}</span>
          </div>
        </div>

        {/* Tide */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[11px]">
            <Droplets size={16} className="text-[#505153]" strokeWidth={1.5} />
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]">Tide</span>
          </div>
          <div className="flex items-center" style={{ width: '155px', justifyContent: 'flex-end' }}>
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-black" style={{ minWidth: '58px', textAlign: 'right' }}>{cityOverview.tideStatus}</span>
            <span className="font-medium text-[12px] leading-[21px] tracking-[-0.44px] text-[#505153]" style={{ minWidth: '90px', textAlign: 'right', paddingLeft: '7px' }}>{cityOverview.tideTime}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mx-[11px] mb-[2px]">
        <button
          className="w-full h-[37px] rounded-md flex items-center justify-center"
          style={{ background: 'rgba(16,24,40,0.80)' }}
        >
          <span className="font-medium text-[14px] leading-[20px] tracking-[-0.15px] text-white">
            View full analysis →
          </span>
        </button>
      </div>
    </div>
  );
}
