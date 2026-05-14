import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// ── CSV ───────────────────────────────────────────────────────
export function exportCSV(rows: (string | number)[][], filename: string) {
  const csv = rows.map(r =>
    r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')
  ).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Excel ─────────────────────────────────────────────────────
export function exportXLSX(rows: (string | number)[][], filename: string, sheetName = 'Dados') {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// ── PDF ───────────────────────────────────────────────────────
export function exportPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const doc = new jsPDF({ orientation: 'landscape' })

  // Header
  doc.setFillColor(13, 43, 85)
  doc.rect(0, 0, 297, 20, 'F')
  doc.setTextColor(184, 151, 58)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('CASSIANO SOCIEDADE DE ADVOGADOS', 14, 13)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text(title, 297 - 14, 13, { align: 'right' })

  autoTable(doc, {
    head: [headers],
    body: rows.map(r => r.map(String)),
    startY: 25,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [13, 43, 85], textColor: [184, 151, 58], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [251, 243, 220] },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(120)
    doc.text(
      `Página ${i} de ${pageCount} — Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      148.5, 205, { align: 'center' }
    )
  }

  doc.save(`${filename}.pdf`)
}

// ── Dashboard export ──────────────────────────────────────────
export function exportEvaluationsCSV(avals: any[]) {
  const headers = [
    'Funcionário', 'Setor', 'Cargo', 'Nível', 'Tipo', 'Ciclo', 'Data',
    'Nota Final', 'Conceito', 'KPI', 'Técnico', 'Comportamental', 'Desenvolvimento', 'Ação'
  ]
  const rows = avals.map(a => [
    a.employee?.nome ?? '',
    a.employee?.setor ?? '',
    a.employee?.cargo ?? '',
    a.employee?.nivel ?? '',
    `${a.tipo}°`,
    a.ciclo ?? '',
    new Date(a.created_at).toLocaleDateString('pt-BR'),
    a.nota_final?.toFixed(2) ?? '',
    a.conceito ?? '',
    '',
    '',
    '',
    '',
    a.acao_recomendada ?? '',
  ])
  exportCSV([headers, ...rows], `Cassiano_Avaliacoes_${new Date().toISOString().slice(0, 10)}`)
}
