import { createContext, useCallback, useContext, useRef, useState } from 'react'

interface ModalState {
  component: React.ComponentType<any>
  props?: Record<string, any>
  closeOutside?: boolean
}

interface ModalContextValue {
  modal: ModalState | null
  openModal: (component: React.ComponentType<any>, props?: Record<string, any>) => void
  closeModal: () => void
  setCloseOutside: (value: boolean) => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const scrollY = useRef(0)

  const openModal = useCallback((component: React.ComponentType<any>, props?: Record<string, any>) => {
    scrollY.current = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY.current}px`
    document.body.style.width = '100%'
    setModal({ component, props, closeOutside: false })
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, scrollY.current)
    setModal(null)
  }, [])

  const setCloseOutside = useCallback((closeOutside: boolean) => {
    setModal((prev) => (prev ? { ...prev, closeOutside } : null))
  }, [])

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal, setCloseOutside }}>{children}</ModalContext.Provider>
  )
}

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModalContext must be used within ModalProvider')
  return ctx
}
