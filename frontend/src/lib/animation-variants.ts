const ease = [0.25, 0.1, 0.25, 1] as const

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

export const fadeDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

export function byDirection(dir: 'down' | 'up') {
  return dir === 'down' ? fadeUp : fadeDown
}
