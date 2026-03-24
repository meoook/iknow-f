import { useEffect, useRef, useState } from 'react'

export const useClickOutside = (): [React.RefObject<HTMLDivElement | null>, boolean, () => void] => {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    const handler = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
    }
  })

  const toggle = () => setOpen((prev) => !prev)

  return [ref, open, toggle]
}

interface IScreenSize {
  width: number
  height: number
}

export const useScreenSize = () => {
  const [size, setSize] = useState<IScreenSize>({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return size
}

export const useComponentSize = <T extends HTMLElement>(componentRef: React.RefObject<T | null>) => {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = componentRef.current
    const handleResize = (entries: ResizeObserverEntry[]) => {
      setWidth(entries[0].contentRect.width)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    if (element) resizeObserver.observe(element)
    return () => {
      if (element) resizeObserver.unobserve(element)
    }
  }, [componentRef])
  return width
}

export const intlNumber = (lang: string, amount: number): string => {
  return Intl.NumberFormat(lang, {
    notation: 'compact',
    // compactDisplay: 'long',
    // maximumSignificantDigits: 3,
    maximumFractionDigits: 1,
  }).format(amount)
}

export const useHorizontalScroll = (useMask: boolean = false) => {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const updateMask = () => {
      if (!useMask) {
        el.style.maskImage = 'none'
        el.style.webkitMaskImage = 'none'
        return
      }

      const canScroll = el.scrollWidth > el.clientWidth
      if (!canScroll) {
        el.style.maskImage = 'none'
        el.style.webkitMaskImage = 'none'
        return
      }

      const isAtLeft = el.scrollLeft <= 0
      const isAtRight = Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) <= 1

      if (isAtLeft && isAtRight) {
        el.style.maskImage = 'none'
        el.style.webkitMaskImage = 'none'
      } else if (isAtLeft) {
        el.style.maskImage = 'linear-gradient(to left, transparent 0, black 40px)'
        el.style.webkitMaskImage = 'linear-gradient(to left, transparent 0, black 40px)'
      } else if (isAtRight) {
        el.style.maskImage = 'linear-gradient(to right, transparent 0, black 40px)'
        el.style.webkitMaskImage = 'linear-gradient(to right, transparent 0, black 40px)'
      } else {
        el.style.maskImage =
          'linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)'
        el.style.webkitMaskImage =
          'linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)'
      }
    }

    updateMask()

    const onScroll = () => updateMask()
    el.addEventListener('scroll', onScroll, { passive: true })

    const onResize = () => updateMask()
    window.addEventListener('resize', onResize)

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return

      const isAtLeft = el.scrollLeft <= 0
      const isAtRight = Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) <= 1

      if (e.deltaY < 0 && isAtLeft) return
      if (e.deltaY > 0 && isAtRight) return

      e.preventDefault()
      el.scrollBy({
        left: e.deltaY * 3,
        behavior: 'smooth',
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [useMask])

  return elRef
}
