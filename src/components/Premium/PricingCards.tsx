import React from "react";
import { Link } from "react-router-dom";

const UploadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M13.883 4.25c-1.848 0-3.444 1.026-4.451 2.541a4.046 4.046 0 0 0-1.116-.157c-1.81 0-3.306 1.182-4.064 2.805-1.777.118-3.002 1.824-3.002 3.652 0 1.895 1.317 3.659 3.2 3.659H7v-1.5H4.45c-.824 0-1.7-.84-1.7-2.159 0-1.318.876-2.159 1.7-2.159.064 0 .128.005.19.014a.75.75 0 0 0 .815-.493c.505-1.43 1.645-2.319 2.86-2.319.393 0 .769.09 1.118.256a.75.75 0 0 0 .985-.326c.76-1.437 2.058-2.314 3.465-2.314 1.81 0 3.464 1.472 3.97 3.68a.75.75 0 0 0 .9.564c.125-.029.253-.044.384-.044 1.051 0 2.113 1.06 2.113 2.65 0 1.59-1.062 2.65-2.113 2.65H19v1.5h.137c2.111 0 3.613-1.984 3.613-4.15 0-2.166-1.502-4.15-3.613-4.15h-.003c-.788-2.392-2.785-4.2-5.25-4.2Z"
    ></path>
    <path
      fill="currentColor"
      d="M13.75 12.81V19h-1.5v-6.19l-1.72 1.72-1.06-1.06 3-3a.75.75 0 0 1 1.06 0l3 3-1.06 1.06-1.72-1.72Z"
    ></path>
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M13 3H11V12.17L8.41 9.58L7 11L12 16L17 11L15.59 9.58L13 12.17V3Z"
      fill="currentColor"
    />
    <path d="M5 19H19V21H5V19Z" fill="currentColor" />
  </svg>
);

const ProBadgeIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9.50386 0.55107C8.64601 -0.183691 7.35399 -0.18369 6.49615 0.551072L6.4558 0.585631C5.98395 0.989776 5.35867 1.18572 4.73063 1.12625L4.67693 1.12116C3.53512 1.01303 2.48985 1.74548 2.24364 2.82622L2.23206 2.87705C2.09663 3.4715 1.71019 3.98449 1.16585 4.29241L1.1193 4.31874C0.129663 4.87854 -0.269594 6.06366 0.189869 7.07757L0.211479 7.12526C0.464201 7.68295 0.464201 8.31705 0.211479 8.87474L0.189869 8.92243C-0.269594 9.93634 0.129663 11.1215 1.1193 11.6813L1.16585 11.7076C1.71019 12.0155 2.09663 12.5285 2.23206 13.123L2.24364 13.1738C2.48985 14.2545 3.53512 14.987 4.67693 14.8788L4.73063 14.8738C5.35867 14.8143 5.98395 15.0102 6.4558 15.4144L6.49615 15.4489C7.35399 16.1837 8.64601 16.1837 9.50386 15.4489L9.54421 15.4144C10.0161 15.0102 10.6413 14.8143 11.2694 14.8738L11.3231 14.8788C12.4649 14.987 13.5101 14.2545 13.7564 13.1738L13.7679 13.1229C13.9034 12.5285 14.2898 12.0155 14.8342 11.7076L14.8807 11.6813C15.8703 11.1215 16.2696 9.93634 15.8101 8.92243L15.7885 8.87474C15.5358 8.31705 15.5358 7.68295 15.7885 7.12526L15.8101 7.07757C16.2696 6.06366 15.8703 4.87854 14.8807 4.31874L14.8342 4.29241C14.2898 3.98449 13.9034 3.4715 13.7679 2.87705L13.7564 2.82622C13.5101 1.74548 12.4649 1.01303 11.3231 1.12116L11.2694 1.12625C10.6413 1.18572 10.016 0.989776 9.5442 0.585631L9.50386 0.55107ZM12.4016 6.50673C12.5101 6.59463 12.5905 6.7145 12.6322 6.85062C12.6755 6.98851 12.6781 7.13671 12.6395 7.27611C12.6009 7.41551 12.5229 7.53972 12.4156 7.63272L10.5327 9.25741L11.1284 11.7679C11.1558 11.8731 11.1595 11.9835 11.1394 12.0905C11.1192 12.1974 11.0757 12.2982 11.0121 12.385C10.9486 12.4718 10.8667 12.5423 10.7727 12.5911C10.6788 12.64 10.5753 12.6658 10.4702 12.6667C10.3415 12.6661 10.2157 12.6271 10.1078 12.5543L8.00417 11.1759H7.99584L6.04215 12.4593C5.91594 12.5419 5.76885 12.5835 5.61969 12.5789C5.47053 12.5743 5.32609 12.5236 5.20486 12.4333C5.07996 12.3388 4.98536 12.2075 4.93336 12.0564C4.88136 11.9054 4.87436 11.7416 4.91326 11.5864L5.47562 9.29198L3.58443 7.63272C3.47713 7.53972 3.39915 7.41551 3.36054 7.27611C3.32193 7.13671 3.32447 6.98851 3.36781 6.85062C3.41002 6.71481 3.49055 6.59526 3.59898 6.50744C3.7074 6.41962 3.83874 6.36757 3.976 6.35802L6.43372 6.19383L7.36682 3.78272C7.41687 3.65067 7.50397 3.53724 7.61686 3.45712C7.72974 3.377 7.86322 3.33388 8 3.33333C8.13678 3.33388 8.27026 3.377 8.38315 3.45712C8.49603 3.53724 8.58314 3.65067 8.63318 3.78272L9.54962 6.18086L12.024 6.35802C12.1614 6.36699 12.293 6.41882 12.4016 6.50673Z"
      fill="#CFB25D"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

