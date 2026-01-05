"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"

export function useCountAnimation(endValue: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (isInView && !hasStarted.current) {
      hasStarted.current = true
      let startTime: number | null = null
      let animationFrameId: number

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)

        // Use easeOutQuad for smoother landing
        const easeProgress = 1 - (1 - progress) * (1 - progress)
        setCount(Math.floor(easeProgress * endValue))

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrameId)
    }
  }, [isInView, endValue, duration])

  // Reset count if endValue changes (e.g. dataset switch)
  useEffect(() => {
    setCount(0)
    hasStarted.current = false
  }, [endValue])

  return { count, ref }
}
