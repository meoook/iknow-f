import style from './header.module.scss'
import { useState } from 'react'
import { useAppSelector } from '../../hooks/useRedux'
import { Link, NavLink } from 'react-router-dom'
import { useModal } from '../../hooks/hooks'
import Modal from '../../elements/modal'
import ModalLogin from '../../modals/login'
import IconSprite from '../../elements/icon/Icon'
import Logo from './logo'
import UserMenu from '../userMenu'

export default function Header() {
  const { user, loading } = useAppSelector((state) => state.auth)
  const [filter, setFilter] = useState('top')
  const [modal, open, close] = useModal()

  const handleF = (e: React.MouseEvent<HTMLButtonElement>) => {
    setFilter(e.currentTarget.name)
  }

  return (
    <>
      <Modal close={close} modal={modal}>
        <ModalLogin />
      </Modal>
      <header>
        <div className={style.head}>
          <Link className={style.logo} to='/'>
            <Logo />
            <h2>Vanga</h2>
          </Link>
          <div className='row center gap20 w100'>
            <form className={style.input}>
              <input name='search' placeholder='Поиск' />
              <IconSprite name='search' />
            </form>
            {!user && !loading && (
              <button className={style.tultip} onClick={open}>
                <IconSprite name='tultip' size={14} />
                <span>Как это работает?</span>
              </button>
            )}
          </div>
          <UserMenu />
        </div>
        <nav>
          <div className='row center gap8'>
            <button className={`${style.item} ${filter === 'top' ? 'active' : ''}`} name='top' onClick={handleF}>
              <IconSprite name='trend' size={16} />
              <span>Топ</span>
            </button>
            <button className={`${style.item} ${filter === 'volume' ? 'active' : ''}`} name='volume' onClick={handleF}>
              <IconSprite name='volume' size={16} />
              <span>Объем</span>
            </button>
            <button className={`${style.item} ${filter === 'diff' ? 'active' : ''}`} name='diff' onClick={handleF}>
              <IconSprite name='diff' size={16} />
              <span>Разница</span>
            </button>
            <button className={`${style.item} ${filter === 'star' ? 'active' : ''}`} name='star' onClick={handleF}>
              <IconSprite name='star' size={16} />
              <span>Новые</span>
            </button>
            <button className={`${style.item} ${filter === 'finish' ? 'active' : ''}`} name='finish' onClick={handleF}>
              <IconSprite name='finish' size={16} />
              <span>Финиш</span>
            </button>
          </div>
          <div className='hr' />
          <div className='row center gap8 w100'>
            <NavLink to='/' className={style.item}>
              Все
            </NavLink>
            <NavLink to='/politics' className={style.item}>
              Политика
            </NavLink>
            <NavLink to='/sport' className={style.item}>
              Спорт
            </NavLink>
            <NavLink to='/finance' className={style.item}>
              Финансы
            </NavLink>
            <NavLink to='/crypto' className={style.item}>
              Крипта
            </NavLink>
            <NavLink to='/geopolitics' className={style.item}>
              Геополитика
            </NavLink>
            <NavLink to='/technology' className={style.item}>
              Технологии
            </NavLink>
            <NavLink to='/culture' className={style.item}>
              Культура
            </NavLink>
            <NavLink to='/world' className={style.item}>
              Мир
            </NavLink>
            <NavLink to='/economy' className={style.item}>
              Экономика
            </NavLink>
            <NavLink to='/elections' className={style.item}>
              Выборы
            </NavLink>
            <NavLink to='/mentions' className={style.item}>
              {/* Высказывания */}
              Упоминания
            </NavLink>
            {/* <NavLink to='/other' className={style.item}>
              Другие
            </NavLink> */}
          </div>
        </nav>
      </header>
    </>
  )
}
