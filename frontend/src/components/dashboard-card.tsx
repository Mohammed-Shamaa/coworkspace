interface DashboardCardProps {
  label: string
  value: number | string
  bgColor: string
  textColor: string
  prefix?: string
}

export default function DashboardCard({ label, value, bgColor, textColor, prefix }: DashboardCardProps) {
  return (
    <div className="rounded-lg p-4 flex flex-col min-w-[160px]" style={{ backgroundColor: bgColor }}>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-lg font-bold" style={{ color: textColor }}>{prefix}</span>}
        <span className="text-2xl font-bold" style={{ color: textColor }}>{value}</span>
      </div>
      <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}
