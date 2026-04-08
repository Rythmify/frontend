import { useState } from 'react'

export type FilterType = 'all' | 'like' | 'comment' | 'repost' | 'follow'

interface NotificationHeaderProps {
  selectedType: FilterType
  onTypeChange: (type: FilterType) => void
}

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'All notifications', value: 'all'     },
  { label: 'Likes',             value: 'like'    },
  { label: 'Comments',          value: 'comment' },
  { label: 'Reposts',           value: 'repost'  },
  { label: 'Follows',           value: 'follow'  },
]

const NotificationHeader = ({ selectedType, onTypeChange }: NotificationHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedLabel = FILTER_OPTIONS.find(o => o.value === selectedType)?.label

  return (
    <div data-test="notification-header" className="flex items-center justify-between">

      <h1 data-test="notification-header-title" className="text-2xl font-bold text-white">Notifications</h1>

      {/* Dropdown */}
      <div data-test="notification-filter-dropdown" className="relative">
        <button
          data-test="notification-filter-btn"
          className="flex items-center gap-2 bg-[#1a1a1a] border border-border text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-[#222] transition-colors"
          onClick={() => setIsOpen(p => !p)}
        >
          {selectedLabel}
          <i className="fa-solid fa-chevron-down text-[10px]" />
        </button>

        {isOpen && (
          <div data-test="notification-filter-menu" className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-border rounded-sm z-20 min-w-[180px] py-1 shadow-xl">
            {FILTER_OPTIONS.map(option => (
              <button
                key={option.value}
                data-test={`notification-filter-option-${option.value}`}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#2a2a2a] transition-colors ${
                  selectedType === option.value ? 'text-orange-500' : 'text-white'
                }`}
                onClick={() => {
                  onTypeChange(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default NotificationHeader