 const ABUSE_URL = "https://help.soundcloud.com/hc/en-us/articles/115003566048-Reporting-abuse-or-harassment"
const IMPERSONATION_URL = "https://help.soundcloud.com/hc/en-us/articles/115003564108-Reporting-impersonation"
const TRADEMARK_URL = "https://help.soundcloud.com/hc/en-us/articles/115003445387-Reporting-trademark-infringement"
const OTHER_URL = "https://help.soundcloud.com/hc/en-us/articles/115003569668-Reporting-on-SoundCloud"
 export const handleExternalAbuse = () => {
    window.open(ABUSE_URL, "_blank", "noopener,noreferrer")
  }
 export const handleExternalImpersonation = () => {
    window.open(IMPERSONATION_URL, "_blank", "noopener,noreferrer")
  }
  export const handleExternalTrademark = () => {
    window.open(TRADEMARK_URL, "_blank", "noopener,noreferrer")
  }
  export const handleExternalOther = () => {
    window.open(OTHER_URL, "_blank", "noopener,noreferrer")
  }