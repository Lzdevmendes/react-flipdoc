import { useState, useRef, useEffect } from "react"

export function useDragAndDrop(onFile?: (f: File) => void) {
  const [file, setFile] = useState<File | null>(null)
  const [over, setOver] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const onFileRef = useRef(onFile)
  onFileRef.current = onFile

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function onDragOver(e: DragEvent) { e.preventDefault(); setOver(true) }
    function onDragLeave(e: DragEvent) { e.preventDefault(); setOver(false) }
    function onDrop(e: DragEvent) {
      e.preventDefault()
      setOver(false)
      const f = e.dataTransfer?.files?.[0]
      if (f) { setFile(f); onFileRef.current?.(f) }
    }

    el.addEventListener('dragover', onDragOver)
    el.addEventListener('dragleave', onDragLeave)
    el.addEventListener('drop', onDrop)

    return () => {
      el.removeEventListener('dragover', onDragOver)
      el.removeEventListener('dragleave', onDragLeave)
      el.removeEventListener('drop', onDrop)
    }
  }, [])

  return { ref, file, setFile, over }
}
