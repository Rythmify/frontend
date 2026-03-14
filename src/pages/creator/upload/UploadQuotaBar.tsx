import SmallCloudIcon from "./SmallCloudIcon";

const UploadQuotaBar = ({ usedMinutes = 80, totalMinutes = 120 }) => {
  const percentage = totalMinutes > 0 ? (usedMinutes / totalMinutes) * 100 : 0;
  const displayPercentage = percentage.toFixed(2);

  return (
    <div className="w-full bg-bg-upload border border-transparent rounded-[4px] p-4 flex items-center justify-between antialiased">
      
      {/* Cloud Icon + Text + Bar Section */}
      <div className="flex max-w-[532px] items-center gap-4 grow mr-8">
        
        {/* Photo/Icon */}
        <SmallCloudIcon className="text-text-upload shrink-0" size={24} />

        {/* Text */}
        <span className="text-sm font-bold text-text-upload whitespace-nowrap">
          {displayPercentage}% of uploads used
        </span>

        {/*Progress bar*/}
        <div className="relative h-1.5 grow border-border bg-[#424242] overflow-hidden min-w-[100px]">
          <div 
            className="absolute top-0 left-0 h-full bg-[#388E3C] transition-all duration-700 ease-out"
            style={{ width: `${displayPercentage}%` }}
          />
        </div>

        {/* Minutes */}
        <span className="text-sm font-bold text-text-upload whitespace-nowrap">
          {usedMinutes} of {totalMinutes} minutes
        </span>
      </div>

      {/*Button*/}
      <button 
        type="button"
        className="
            shrink-0 flex items-center justify-center bg-bg py-2.5 px-6
            outline-[#383838] outline-[0.2px] hover:bg-white/[0.05] text-white text-sm font-bold
            outline-offset-[-1.5px] rounded-full transition-all whitespace-nowrap cursor-pointer
            
        ">
        Get unlimited uploads
        </button>

    </div>
  );
};

export default UploadQuotaBar;