interface BarChartProps {
  data: { label: string; value: number; color: string }[]
  height?: number
  horizontal?: boolean
}

export function BarChart({ data, height = 160, horizontal = false }: BarChartProps) {
  if (!data.length) return null
  const max = Math.max(...data.map((d) => d.value), 1)

  if (horizontal) {
    const rowH = 28
    const labelW = 80
    const totalH = data.length * rowH
    return (
      <svg width="100%" height={totalH} viewBox={`0 0 300 ${totalH}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const barW = ((d.value / max) * (300 - labelW - 20))
          const y = i * rowH + 4
          return (
            <g key={d.label}>
              <text x={labelW - 4} y={y + 14} textAnchor="end" fontSize="10" fill="#928D83">{d.label}</text>
              <rect x={labelW} y={y + 2} width={Math.max(barW, 2)} height={18} rx="4" fill={d.color} />
              <text x={labelW + barW + 4} y={y + 15} fontSize="10" fill="#4A4640" fontWeight="600">{d.value}</text>
            </g>
          )
        })}
      </svg>
    )
  }

  const barW = Math.floor((280 / data.length) - 6)
  return (
    <svg width="100%" height={height} viewBox={`0 0 300 ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const bh = Math.max((d.value / max) * (height - 30), 2)
        const x = 10 + i * (barW + 6)
        const y = height - 20 - bh
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={bh} rx="4" fill={d.color} />
            <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize="9" fill="#928D83">{d.label}</text>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="9" fill="#4A4640" fontWeight="600">{d.value}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
