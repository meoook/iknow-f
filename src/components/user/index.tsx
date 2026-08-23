import style from './user.module.scss'
import { useState, useRef } from 'react'
import { useAppSelector } from '../../hooks/useRedux'
import { useModalContext } from '../../services/ModalContext'
import type { IUser } from '../../types/auth.types'
import IconSprite from '../../elements/icon'
import ModalDeposit from '../../modals/deposit'
import NotificationBell from '../notification'
import Balance from '../../elements/balance'
import Avatar from '../../elements/avatar'
import Menu from '../../elements/menu'
import LoginButton from '../../elements/menu/login'

export default function UserMenu() {
  const { loading, user } = useAppSelector((state) => state.auth)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeTimeoutRef = useRef<number | null>(null)

  const open = () => setIsMenuOpen(true)
  const close = () => setIsMenuOpen(false)

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
      <div className='row center gap-2'>
        <div className='btn btn-icon hidden'>
          <div className='shimmer' />
        </div>
        <div className='btn btn-icon hidden'>
          <div className='shimmer' />
        </div>
      </div>
    )
  }

  return (
    <div className='row center gap-2'>
      {user ? <UserButtons user={user} /> : <LoginButton />}
      <div className='relative'>
        <div className={style.container} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={open}>
          {user ? (
            <button className='btn btn-icon ph-1'>
              <Avatar src={user.avatar} size='sm' />
              <div className={`arrow md-hide${isMenuOpen ? ' active' : ''}`}>
                <IconSprite name='arrow_down' />
              </div>
            </button>
          ) : (
            <button className='btn btn-icon md-hide'>
              <IconSprite name='menu' size={32} />
            </button>
          )}
          {isMenuOpen && (
            <div className={`${style.dropdown} noscroll md-hide`}>
              <Menu close={close} />
            </div>
          )}
        </div>
        <IconMask />
      </div>
    </div>
  )
}

const IconMask = () => {
  const { toggleDrawer } = useModalContext()
  return <button className={style.mask} onClick={() => toggleDrawer(true)} />
}

function UserButtons({ user }: { user: IUser }) {
  const { openModal } = useModalContext()
  return (
    <>
      <Balance name='Баланс' balance={user.balance} />
      <button className='btn blue lg-hide' onClick={() => openModal(ModalDeposit)}>
        Депозит
      </button>
      <NotificationBell />
    </>
  )
}
