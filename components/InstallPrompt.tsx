"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  if (isStandalone) return null

  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 md:hidden">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">Install App</p>
            <p className="text-muted-foreground">Tap share button and "Add to Home Screen"</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsIOS(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-card text-card-foreground border rounded-lg shadow-lg p-4 max-w-sm flex items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-full">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Install App</h3>
          <p className="text-sm text-muted-foreground">Install for a better experience</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowPrompt(false)}>
            Not now
          </Button>
          <Button size="sm" onClick={handleInstallClick}>
            Install
          </Button>
        </div>
      </div>
    </div>
  )
}
