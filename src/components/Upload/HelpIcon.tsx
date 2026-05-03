import { Tooltip } from "@heroui/react";
import React from "react";

interface HelpIconProps {
  title: string;
  content: string;
}

const HelpIcon = ({ title, content }: HelpIconProps) => {
  return (
    <Tooltip
      showArrow={true}
      placement="top"
      offset={10}
      classNames={{
        base: ["before:bg-[#333]"],
        content: [
          "py-3 px-4 shadow-xl",
          "text-text-upload bg-bg border border-[#333] rounded-sm max-w-[280px]",
        ],
      }}
      content={
        <div className="space-y-1">
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs text-text-upload leading-relaxed">{content}</p>
        </div>
      }
    >
      <span className="inline-flex items-center">
        <svg
          width={16}
          height={16}
          className="inline-block ml-1 hover:opacity-60 transition-opacity cursor-pointer"
          fill="none"
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 15.75a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5Z"
          ></path>
          <path
            fill="currentColor"
            d="M9 13.36a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4Z"
          ></path>
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 10.13v-.57A1.97 1.97 0 1 0 7.03 7.6"
          ></path>
        </svg>
      </span>
    </Tooltip>
  );
};

export default HelpIcon;
