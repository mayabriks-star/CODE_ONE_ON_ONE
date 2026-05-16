const years = ['Today', '2030', '2050', '2070', '2090'];

export default function TimeView() {
  return (
    <div className="absolute left-[20px] top-[754px] w-[317px] flex flex-col gap-[5px]">
      <span className="text-white text-[18px] font-medium leading-[22px]">Time View</span>
      <div className="relative">
        <div className="flex items-center gap-[28px]">
          {years.map((y, i) => (
            <span
              key={y}
              className={`text-[16px] leading-[20px] ${
                i === 0 ? 'text-white font-semibold' : 'text-[rgba(255,255,255,0.8)]'
              }`}
            >
              {y}
            </span>
          ))}
        </div>
        <div className="relative mt-[6px] h-[14px] flex items-center">
          <div className="absolute inset-x-0 h-[2px] bg-[rgba(255,255,255,0.4)] rounded-full" />
          <div className="absolute left-0 w-[8px] h-[8px] rounded-full bg-[#ffae00] -translate-x-1/2 mt-[1px]" />
        </div>
      </div>
    </div>
  );
}
