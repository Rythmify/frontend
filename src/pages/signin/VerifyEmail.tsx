import { SiGmail, SiProtonmail } from "react-icons/si";
import { Mail } from "lucide-react";
import Airplane from "../../components/SigninComponents/airplane";

interface Props {
  email: string;
  onSendAgain: () => void;
  onBackToLogin: () => void;
}

function getEmailProvider(email: string): { label: string; icon: React.ReactNode; url: string } | null {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain.includes("gmail")) return { label: "Open Gmail", icon: <SiGmail className="text-[#EA4335]" />, url: "https://mail.google.com" };
  if (domain.includes("yahoo")) return { label: "Open Yahoo", icon: <Mail size={18} className="text-[#6001D2]" />, url: "https://mail.yahoo.com" };
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live"))
    return { label: "Open Outlook", icon: <Mail size={18} className="text-[#0078D4]" />, url: "https://outlook.live.com" };
  if (domain.includes("proton")) return { label: "Open Proton Mail", icon: <SiProtonmail className="text-[#6D4AFF]" />, url: "https://mail.proton.me" };
  return null;
}

export default function VerifyEmail({ email, onSendAgain, onBackToLogin }: Props) {
  const provider = getEmailProvider(email);

  return (
    <>
      <div className="text-center grid  gap-7">
        <h4 className="text-text-hover text-3xl">Check your inbox!</h4>
        <p className="text-text-hover text-md  font-semibold">
          Click on the link we sent to{" "}
          <span className="font-bold">{email}</span>
        </p>
        <p className="text-text-secondary text-sm">
          No email in your inbox or spam folder?{" "}
          <button onClick={onSendAgain} className="text-text-link hover:text-text-link-hover">
            Send again
          </button>
        </p>
      </div>

      {/* Illustration */}
      <div className="flex justify-center">
        <div className="w-90 h-45">
           <Airplane/>
        </div>
        
        
      </div>

      <div className="grid gap-4">
        {provider && (
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-text-hover text-bg text-md font-bold py-3 rounded-sm hover:bg-border transition-colors"
          >
            {provider.icon}
            {provider.label}
          </a>
        )}
        </div>
         <div className="grid gap-2">
        <p className="text-text-secondary text-sm text-center">
          Wrong address?{" "}
          <button onClick={onBackToLogin} className="text-text-link hover:text-text-link-hover">
            Back to login
          </button>
        </p>
        <p className="text-text-secondary text-sm text-center">
          If you still need help, visit our{" "}
          <a href="/help" className="text-text-link hover:text-text-link-hover">
            Help Center
          </a>
          .
        </p>
        </div>
    
    </>
  );
}
