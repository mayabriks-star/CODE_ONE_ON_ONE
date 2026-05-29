export default function FloodDepthScale({ positionClassName }: { positionClassName?: string }) {
  const position = positionClassName ?? 'absolute left-[21px] top-[25px]';
  return (
    <div className={`${position} w-[326px] h-[65px] glass-30 glass-shadow-sm rounded-lg px-[9px] py-[4px] flex flex-col gap-[4px]`}>
      <span className="font-semibold text-[12px] leading-[16px] text-black">Flood Depth Scale</span>
      <div className="flood-gradient h-[12px] rounded-[4px] w-full" />
      <div className="flex justify-between pr-[1px]">
        <span className="text-[12px] leading-[16px] text-[#505153]">0m</span>
        <span className="text-[12px] leading-[16px] text-[#505153]">2m</span>
        <span className="text-[12px] leading-[16px] text-[#505153]">5m+</span>
      </div>
    </div>
  );
}
