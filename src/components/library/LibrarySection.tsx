export const CARD_WIDTH = "w-[180px] sm:w-[200px] md:w-[220px] lg:w-[230px]";

export function LibrarySection({
  title,
  action,
  "data-test": dataTest,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  "data-test"?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3" data-test={dataTest}>
      <div className="flex items-center justify-between pb-2 sm:pb-4">
        <h2
          className="text-white font-semibold text-base sm:text-[19px] text-left"
          data-test={dataTest ? `${dataTest}-title` : undefined}
        >
          {title}
        </h2>
        {action}
      </div>
      <div
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide"
        data-test={dataTest ? `${dataTest}-cards` : undefined}
      >
        {children}
      </div>
    </div>
  );
}
