interface Slice { label: string; value: number; color: string }

export function DonutChart({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return (
    <svg width="100%" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="50" fill="none" stroke="#EDEBE6" strokeWidth="22" />
      <text x="70" y="76" textAnchor="middle" fontSize="12" fill="#928D83">No data</text>
    </svg>
  )

  const R = 50
  const cx = 70
  const cy = 70
  let angle = -90

  const slices = data.map((d) => {
    const pct = d.value / total
    const startAngle = angle
    angle += pct * 360
    return { ...d, startAngle, endAngle: angle, pct }
  })

  function arc(start: number, end: number) {
    const toRad = (a: number) => (a * Math.PI) / 180
    const x1 = cx + R * Math.cos(toRad(start))
    const y1 = cy + R * Math.sin(toRad(start))
    const x2 = cx + R * Math.cos(toRad(end))
    const y2 = cy + R * Math.sin(toRad(end))
    const large = end - start > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`
  }

  return (
    <svg width="100%" height="140" viewBox="0 0 220 140">
      {slices.map((s) => (
        <path
          key={s.label}
          d={arc(s.startAngle, s.endAngle)}
          fill="none"
          stroke={s.color}
          strokeWidth="22"
          strokeLinecap="butt"
        />
      ))}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1A1815">{total}</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill="#928D83">total</text>

      {/* Legend */}
      {slices.map((s, i) => (
        <g key={s.label} transform={`translate(130, ${14 + i * 20})`}>
          <rect x="0" y="2" width="10" height="10" rx="3" fill={s.color} />
          <text x="14" y="12" fontSize="10" fill="#4A4640">{s.label}</text>
          <text x="85" y="12" fontSize="10" fill={s.color} fontWeight="700" textAnchor="end">{s.value}</text>
        </g>
      ))}
    </svg>
  )
}
