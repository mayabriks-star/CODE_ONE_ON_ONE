import { districts } from '../../mockData';

const colorMap = {
  red: {
    bg: '#fef2f2',
    border: '#d53c4b',
    badge: '#d53c4b',
  },
  orange: {
    bg: '#fff7ed',
    border: '#ff6900',
    badge: '#f54900',
  },
  blue: {
    bg: '#eff6ff',
    border: '#519bd3',
    badge: '#519bd3',
  },
};

export default function DistrictRiskList() {
  return (
    <div
      className="absolute right-[21px] top-[153px] w-[531px] h-[446px] bg-white border border-[#e5e7eb] rounded-[14px] flex flex-col gap-[22px] p-px overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col h-[63px] items-start pb-px pt-[16px] px-[24px] border-b border-[#e5e7eb] shrink-0 w-full">
        <span className="font-bold text-[20px] leading-[30px] tracking-[-0.45px] text-[#101828] whitespace-nowrap">
          Districts Requiring Review
        </span>
      </div>

      {/* District rows */}
      <div className="flex flex-col gap-[14px] h-[298px] items-start pt-[16px] px-[16px] shrink-0 w-full">
        {districts.map((d) => {
          const c = colorMap[d.color];
          return (
            <div
              key={d.name}
              className="h-[62px] rounded-[10px] pl-[20px] pr-[16px] flex flex-col items-start shrink-0 w-full"
              style={{ background: c.bg, borderLeft: `4px solid ${c.border}` }}
            >
              <div className="flex flex-col gap-[4px] items-start pt-[9px] w-full">
                <div className="flex h-[24px] items-center justify-between w-full">
                  <span className="font-semibold text-[16px] leading-[24px] tracking-[-0.31px] text-[#101828] whitespace-nowrap">
                    {d.name}
                  </span>
                  <span
                    className="h-[24px] flex items-center px-[8px] py-[4px] rounded-full text-[12px] leading-[16px] text-white whitespace-nowrap"
                    style={{ background: c.badge }}
                  >
                    {d.risk}
                  </span>
                </div>
                <div className="flex h-[16px] items-start w-full">
                  <span className="text-[12px] leading-[16px] text-[#4a5565]">{d.note}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-[#f9fafb] border-t border-[#e5e7eb] flex flex-col h-[39px] items-start pt-[13px] px-[24px] rounded-bl-[13px] rounded-br-[13px] shrink-0 w-full">
        <p className="italic text-[12px] leading-[16px] text-[#4a5565]">
          Risk starts at the coastline and gradually decreases inland.
        </p>
      </div>
    </div>
  );
}
