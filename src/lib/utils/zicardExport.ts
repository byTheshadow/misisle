import type { ZicardExportPackage } from '@/types'

export function downloadJsonFile(filename: string, data: ZicardExportPackage) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
