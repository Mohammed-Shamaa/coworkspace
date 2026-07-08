interface DashboardCardProps {
  label: string
  value: number | string
  bgColor: string
  textColor: string
  prefix?: string
}

export default function DashboardCard({ label, value, bgColor, textColor, prefix }: DashboardCardProps) {
  return (
    <div
      className="card-premium p-4 flex flex-col min-w-[160px] group cursor-default"
      style={{ background: bgColor, borderColor: 'transparent' }}
    >
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-lg font-bold transition-transform duration-200 group-hover:scale-105" style={{ color: textColor }}>{prefix}</span>}
        <span className="text-2xl font-bold transition-all duration-200 group-hover:scale-105" style={{ color: textColor }}>{value}</span>
      </div>
      <span className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}
