import s from './tapbar.module.scss'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useModalContext } from '../../services/ModalContext'
import Drawer from '../drawer'
import IconSprite from '../../elements/icon'
import ModalBottomSearch from '../../modals/bottom/search'

export default function TapBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { openModal } = useModalContext()

  return (
    <>
      <div className={`${s.bar} hide md-flex`}>
        <Link to='/' className={s.item}>
          <IconSprite name='home' />
          <span>Главная</span>
        </Link>
        <button className={s.item} onClick={() => openModal(ModalBottomSearch, 'bottom')}>
          <IconSprite name='search' />
          <span>Поиск</span>
        </button>
        <button className={s.item} onClick={() => setIsDrawerOpen(true)}>
          <IconSprite name='menu2' />
          <span>Меню</span>
        </button>
      </div>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  )
}
