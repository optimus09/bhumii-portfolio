import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

interface PdfViewerModalProps {
  url: string
  title: string
  onClose: () => void
}

export function PdfViewerModal({ url, title, onClose }: PdfViewerModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const docRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null)
  const loadingTaskRef = useRef<pdfjsLib.PDFDocumentLoadingTask | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const loadingTask = pdfjsLib.getDocument({ url })
    loadingTaskRef.current = loadingTask

    loadingTask.promise
      .then((doc) => {
        if (cancelled) return
        docRef.current = doc
        setNumPages(doc.numPages)
        setPageNum(1)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this document.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      docRef.current = null
      loadingTaskRef.current = null
      loadingTask.destroy()
    }
  }, [url])

  useEffect(() => {
    const doc = docRef.current
    const canvas = containerRef.current?.querySelector('canvas')
    if (!doc || !canvas) return

    let cancelled = false
    doc.getPage(pageNum).then((page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale: 1.4 })
      const context = canvas.getContext('2d')
      if (!context) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      page.render({ canvasContext: context, viewport, canvas })
    })

    return () => {
      cancelled = true
    }
  }, [pageNum, numPages])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm p-4"
      style={{ background: 'rgba(10, 24, 38, 0.82)' }}
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        style={{ background: 'rgba(20, 51, 73, 0.85)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h4 className="text-sm font-semibold truncate pr-4 text-white">{title}</h4>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-[color:var(--gold)] text-xl leading-none px-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex flex-col items-center p-4 no-select"
          onContextMenu={(e) => e.preventDefault()}
        >
          {loading && <p className="text-white/60 text-sm">Loading preview…</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <canvas className={loading || error ? 'hidden' : 'max-w-full h-auto shadow-lg'} />
        </div>

        {numPages > 1 && (
          <div className="flex items-center justify-center gap-4 px-5 py-3 border-t border-white/10 font-mono-ui text-xs text-white/70">
            <button
              disabled={pageNum <= 1}
              onClick={() => setPageNum((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-white/20 disabled:opacity-30 hover:border-[color:var(--gold)]"
            >
              ← Prev
            </button>
            <span>
              Page {pageNum} of {numPages}
            </span>
            <button
              disabled={pageNum >= numPages}
              onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
              className="px-3 py-1 rounded border border-white/20 disabled:opacity-30 hover:border-[color:var(--gold)]"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
