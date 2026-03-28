import { createContext, useCallback, useContext, useRef, useState, useEffect } from 'react'

export type ModalType = 'common' | 'bottom'

interface ModalState {
  component: React.ComponentType<any>
  props?: Record<string, any>
  closeOutside?: boolean
  type: ModalType
}

interface ModalContextValue {
  modal: ModalState | null
  openModal: (component: React.ComponentType<any>, type?: ModalType, props?: Record<string, any>) => void
  closeModal: () => void
  setCloseOutside: (value: boolean) => void
  isDrawerOpen: boolean
  toggleDrawer: (state?: boolean) => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const scrollY = useRef(0)

  const toggleDrawer = useCallback((state?: boolean) => {
    setIsDrawerOpen((prev) => (state !== undefined ? state : !prev))
  }, [])

  const isLocked = !!modal || isDrawerOpen

  useEffect(() => {
    if (isLocked) {
      if (document.body.style.position !== 'fixed') {
        scrollY.current = window.scrollY
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY.current}px`
        document.body.style.width = '100%'
      }
    } else {
      if (document.body.style.position === 'fixed') {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY.current)
      }
    }
  }, [isLocked])

  const openModal = useCallback(
    (component: React.ComponentType<any>, type: ModalType = 'common', props?: Record<string, any>) => {
      // Модалки type=bottom по умолчанию закрываются по клику вне области (closeOutside: true),
      // а type=common оставляем как было (false)
      setModal({ component, props, closeOutside: type === 'bottom' ? true : false, type })
    },
    [],
  )

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  const setCloseOutside = useCallback((closeOutside: boolean) => {
    setModal((prev) => (prev ? { ...prev, closeOutside } : null))
  }, [])

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal, setCloseOutside, isDrawerOpen, toggleDrawer }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModalContext must be used within ModalProvider')
  return ctx
}
