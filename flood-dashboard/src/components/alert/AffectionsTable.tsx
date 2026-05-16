import { Building2, Users } from 'lucide-react';
import { affectionsInfrastructure, affectionsPopulation } from '../../mockData';

interface RowItem {
  name: string;
  detail: string;
}

function Column({ icon: Icon, title, items }: { icon: typeof Building2; title: string; items: RowItem[] }) {
  return (
    <div className="flex flex-col gap-[12px] w-[375px]">
      <div className="flex items-center gap-[8px] h-[20px]">
        <Icon size={16} className="text-[#101828]" strokeWidth={1.5} />
        <span className="font-semibold text-[14px] leading-[20px] tracking-[-0.15px] text-[#101828]">{title}</span>
      </div>
      <div className="flex flex-col gap-[8px]">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between h-[20px]">
            <div className="flex items-center gap-[8px]">
              <div className="w-[4px] h-[4px] rounded-full bg-[#99a1af] flex-shrink-0" />
              <span className="text-[14px] leading-[20px] tracking-[-0.15px] text-[#364153]">{item.name}</span>
            </div>
            <span className="text-[12px] leading-[16px] text-[#6a7282] whitespace-nowrap">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AffectionsTable() {
  return (
    <div
      className="absolute rounded-md flex flex-col"
      style={{ left: '86px', top: '690px', width: '816px', height: '255px', background: 'white', border: '1px solid #e5e7eb' }}
    >
      {/* Header */}
      <div className="px-[20px] pt-[12px] pb-px border-b border-[#e5e7eb] h-[49px]">
        <span className="font-bold text-[16px] leading-[24px] tracking-[-0.31px] text-[#101828]">Affections</span>
      </div>

      {/* Body */}
      <div className="px-[20px] pt-[20px]">
        <div className="flex gap-[24px]">
          <Column icon={Building2} title="Infrastructure" items={affectionsInfrastructure} />
          <Column icon={Users} title="Population" items={affectionsPopulation} />
        </div>
      </div>
    </div>
  );
}
