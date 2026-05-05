export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)

  if (diff < 60)      return 'agora mesmo'
  if (diff < 3600)    return `há ${Math.floor(diff / 60)}min`
  if (diff < 86400)   return `há ${Math.floor(diff / 3600)}h`
  if (diff < 172800)  return 'há 1 dia'
  if (diff < 604800)  return `há ${Math.floor(diff / 86400)} dias`
  return date.toLocaleDateString('pt-BR')
}

export function getFileExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}
