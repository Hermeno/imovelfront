interface Point { label: string; value: number }

interface AreaChartProps {
  data: Point[]
  color?: string
  height?: number
}

export function AreaChart({ data, color = '#2E9B6A', height = 140 }: AreaChartProps) {
  if (data.length < 2) {
    return (
      <svg width="100%" height={height}>
        <text x="50%" y="50%" textAnchor="middle" fontSize="12" fill="#928D83">Not enough data</text>
      </svg>
    )
  }

  const W = 300
  const H = height
  const PAD = { top: 10, right: 10, bottom: 24, left: 28 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const max = Math.max(...data.map((d) => d.value), 1)

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + innerH - (d.value / max) * innerH,
    label: d.label,
    value: d.value,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD.top + innerH} L${pts[0].x},${PAD.top + innerH} Z`

  // Y-axis ticks
  const ticks = [0, Math.round(max / 2), max]

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad_${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {ticks.map((t) => {
        const y = PAD.top + innerH - (t / max) * innerH
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="#EDEBE6" strokeWidth="1" />
            <text x={PAD.left - 3} y={y + 4} textAnchor="end" fontSize="9" fill="#928D83">{t}</text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#grad_${color.replace('#','')})`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* X labels — only show ~5 evenly spaced */}
      {pts.filter((_, i) => data.length <= 6 || i % Math.ceil(data.length / 5) === 0).map((p) => (
        <text key={p.label} x={p.x} y={H - 6} textAnchor="middle" fontSize="9" fill="#928D83">{p.label}</text>
      ))}

      {/* Dots */}
      {pts.map((p) => (
        <circle key={p.label} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  )
}
