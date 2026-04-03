import { useState, useCallback } from 'react'
import { useSnackbar } from 'notistack'

export type JobStatus = 'pending' | 'processing' | 'done' | 'failed'

export function useConversion() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const startConversion = useCallback(async (file: File, target: 'pdf' | 'docx' | 'md' | 'txt') => {
    setError(null)
    setIsUploading(true)

    enqueueSnackbar('Enviando arquivo...', { variant: 'info' })

    const form = new FormData()
    form.append('file', file)
    form.append('target', target)

    try {
      const res = await fetch('/api/convert', { method: 'POST', body: form })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Erro ao enviar arquivo'
        setError(errorMessage)
        enqueueSnackbar(errorMessage, { variant: 'error' })
        setIsUploading(false)
        return
      }

      const body = await res.json()
      setJobId(body.jobId)
      setStatus('pending')
      setIsUploading(false)
      enqueueSnackbar('Arquivo enviado! Processando conversão...', { variant: 'success' })
      return body.jobId
    } catch (err) {
      const errorMessage = 'Erro de conexão ao enviar arquivo'
      setError(errorMessage)
      enqueueSnackbar(errorMessage, { variant: 'error' })
      setIsUploading(false)
    }
  }, [enqueueSnackbar])

  const checkStatus = useCallback(async (id?: string) => {
    const jid = id ?? jobId
    if (!jid) return

    try {
      const res = await fetch(`/api/jobs/${jid}/status`)
      const body = await res.json()

      const previousStatus = status
      setStatus(body.status)

      // Mostrar toast apenas quando o status mudar para done ou failed
      if (previousStatus !== 'done' && body.status === 'done') {
        enqueueSnackbar('Conversão concluída! Arquivo pronto para download.', { variant: 'success' })
      }

      if (previousStatus !== 'failed' && body.status === 'failed') {
        const errorMessage = body.error || 'Erro ao processar conversão'
        setError(errorMessage)
        enqueueSnackbar(errorMessage, { variant: 'error' })
      }

      return body
    } catch (e) {
      const errorMessage = 'Erro ao checar status'
      setError(errorMessage)
      enqueueSnackbar(errorMessage, { variant: 'error' })
    }
  }, [jobId, status, enqueueSnackbar])

  const reset = useCallback(() => {
    setJobId(null)
    setStatus(null)
    setError(null)
    setIsUploading(false)
  }, [])

  return { jobId, status, error, isUploading, startConversion, checkStatus, reset }
}