'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScannerStatus } from '@/lib/enums/scanner-status.enum'

interface QrCodeScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanned: (value: string) => void
}

interface BarcodeDetectorInstance {
  detect: (source: unknown) => Promise<{ rawValue?: string }[]>
}

function createBarcodeDetector(): BarcodeDetectorInstance | null {
  const ctor = (
    globalThis as {
      BarcodeDetector?: new (opts: {
        formats: string[]
      }) => BarcodeDetectorInstance
    }
  ).BarcodeDetector
  return ctor ? new ctor({ formats: ['qr_code'] }) : null
}

function useQrScanner(
  open: boolean,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onSuccess: (value: string) => void,
): { status: ScannerStatus; errorMessage: string | null } {
  const streamRef = React.useRef<MediaStream | null>(null)
  const intervalRef = React.useRef<number | null>(null)
  const [status, setStatus] = React.useState<ScannerStatus>(ScannerStatus.IDLE)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const { t } = useTranslation()

  const stop = React.useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const stream = streamRef.current
    if (stream) {
      for (const track of stream.getTracks()) track.stop()
    }
    streamRef.current = null
    const video = videoRef.current
    if (video) video.srcObject = null
  }, [videoRef])

  const start = React.useCallback(async () => {
    setStatus(ScannerStatus.STARTING)
    setErrorMessage(null)

    const detector = createBarcodeDetector()
    if (!detector) {
      setStatus(ScannerStatus.ERROR)
      setErrorMessage(t('form.qrNotSupported'))
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('Video element not available')

      video.srcObject = stream
      await video.play()
      setStatus(ScannerStatus.SCANNING)

      intervalRef.current = window.setInterval(() => {
        if (video.readyState < 2) return

        void detector
          .detect(video)
          .then((results) => {
            const value = results[0]?.rawValue
            if (value) {
              stop()
              onSuccess(value)
            }
            return undefined
          })
          .catch(() => {
            /* ignore detection errors */
          })
      }, 250)
    } catch (error) {
      setStatus(ScannerStatus.ERROR)
      setErrorMessage(t('form.qrPermissionDenied'))
      console.error('QR scanner error:', error)
      stop()
    }
  }, [onSuccess, stop, t, videoRef])

  React.useEffect(() => {
    if (!open) {
      setStatus(ScannerStatus.IDLE)
      setErrorMessage(null)
      stop()
      return
    }
    void start()
    return stop
  }, [open, start, stop])

  return { status, errorMessage }
}

export function QrCodeScannerDialog({
  open,
  onOpenChange,
  onScanned,
}: QrCodeScannerDialogProps): React.JSX.Element {
  const { t } = useTranslation()
  const videoRef = React.useRef<HTMLVideoElement | null>(null)

  const handleSuccess = React.useCallback(
    (value: string) => {
      onScanned(value)
      onOpenChange(false)
    },
    [onScanned, onOpenChange],
  )

  const { status, errorMessage } = useQrScanner(open, videoRef, handleSuccess)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('form.qrScannerTitle')}</DialogTitle>
          <DialogDescription>
            {t('form.qrScannerDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-muted aspect-video overflow-hidden rounded-md border">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
          <ScannerStatusMessage
            errorMessage={errorMessage}
            status={status}
            t={t}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('form.cancel')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ScannerStatusMessage({
  status,
  errorMessage,
  t,
}: {
  status: ScannerStatus
  errorMessage: string | null
  t: (key: string) => string
}): React.JSX.Element | null {
  if (status === ScannerStatus.STARTING) {
    return (
      <p className="text-muted-foreground text-sm">{t('form.qrStarting')}</p>
    )
  }
  if (status === ScannerStatus.SCANNING) {
    return (
      <p className="text-muted-foreground text-sm">{t('form.qrScanning')}</p>
    )
  }
  if (status === ScannerStatus.ERROR) {
    return (
      <p className="text-destructive text-sm">
        {errorMessage ?? t('form.qrError')}
      </p>
    )
  }
  return null
}
