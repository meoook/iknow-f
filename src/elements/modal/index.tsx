import style from './modal.module.scss'
import { useModalContext } from '../../services/ModalContext'
import { useEffect } from 'react'
import IconSprite from '../icon/Icon'

export default function ModalRenderer() {
  const { modal, closeModal } = useModalContext()
  const handle = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [closeModal])

  if (!modal) return null

  const { component: Component, props, closeOutside } = modal

  const handleOutsideClick = () => {
    if (closeOutside !== false) closeModal()
  }

  return (
    <div className={style.bg} onClick={handleOutsideClick}>
      <div className={style.modal} onClick={handle}>
        <Component {...props} close={closeModal} />
        <button className={style.close} onClick={closeModal}>
          <IconSprite name='close' />
        </button>
      </div>
    </div>
  )
}
