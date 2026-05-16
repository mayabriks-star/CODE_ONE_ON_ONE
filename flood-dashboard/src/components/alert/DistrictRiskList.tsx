import { districts } from '../../mockData';

const colorMap = {
  red: {
    bg: '#fef2f2',
    border: '#d53c4b',
    badge: '#d53c4b',
    rowBg: '#d53c4b',
  },
  orange: {
    bg: '#fff7ed',
    border: '#ff6900',
    badge: '#f54900',
    rowBg: '#f54900',
  },
  blue: {
    bg: '#eff6ff',
    border: '#519bd3',
    badge: '#519bd3',
    rowBg: '#519bd3',
  },
};

export default function DistrictRiskList() {
  return (
    <div
      className="absolute right-[21px] top-[153px] w-[531px] h-[446px] rounded-md flex flex-col"
      style={{ background: 'white', border: '1px solid #e5e7eb' }}
    >
      {/* Header */}
      <div className="px-[24px] pt-[16px] pb-[12px] border-b border-[#e5e7eb]">
        <span className="font-bold text-[20px] leading-[30px] tracking-[-0.45px] text-[#101828]">
          Districts Requiring Review
        </span>
      </div>

      {/* District rows */}
      <div className="flex flex-col gap-[14px] px-[16px] pt-[16px] flex-1">
        {districts.map((d) => {
          const c = colorMap[d.color];
          return (
            <div
              key={d.name}
              className="h-[62px] rounded-sm pl-[20px] pr-[16px] flex flex-col justify-center gap-[4px]"
              style={{ background: c.bg, borderLeft: `4px solid ${c.border}` }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[16px] leading-[24px] tracking-[-0.31px] text-[#101828]">
                  {d.name}
                </span>
                <span
                  className="text-[12px] leading-[16px] text-white px-[8px] py-[4px] rounded-full"
                  style={{ background: c.badge }}
                >
                  {d.risk}
                </span>
              </div>
              <span className="text-[12px] leading-[16px] text-[#4a5565]">{d.note}</span>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-[24px] pt-[13px] pb-[12px] border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-md">
        <p className="italic text-[12px] leading-[16px] text-[#4a5565]">
          Risk starts at the coastline and gradually decreases inland.
        </p>
      </div>
    </div>
  );
}
