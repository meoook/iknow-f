import { useState } from 'react'
import style from './tapbar.module.scss'
import IconSprite from '../../elements/icon/Icon'
import { Link } from 'react-router-dom'
import Drawer from '../drawer'
import { useModalContext } from '../../services/ModalContext'
import ModalBottomSearch from '../../modals/bottom/search'

export default function TapBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { openModal } = useModalContext()

  return (
    <>
      <div className={style.bar}>
        <Link to='/' className={style.item}>
          <IconSprite name='home' />
          <span>Главная</span>
        </Link>
        <button className={style.item} onClick={() => openModal(ModalBottomSearch, 'bottom')}>
          <IconSprite name='search' />
          <span>Поиск</span>
        </button>
        <button className={style.item} onClick={() => setIsDrawerOpen(true)}>
          <IconSprite name='menu2' />
          <span>Меню</span>
        </button>
      </div>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  )
}
