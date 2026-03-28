import style from './user.module.scss'
import { useState, useRef } from 'react'
import { useSingOutMutation } from '../../services/api'
import { useAppSelector } from '../../hooks/useRedux'
import { useModalContext } from '../../services/ModalContext'
import type { IUser } from '../../types/auth.types'
import IconSprite from '../../elements/icon'
import ModalDeposit from '../../modals/deposit'
import ModalLogin from '../../modals/login'
import NotificationBell from '../notification'
import Balance from '../../elements/balance'
import Avatar from '../../elements/avatar'
import MenuUser from '../../elements/menu/user'
import MenuLinks from '../../elements/menu/links'

export default function UserMenu() {
  const { loading, user } = useAppSelector((state) => state.auth)
  const [signOut] = useSingOutMutation()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeTimeoutRef = useRef<number | null>(null)

  const logOut = () => {
    setIsMenuOpen(false)
    signOut()
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
            <div className={`arrow mw1000${isMenuOpen ? ' active' : ''}`}>
              <IconSprite name='arrow_down' />
            </div>
          </div>
        ) : (
          <button className='btn btn-icon'>
            <IconSprite name='menu' size={32} />
          </button>
        )}
        {isMenuOpen && (
          <div className={`${style.dropdown} noscroll`}>
            {user && <MenuUser user={user} />}
            <MenuLinks authed={!!user} />
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
      <div className={style.balance}>
        <Balance name='Баллы' balance={user.balances.POINT} />
        <Balance name='Кэш' balance={user.balances.CASH} currency='USD' />
      </div>
      <button className='btn blue mw1000' onClick={() => openModal(ModalDeposit)}>
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
