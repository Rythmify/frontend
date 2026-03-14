interface CloudUploadIconProps {
  className?: string;
  size?: number | string;
}

const SmallCloudIcon = ({ className = "", size = 24 }: CloudUploadIconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    <g 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="1.5"
    >
      <path d="M9 19.5H6.75a5.25 5.25 0 1 1 1.3-10.34" />
      <path d="M7.5 12A7.5 7.5 0 1 1 21 16.5" />
      <path d="M11.07 15.18 14.25 12l3.18 3.18m-3.18 4.32V12" />
    </g>
  </svg>
);

export default SmallCloudIcon;