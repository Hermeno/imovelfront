export function exportToCSV(rows: Record<string, any>[], filename: string) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportPropertiesToCSV(properties: any[]) {
  exportToCSV(
    properties.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      listing_type: p.listingType ?? '',
      property_type: p.propertyType ?? '',
      price: p.price ?? '',
      bedrooms: p.bedrooms ?? '',
      bathrooms: p.bathrooms ?? '',
      city: p.city ?? '',
      state: p.state ?? '',
      neighborhood: p.neighborhood ?? '',
      agent: p.agentName ?? '',
      contact_phone: p.contactPhone ?? '',
      created_at: p.createdAt,
    })),
    'ulmap_properties'
  )
}

export function exportLeadsToCSV(leads: any[]) {
  exportToCSV(
    leads.map((l) => ({
      id: l.id,
      name: l.interestedName,
      email: l.email,
      phone: l.phone ?? '',
      whatsapp: l.whatsapp,
      status: l.status,
      source: l.source,
      property: l.propertyTitle ?? '',
      message: l.message ?? '',
      created_at: l.createdAt,
    })),
    'ulmap_leads'
  )
}
