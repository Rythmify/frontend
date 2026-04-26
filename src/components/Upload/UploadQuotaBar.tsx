import { useEffect, useState } from "react";
import SmallCloudIcon from "../../pages/creator/upload/SmallCloudIcon";
import {
  getUploadQuota,
  type QuotaData,
} from "@/services/api/upload/quota.service";
import { useNavigate } from "react-router-dom";

interface Props {
  quota?: QuotaData;
}

const UploadQuotaBar = ({ quota: quotaProp }: Props) => {
  const [quota, setQuota] = useState<QuotaData | null>(quotaProp ?? null);
  const [loading, setLoading] = useState(!quotaProp);

  useEffect(() => {
    if (quotaProp !== undefined) {
      setQuota(quotaProp);
      setLoading(false);
      return;
    }
    getUploadQuota()
      .then(setQuota)
      .catch((err) => console.error("Failed to fetch quota:", err))
      .finally(() => setLoading(false));
  }, [quotaProp]);

  const isUnlimited = quota?.trackLimit === null;
  const percentage =
    !isUnlimited && quota
      ? Math.min((quota.usedTracks / quota.trackLimit!) * 100, 100)
      : 100;
  const displayPercentage = percentage.toFixed(2);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="container bg-bg-upload border border-transparent rounded-sm p-4 h-[60px] animate-pulse ]" />
    );
  }

  return (
    <div className="container bg-bg-upload border border-transparent rounded-sm p-4 flex items-center justify-between antialiased">
      {/* Cloud Icon + Text + Bar Section */}
      <div className="flex max-w-133 items-center gap-4 grow mr-8">
        {/* Photo/Icon */}
        <SmallCloudIcon className="text-text-upload shrink-0" size={24} />

        {/* Text */}
        <span className="text-sm font-bold text-text-upload whitespace-nowrap">
          {isUnlimited
            ? "Unlimited uploads"
            : `${displayPercentage}% of uploads used`}
        </span>

        {/*Progress bar*/}
        <div className="relative h-1.5 grow border-border bg-[#424242] overflow-hidden min-w-25">
          <div
            className="absolute top-0 left-0 h-full bg-[#388E3C] transition-all duration-700 ease-out"
            style={{ width: isUnlimited ? "100%" : `${displayPercentage}%` }}
          />
        </div>

        {/*Track Count */}
        <span className="text-sm font-[500] text-text-upload whitespace-nowrap">
          {isUnlimited
            ? `${quota?.usedTracks ?? 0} tracks uploaded`
            : `${quota?.usedTracks ?? 0} of ${quota?.trackLimit} tracks`}
        </span>
      </div>

      {/*Button*/}
      {!isUnlimited && (
        <button
          data-test="get-unlimited-uploads-button-quota-bar"
          type="button"
          onClick={() => navigate("/premium")}
          className="shrink-0 flex items-center justify-center bg-bg py-2.5 px-6
            outline-[#383838] outline-[0.2px] light:hover:bg-[#e8e8e8] hover:bg-[#353535] text-text-upload text-sm font-bold
            outline-offset-[-1.5px] rounded-full transition-all whitespace-nowrap cursor-pointer"
        >
          Get unlimited uploads
        </button>
      )}
    </div>
  );
};

export default UploadQuotaBar;
