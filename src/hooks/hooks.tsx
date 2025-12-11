import { useEffect, useRef, useState } from 'react'

export const useClickOutside = (): [React.RefObject<HTMLDivElement | null>, boolean, React.MouseEventHandler] => {
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

export const useComponentSize = <T extends HTMLElement>(componentRef: React.RefObject<T>) => {
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

export const useModal = (): [boolean, () => void, () => void] => {
  const [modal, setModal] = useState(false)
  const open = () => {
    setModal(true)
  }
  const close = () => {
    setModal(false)
  }
  return [modal, open, close]
}

export const intlNumber = (lang: string, amount: number): string => {
  return Intl.NumberFormat(lang, {
    notation: 'compact',
    compactDisplay: 'short',
    // maximumSignificantDigits: 3,
    maximumFractionDigits: 1,
  }).format(amount)
}
