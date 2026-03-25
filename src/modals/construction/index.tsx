import style from './construction.module.scss'
import { useEffect } from 'react'
import { useModalContext } from '../../services/ModalContext'

export default function UnderConstruction() {
  const { setCloseOutside, closeModal } = useModalContext()

  useEffect(() => {
    setCloseOutside(true)
  }, [setCloseOutside])

  return (
    <div className={`${style.wrapper} noscroll`}>
      <div className={style.cunstruction} />
      <h1>Сайт в стадии разработки</h1>
      <div className='color-gray'>
        Некторые функции могут не работать или работать некорректно. Приносим извинения за неудобства.
      </div>
      <button className='btn blue big' onClick={closeModal}>
        OK
      </button>
      <div className={style.cunstruction} />
    </div>
  )
}
