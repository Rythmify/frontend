import React from 'react'

export default function Spinner() {
 return (
    <div className="flex items-center justify-center py-10">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

