import style from './user.module.scss'
import { Link, NavLink } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useSingOutMutation } from '../../services/api'
import { useAppSelector } from '../../hooks/useRedux'
import IconSprite from '../../elements/icon/Icon'
import { NotificationBell } from '../notification'
import Balance from '../balance'

export default function UserMenu() {
  const { loading, user } = useAppSelector((state) => state.auth)
  const [signOut] = useSingOutMutation()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const closeTimeoutRef = useRef<number | null>(null)

  const logOut = () => {
    setIsMenuOpen(false)
    signOut()
  }

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
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
      {user ? (
        <>
          <Balance name='Баллы' balance={10720.21} />
          <Balance name='Крипто' balance={user.balance} currency='USD' />
          <Balance name='Кэш' balance={user.balance} currency='RUB' />
          <button className='btn blue'>Депозит</button>
          <NotificationBell />
        </>
      ) : (
        <Link className='btn blue' to='/login'>
          Войти
        </Link>
      )}
      <div className={style.container} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {user ? (
          <div className={style.btn}>
            <img className='avatar' src={user?.avatar || 'http://localhost/static/avatar/no_person.jpg'} alt='' />
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
          <div className={style.dropdown}>
            {user && (
              <>
                <Link className={style.user} to='/profile'>
                  <img className='avatar' src={user?.avatar || 'http://localhost/static/avatar/no_person.jpg'} alt='' />
                  <span>{user.address.slice(0, 6) + '...' + user.address.slice(-4)}</span>
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
            <button className={style.item} onClick={toggleTheme}>
              <IconSprite name='moon' size={20} color='var(--color-blue)' />
              {isDarkTheme ? 'Светлая тема' : 'Темная тема'}
            </button>
            {user && (
              <>
                <Link to='/my-requests' className={style.item}>
                  My Requests
                </Link>
                <Link to='/my-predictions' className={style.item}>
                  My Predictions
                </Link>
                <Link to='/my-bets' className={style.item}>
                  My Bets
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
