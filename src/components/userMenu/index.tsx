import style from './user.module.scss'
import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useSingOutMutation } from '../../services/api'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import { toggleTheme } from '../../store/app.slice'
import { useModalContext } from '../../services/ModalContext'
import type { IUser } from '../../types/auth.types'
import IconSprite from '../../elements/icon/Icon'
import ModalDeposit from '../../modals/deposit'
import ModalLogin from '../../modals/login'
import NotificationBell from '../notification'
import Balance from '../balance'
import Avatar from '../../elements/avatar'
import Toggle from '../toggle'

export default function UserMenu() {
  const { loading, user } = useAppSelector((state) => state.auth)
  const { theme } = useAppSelector((state) => state.app)
  const dispatch = useAppDispatch()
  const [signOut] = useSingOutMutation()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeTimeoutRef = useRef<number | null>(null)

  const logOut = () => {
    setIsMenuOpen(false)
    signOut()
  }

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsMenuOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false)
    }, 300)
  }

  if (loading) {
    return (
      <div className='row center gap8'>
        <div className={style.shimmer}>
          <div className='shimmer' />
        </div>
        <div className={style.shimmer}>
          <div className='shimmer' />
        </div>
      </div>
    )
  }

  return (
    <div className='row center gap8'>
      {user ? <UserButtons user={user} /> : <NotAuthButtons />}
      <div className={style.container} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {user ? (
          <div className={style.btn}>
            <Avatar src={user.avatar} />
            <div className={`arrow${isMenuOpen ? ' active' : ''}`}>
              <IconSprite name='arrow_down' />
            </div>
          </div>
        ) : (
          <button className='btn btn-icon'>
            <IconSprite name='menu' />
          </button>
        )}
        {isMenuOpen && (
          <div className={`${style.dropdown} noscroll`}>
            {user && (
              <>
                <Link className={style.user} to='/profile'>
                  <Avatar src={user.avatar} />
                  <div>
                    <span>{user.address.slice(0, 6) + '...' + user.address.slice(-6)}</span>
                    {user.username !== user.address && <span className={style.username}>{user.username}</span>}
                  </div>
                </Link>
                <hr />
              </>
            )}
            <button className={style.item}>
              <IconSprite name='crown' size={20} color='var(--color-brand)' />
              <span>Таблица лидеров</span>
            </button>
            <button className={style.item}>
              <IconSprite name='activity' size={20} color='var(--color-red)' />
              <span>Активность</span>
            </button>
            <button className={style.item} onClick={handleToggleTheme}>
              <IconSprite name='moon' size={20} color='var(--color-blue)' />
              <span>Темная тема</span>
              <div className='w100'></div>
              <Toggle checked={theme === 'dark'} />
            </button>
            {user && (
              <>
                <Link to='/predictions' className={style.item}>
                  Мое участие
                </Link>
              </>
            )}
            <hr />
            <a className={style.link} href='/terms'>
              Условия использования
            </a>
            <a className={style.link} href='/about'>
              О приложении
            </a>
            <a className={style.link} href='/docs'>
              Документация
            </a>
            {user && (
              <button className={style.item} onClick={logOut}>
                <IconSprite name='exit' size={20} color='var(--color-red)' />
                <span className='color-red'>Выйти</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function UserButtons({ user }: { user: IUser }) {
  const { openModal } = useModalContext()
  return (
    <>
      <Balance name='Баллы' balance={user.balances.POINT} />
      <Balance name='Кэш' balance={user.balances.CASH} currency='USD' />
      <button className='btn blue' onClick={() => openModal(ModalDeposit)}>
        Депозит
      </button>
      <NotificationBell />
    </>
  )
}

function NotAuthButtons() {
  const { openModal } = useModalContext()
  return (
    <>
      <button className='btn blue' onClick={() => openModal(ModalLogin)}>
        Войти
      </button>
    </>
  )
}
