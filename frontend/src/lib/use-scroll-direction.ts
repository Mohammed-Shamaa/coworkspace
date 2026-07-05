'use client'
import { useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

export function useScrollDirection() {
  const { scrollY } = useScroll()
  const direction = useRef<'down' | 'up'>('down')
  const lastY = useRef(0)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = lastY.current
    lastY.current = latest
    if (latest > prev) direction.current = 'down'
    else if (latest < prev) direction.current = 'up'
  })

  return direction
}
