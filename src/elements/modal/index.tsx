import style from './modal.module.scss'
import IconSprite from '../icon/Icon'
import { useModalContext } from '../../context/ModalContext'

export default function ModalRenderer() {
  const { modal, closeModal } = useModalContext()
  const handle = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }
  if (!modal) return null

  const { component: Component, props } = modal

  return (
    <div className={style.bg} onClick={closeModal}>
      <div className={style.modal} onClick={handle}>
        <button className={style.close} onClick={closeModal}>
          <IconSprite name='close' />
        </button>
        <Component {...props} close={closeModal} />
      </div>
    </div>
  )
}
