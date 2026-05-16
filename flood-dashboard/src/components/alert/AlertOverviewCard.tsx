import { alertOverview } from '../../mockData';

export default function AlertOverviewCard() {
  return (
    <div
      className="absolute left-[86px] top-[153px] w-[813px] h-[144px] rounded-lg px-[25px] py-[6px] flex flex-col gap-[8px] justify-center"
      style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
    >
      <span className="font-bold text-[18px] leading-[28px] tracking-[-0.44px] text-[#101828]">Alert Overview</span>
      <div className="flex items-start gap-0 relative h-[85px]">
        {/* Sea Level Rise */}
        <div className="absolute left-0 flex flex-col gap-[5px] w-[238px]">
          <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#4a5565]">Sea Level Rise</span>
          <div className="flex items-baseline gap-[4px]">
            <span className="font-bold text-[25px] leading-[40px] tracking-[0.37px] text-[#519bd3]">{alertOverview.seaLevelRise}</span>
            <span className="text-[18px] leading-[28px] tracking-[-0.44px] text-[#6a7282]">m</span>
          </div>
          <span className="text-[14px] leading-[16px] text-[#6a7282]">above baseline</span>
        </div>

        {/* First Expected Impact */}
        <div className="absolute left-[262px] flex flex-col gap-[4px] w-[238px]">
          <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#4a5565]">First Expected Impact</span>
          <div className="flex items-baseline gap-[4px]">
            <span className="font-bold text-[25px] leading-[40px] tracking-[0.37px] text-[#d53c4b]">{alertOverview.firstImpact}</span>
            <span className="text-[18px] leading-[28px] tracking-[-0.44px] text-[#6a7282]">mo</span>
          </div>
          <span className="text-[14px] leading-[16px] text-[#6a7282]">without intervention</span>
        </div>

        {/* With Action */}
        <div className="absolute left-[524px] flex flex-col gap-[4px] w-[238px]">
          <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#4a5565]">With Action</span>
          <div className="flex items-baseline gap-[4px]">
            <span className="font-bold text-[25px] leading-[40px] tracking-[0.37px] text-[#00a63e]">{alertOverview.withAction}</span>
            <span className="text-[18px] leading-[28px] tracking-[-0.44px] text-[#6a7282]">yrs</span>
          </div>
          <span className="text-[14px] leading-[16px] text-[#6a7282]">impact delayed</span>
        </div>
      </div>
    </div>
  );
}
