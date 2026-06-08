'use client'

interface Option {
  id: string
  label: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <div className="flex bg-paper2 rounded-[13px] p-1">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className="flex-1 py-[11px] rounded-[10px] border-none cursor-pointer text-[14px] font-bold transition-colors"
          style={{
            fontFamily: 'var(--font-display)',
            background: value === opt.id ? 'var(--paper)' : 'transparent',
            color: value === opt.id ? 'var(--ink)' : 'var(--sub)',
            boxShadow: value === opt.id ? '0 2px 8px -3px rgba(45,74,107,.4)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
