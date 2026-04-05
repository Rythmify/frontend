import React from "react";

export default function AdvertisingPage() {
  return (
    <div className="content">
      <p className="text-lg text-[var(--color-text-hover)] font-bold ">
        Advertising Settings
      </p>

      <p className="text-sm py-6 text-[var(--color-text)] max-w-3xl">
        We work with trusted advertising partners to show you content and
        advertisements for products and services you might like. Understand how
        your data may be used, who our partners are and manage your consent
        options.
      </p>

      <button className="px-5 py-2 text-sm font-bold bg-[var(--color-input-bg)] text-[var(--color-text-hover)] rounded-[var(--radius-sm)] hover:brightness-110 transition-all duration-150">
        Partners List
      </button>
    </div>
  );
}