const plan = {
  name: "Premium",
  subtitle: "Tailored access to essential artist tools",
  price: "EGP 29.99",
  priceNote: "/ month, billed yearly for EGP 359.88",
  cta: "Get started",
  features: [
    { icon: <UploadIcon />, label: "Unlimited uploads" },
    { icon: <DownloadIcon />, label: "Offline listening downloads" },
  ],
};

function PlanCard() {
  return (
    <div className="w-full max-w-3xl rounded-[28px] border-2 border-black bg-white p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="space-y-6">
        <div>
          <h2 className="m-0 inline-flex items-center gap-2 text-[2.15rem] font-black leading-[1.05] tracking-tight text-black md:text-[2.45rem]">
            {plan.name}
            <ProBadgeIcon />
          </h2>
          <p className="mt-3 text-base leading-7 text-black md:text-[1.05rem]">
            {plan.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[1.6rem] font-black text-[#cfb25d] md:text-[1.75rem]">
            {plan.price}
          </span>
          <span className="text-sm leading-7 text-black md:text-[0.95rem]">
            {plan.priceNote}
          </span>
        </div>

        <Link
          to="/creator/checkout"
          className="block w-full rounded-full bg-black px-6 py-4 text-center text-[0.98rem] font-bold text-white transition-opacity hover:opacity-90"
        >
          {plan.cta}
        </Link>

        <ul className="space-y-5">
          {plan.features.map((feature) => (
            <li
              key={feature.label}
              className="flex items-center gap-4 text-base font-bold leading-7 text-black"
            >
              <span className="flex-shrink-0 text-black">{feature.icon}</span>
              <span className="flex-1">{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PricingCards() {
  return (
    <section id="pricing-cards" className="bg-white px-6 py-32 md:px-10 lg:px-24">
      <h2 className="mb-16 text-center text-5xl font-black tracking-tight text-black md:text-[3.35rem]">
        Available plan.
      </h2>
      <div className="mx-auto flex max-w-4xl justify-center">
        <PlanCard />
      </div>
    </section>
  );
}
