interface TooltipProps {
  text: string
  children: React.ReactNode
}

const Tooltip = ({ text, children }: TooltipProps) => {
  return (
    <div className="relative group">
      {children}

      <div className="
        absolute top-full left-1/2 -translate-x-1/2 mt-1
        px-2 py-1 text-xs font-semibold text-white
        bg-[#1a1a1a] border border-border rounded-sm
        whitespace-nowrap shadow-md
        opacity-0 pointer-events-none
        group-hover:opacity-100
        transition-opacity delay-500 duration-200
        z-50
      ">
        {text}
      </div>
    </div>
  )
}

export default Tooltip