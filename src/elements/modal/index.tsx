import style from './modal.module.scss'
import IconSprite from '../icon/Icon'

interface ModalProps {
  modal: boolean
  close: () => void
  children?: React.ReactNode
}

export default function Modal({ modal, close, children }: ModalProps) {
  const handle = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }
  return (
    <>
      {modal && (
        <div className={style.bg} onClick={close}>
          <div className={style.modal} onClick={handle}>
            <button className={style.close} onClick={close}>
              <IconSprite name='close' />
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  )
}
